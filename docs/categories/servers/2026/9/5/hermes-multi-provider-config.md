---
title: Hermes Agent 多模型供应商配置实战1
author: LoneMonk
date: '2026/9/5 12:00'
description: 记录 Hermes Agent 接入第三方中转模型时遇到的 rate-limiting、brotli 解码错误、reasoning_text 400、多 profile 独立配置与多 Key 凭据池轮换的完整排障过程。
isTop: false
categories:
  - servers
tags:
  - Hermes
  - AI Agent
  - 模型配置
  - 限流
  - 代理
  - Docker
---

# Hermes Agent 多模型供应商配置实战

> 本文记录在使用 Hermes Agent（Nous Research 开源 AI Agent）接入第三方模型中转站时，从频繁报错到稳定运行的全过程，涵盖限流识别、brotli 解码错误定位、多 Key 凭据池轮换、多 Profile 隔离等实战经验。

## 背景

Hermes Agent 通过 Docker 部署在云服务器上，通过 Telegram/飞书作为交互入口。模型走 `ps.air-outer.com` 中转站的 `deepseek-v4-flash`（`codex_responses` 模式）。

运行中反复出现两类报错：

```
⏱️ The model provider is rate-limiting requests. Please wait a moment and try again.
⚠️ The model provider failed after retries. I kept raw provider details out of chat; check gateway logs for diagnostics.
```

---

## 坑 1：rate-limiting ≠ 网络问题，先看 errors.log 再下结论

**表象**：频繁报 rate-limiting，以为是代理或网络问题。

**真相**：日志里真正的错误是 `DecodingError: brotli: decoder process called with data when 'can_accept_more_data()' is False` —— 这是 **brotli 压缩解码失败**，不是限流！

**定位方法**：
```bash
# Hermes 原始错误在 errors.log（非脱敏）
tail -50 /opt/data/logs/errors.log
# 关键字段：error_type、provider、summary
```

**根因**：容器全局代理（Privoxy → AWS WARP 链路）在转发流式响应时损坏了 brotli 压缩流；或 httpx 0.28 + brotlicffi 1.2 与中转站的 brotli 实现不兼容。

**解决**：在 custom provider 配置中强制禁用 brotli：
```yaml
custom_providers:
  - name: Ps.air-outer.com
    base_url: https://ps.air-outer.com/v1
    key_env: HERMES_CUSTOM_PS_AIR_OUTER_COM_API_KEY
    model: deepseek-v4-flash
    api_mode: codex_responses
    extra_headers:
      Accept-Encoding: gzip, deflate   # 关键：不声明 br，服务器就不回 brotli
```

> 💡 httpx 默认发送 `Accept-Encoding: gzip, deflate, br`，只要我们不声明 `br`，上游就不会返回 brotli 压缩流，绕开解码 bug。

---

## 坑 2：no_proxy 白名单——哪些流量该直连

**背景**：容器内设了全局代理（`http_proxy`/`https_proxy`/`all_proxy` → Privoxy），所有出站都过代理链。

**症状**：国内中转 API（ps.air-outer.com）调用频繁超时/断连——它本身是国内服务器，不需要走 AWS WARP。

**解决**：把国内直连的域名加进 no_proxy：
```yaml
# docker-compose.yml
- no_proxy=localhost,127.0.0.1,...,feishu.cn,sensenova.cn,ps.air-outer.com
```

> 💡 `sensenova.cn`（商汤）也在白名单里，因为它同样国内直连。

---

## 坑 3：HTTP 400 `reasoning_text must be passed back`

**表象**：
```
HTTP 400: The `reasoning_text` in the thinking mode must be passed back to the API.
```

**原因**：`codex_responses` 模式 + thinking 模型（deepseek-v4-flash）要求多轮对话把上轮的 reasoning 内容回传，中转站接口较严格。

**影响**：触发后 Hermes 自动切 fallback 模型（如 kimi-k2.6）继续服务，**下一条消息自动转回主模型**——fallback 是 turn-scoped（按轮次），不是永久切换。

---

## 坑 4：多 Key 凭据池（Credential Pool）轮换

**需求**：同一中转商多个 key，一个限流自动换下一个。

**Hermes 原生支持**：
```bash
# 同一 provider 添加多个 key（重复执行）
hermes auth add custom:ps.air-outer.com --type api-key --api-key "key1"
hermes auth add custom:ps.air-outer.com --type api-key --api-key "key2"

# 查看池
hermes auth list
# custom:ps.air-outer.com (2 credentials)

# 清除某 key 的限流冷却
hermes auth reset custom:ps.air-outer.com
```

