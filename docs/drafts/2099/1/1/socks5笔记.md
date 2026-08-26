```
systemctl stop aws-socks.service

ssh-keygen -R 新服务器IP -f /root/.ssh/known_hosts

ssh-keyscan -H 新服务器IP >> /root/.ssh/known_hosts

chmod 600 /root/.ssh/known_hosts

systemctl restart aws-socks.service
不过有两个注意事项：
1. ssh-keyscan 只确认“服务器当前提供了什么指纹”，不验证它是否属于你的服务器。最安全的做法是先在云控制台核对指纹，再写入 known_hosts。
2. 如果只是服务器重启、IP 没变、SSH 主机密钥没变，就不需要执行这组命令。
以后更换服务器通常需要同步修改四项：
海外服务器 IP
SSH 登录用户名
SSH 私钥路径或私钥文件
known_hosts 中的主机指纹
推荐完整流程：
# 1. 更新 aws-socks.service 中的 IP、用户名、私钥路径
nano /etc/systemd/system/aws-socks.service

# 2. 更新主机指纹
systemctl stop aws-socks.service
ssh-keygen -R 新IP -f /root/.ssh/known_hosts
ssh-keyscan -H 新IP >> /root/.ssh/known_hosts
chmod 600 /root/.ssh/known_hosts

# 3. 先手动验证密钥
ssh -o BatchMode=yes \
  -o IdentitiesOnly=yes \
  -i /opt/ai-agent/hermes-data/webkey2.pem \
  用户名@新IP true

# 4. 重载并启动隧道
systemctl daemon-reload
systemctl restart aws-socks.service
systemctl status aws-socks.service --no-pager
ss -lntup | grep -E '10808|10809|10810'
如果只是更换 IP，但仍使用同一台服务器、同一套 SSH 主机密钥，理论上可以直接更新指纹；如果是新建或重装服务器，必须更新。
```

# 你的方案缺少的地方

## 1. Ubuntu版本问题

你的服务器：

```
cat /etc/os-release
```

应该显示：

```
Ubuntu 22.04
```

代号：

```
jammy
```

但是你的脚本：

```
echo "deb ... noble main"
```

对应：

```
Ubuntu 24.04
```

所以错误：

```
libtss2-esys-3.0.2-0t64
```

完全符合预期。

------

## 正确写法应该动态判断版本

不要固定：

```
noble
```

应该：

```
source /etc/os-release

echo "deb [signed-by=/usr/share/keyrings/cloudflare-warp-archive-keyring.gpg] https://pkg.cloudflareclient.com/ ${VERSION_CODENAME} main" \
| sudo tee /etc/apt/sources.list.d/cloudflare-client.list
```

你的机器：

自动变成：

```
jammy
```

以后 Ubuntu 24：

自动：

```
noble
```

这样博客方案更通用。

我建议你补充：

### Ubuntu版本自动识别

不要：

```
noble
```

改：

```
${VERSION_CODENAME}
```

------

### Docker访问宿主机代理

增加：

```
extra_hosts:
  - "host.docker.internal:host-gateway"
```

否则：

```
Hermes Docker
    |
    X
127.0.0.1:40000
```

会失败。

