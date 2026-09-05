---
title: Hermes 容器配置笔记：Git 走代理、通用分流与 fallback 模型
status: writing
tags:
  - Hermes
  - Docker
  - SOCKS5
  - Privoxy
  - Git
  - 运维
---

# Hermes 容器配置笔记：Git 走代理、通用分流与 fallback 模型

<!-- TODO：补充开头背景——Hermes 容器内访问 GitHub/Telegram 等海外服务需要走 SOCKS5 代理出口，本文记录三类配置：Git 代理、通用分流方法、fallback 模型管理。 -->

## 一、让 Hermes 容器内的 Git 走 SOCKS5 代理访问 GitHub

按 Telegram 的现有链路，把 GitHub 也接到同一个 SOCKS5 出口：

```text
Hermes 容器 → host.docker.internal:10808 → SSH 隧道 → AWS/WARP → GitHub
```

由于执行环境不能直接 SSH 修改服务器，需在主服务器 `36.138.103.18:30008` 上执行以下命令。

### 1. 配置容器内 Git 代理

```bash
docker exec hermes-agent sh -lc '
set -eu
mkdir -p /opt/data/.ssh

git config --file /opt/data/.gitconfig http.proxy socks5h://host.docker.internal:10808
git config --file /opt/data/.gitconfig https.proxy socks5h://host.docker.internal:10808

# 将 GitHub 的 SSH 地址自动改走 HTTPS
git config --file /opt/data/.gitconfig url."https://github.com/".insteadOf "git@github.com:"
git config --file /opt/data/.gitconfig url."https://github.com/".insteadOf "ssh://git@github.com/"

chmod 600 /opt/data/.gitconfig
'
```

### 2. docker-compose 注入环境变量

在 `docker-compose.yml` 的 `hermes-agent` 服务中加入（如果已有 `environment:`，只添加这一行，不要重复创建）：

```yaml
environment:
  GIT_CONFIG_GLOBAL: /opt/data/.gitconfig
```

随后重建容器：

```bash
cd /opt/ai-agent
docker compose up -d --force-recreate hermes-agent
```

### 3. 验证代理和 GitHub

```bash
docker exec hermes-agent sh -lc '
export GIT_CONFIG_GLOBAL=/opt/data/.gitconfig
curl --socks5-hostname host.docker.internal:10808 -I https://github.com
git ls-remote https://github.com/git/git.git HEAD
'
```

在实际仓库内检查：

```bash
docker exec -it hermes-agent bash
cd /你的仓库目录
git remote -v
git ls-remote origin
```

如果看到 `github.com` 返回 HTTP 响应，并且 `git ls-remote` 能返回提交哈希，说明 GitHub 已经和 Telegram 一样走 AWS 出口。

### 注意事项

- 这个方案只影响容器里的 Git，不会把所有 Hermes 流量都强制走 AWS。
- 私有仓库推送建议使用 HTTPS + GitHub PAT；不要把令牌直接写进远程地址。

---

## 二、以后添加网站到代理的通用方法

<!-- TODO：补充原理说明——SSH 隧道/WARP 只是“路”，网站名单要在入口层配置，不要每个网站都改 aws-socks.service。 -->

通用原则：**SSH 隧道/WARP 只是“路”，网站名单要在入口层配置**。以后不要每个网站都去改 `aws-socks.service`，那个服务只负责维持出口。

现有两个入口：

- SOCKS5：`192.168.48.1:10808`
- HTTP 代理 / Privoxy：`192.168.48.1:10809`

### 1. 临时使用：命令行参数

```bash
# 走 HTTP 代理
curl -x http://192.168.48.1:10809 https://github.com

# 或直接走 SOCKS5，并让 DNS 也走代理
curl --socks5-hostname 192.168.48.1:10808 https://github.com
```

### 2. 长期分流：Privoxy 域名规则

在 `/etc/privoxy/config` 中配置：

```text
# /etc/privoxy/config
forward-socks5t .github.com/ 192.168.48.1:10808 .
forward-socks5t .githubusercontent.com/ 192.168.48.1:10808 .
forward-socks5t .githubassets.com/ 192.168.48.1:10808 .
forward-socks5t .api.telegram.org/ 192.168.48.1:10808 .
forward / .
```

然后重启：

```bash
systemctl restart privoxy
```

以后要新增网站，只需加一行：

```text
forward-socks5t .example.com/ 192.168.48.1:10808 .
```

注意：要把网站实际用到的域名都加上。比如 GitHub 不只是 `github.com`，还可能有 `githubusercontent.com`、`githubassets.com`。

### 3. 容器内的写法

在 Hermes 容器里用，地址写 Docker 内部域名：

```text
http://host.docker.internal:10809
```

或：

```text
socks5h://host.docker.internal:10808
```

### 4. 工具级配置

Git 的通用配置：

```bash
git config --global http.proxy http://host.docker.internal:10809
git config --global https.proxy http://host.docker.internal:10809
```

<!-- TODO：可补充 npm/pip 等工具的 proxy 配置示例。 -->

### 总结

**临时用命令参数，长期用 Privoxy 域名规则，工具级配置交给 Git/npm/pip 等自己的 proxy 设置。以后换海外服务器时，只需要改 SSH 隧道目标和密钥，这些域名规则不用重做。**

---

## 三、重新配置 fallback 模型

<!-- TODO：补充背景——fallback 用于主模型故障时自动切换供应商，记录于 8 月 28 日。 -->

针对旧机器人 `default` profile，运行：

```bash
docker exec -it -u hermes hermes-agent \
  /opt/hermes/.venv/bin/hermes -p default fallback add
```

它会进入交互式选择：

1. 选择 fallback 的模型供应商。
2. 选择或输入模型。
3. 如果没有凭据，按提示配置 API Key。
4. 保存后检查。

### 建议：不要与主模型同一供应商

不要用与主模型相同的供应商。当前主模型是 Moonshot/Kimi，所以 fallback 最好使用另一个可用供应商（例如 OpenRouter）；否则 Kimi 本身故障时，fallback 也可能一起失效。

如果重新使用 OpenRouter，先添加凭据：

```bash
docker exec -it -u hermes hermes-agent \
  /opt/hermes/.venv/bin/hermes -p default auth add openrouter
```

然后添加 fallback：

```bash
docker exec -it -u hermes hermes-agent \
  /opt/hermes/.venv/bin/hermes -p default fallback add
```

### 管理现有 fallback

```bash
# 查看
docker exec -u hermes hermes-agent \
  /opt/hermes/.venv/bin/hermes -p default fallback list

# 删除
docker exec -it -u hermes hermes-agent \
  /opt/hermes/.venv/bin/hermes -p default fallback remove

# 清空
docker exec -it -u hermes hermes-agent \
  /opt/hermes/.venv/bin/hermes -p default fallback clear
```

### 配置后重启 Gateway

```bash
docker exec hermes-agent \
  /command/s6-svc -r /run/service/gateway-default
```

> `taskbot` 的命令只需把 `-p default` 改为 `-p taskbot`。