**轮换策略**：`round_robin` / `least_used` / `random` / `fill_first`，429 自动冷却 1 小时，401 冷却 5 分钟。

> ⚠️ **auth.json 权限陷阱**：通过 root SSH 执行 `hermes auth` 会把 auth.json 属主改成 root，导致 hermes 用户读不到 → `PermissionError`。**修复**：`chown hermes:hermes auth.json && chmod 600`。

---

## 坑 5：多 Profile 独立配置（taskbot 不继承 default）

**发现**：taskbot 是独立 profile（`hermes -p taskbot gateway run`），有**自己的 config.yaml、.env、auth.json**，不继承 default profile 的修复！

**症状**：default 修好了 brotli，taskbot 仍报错。

**解决**：每个 profile 单独检查/配置：
- default: `/opt/data/config.yaml` + `/opt/data/.env` + `/opt/data/auth.json`
- taskbot: `/opt/data/profiles/taskbot/config.yaml` + 对应 .env/auth.json

> 💡 排查多机器人报错时，先确认是哪个 profile，再定位对应配置文件。

---

## 坑 6：省钱分层架构（auxiliary + delegation）

Hermes 支持**分层指定模型**，主对话用一个模型，辅助任务用免费/低价模型：

```yaml
# 主模型（额度多的中转）
model:
  default: deepseek-v4-flash
  provider: custom:ps.air-outer.com

# 主模型挂了自动切 fallback
fallback_model:
  provider: kimi-coding-cn
  model: kimi-k2.6

# 辅助任务用免费模型
auxiliary:
  vision:
    provider: custom:glm5.2-sen   # 商汤 sensenova 免费图文模型
    model: sensenova-6.8-flash-lite
  compression:
    provider: openrouter
    model: z-ai/glm-5.2:free      # OpenRouter 免费模型
  web_extract:
    provider: openrouter
    model: z-ai/glm-5.2:free
  free_only: true                 # 强制只用免费模型，防止误扣费

# 子代理也用免费模型
delegation:
  max_iterations: 250
  model: z-ai/glm-5.2:free
  provider: openrouter
```

**省钱要点**：
- OpenRouter 有 19 个 `:free` 免费模型（glm-5.2:free、minimax-m3:free 等）
- 商汤 sensenova-6.8-flash-lite 支持图文且定价全 0
- `auxiliary.free_only: true` 是安全锁，防辅助任务意外走付费通道

---

## 坑 7：SSH 反复断连——ControlMaster 连接复用

**症状**：沙箱连服务器频繁 `kex_exchange_identification: read: Connection reset by peer`——不是网络故障，是 **sshd 连接节流**（MaxStartups / fail2ban 对快速重连的惩罚）。

**解决**：ControlMaster 连接复用（一次握手，后续复用）：
```bash
mkdir -p ~/.ssh/cm
ssh -o ControlMaster=auto -o ControlPersist=10m -o ControlPath=~/.ssh/cm/%C \
    -o ConnectTimeout=30 -o ServerAliveInterval=10 \
    -p 30008 root@36.138.103.18 'cmd'
```
- 首次调用建控制连接，10 分钟内后续调用复用，不再触发节流
- 断线时**等 10-15 秒重试一次**，绝不猛打重试
- 批量命令合并成一次 SSH 调用

---

## 总结

| 报错 | 真因 | 解法 |
|------|------|------|
| rate-limiting ⏱️ | 中转站 RPM 配额 或 brotli 解码误报 | 加 fallback + 多 key 池 |
| failed after retries ⚠️ | brotli 解码损坏 / reasoning_text 400 | 禁 br 压缩 / fallback 兜底 |
| Provider authentication failed | auth.json 权限(root) / 坏 entry | chown hermes / auth reset |
| SSH 反复断连 | sshd 节流（非网络） | ControlMaster 复用 |
| 辅助任务悄悄扣费 | auxiliary 走 auto→OpenRouter 付费 | free_only: true |

**核心经验**：
1. 报错先查 `errors.log` 原始记录，别被表面提示误导
2. 改完配置要**重启对应 profile 的 gateway** 才生效
3. 多 profile 各自独立配置，修一个不等于全好
4. 通过 root 操作 auth.json 后务必 chown 回 hermes
5. 省钱靠 `auxiliary.free_only` + 免费模型 + 分层配置
