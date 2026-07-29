# 用 iMessage 双向遥控 Mac 上的 Claude Code

出门在外,只带着手机,却想让家里那台 Mac 上的 Claude Code 帮我改个文件、跑个脚本、建篇日记——怎么办?

我用 **iMessage** 做了一条双向遥控通道:**手机发一条消息 → Mac 上的 Claude 读到并执行 → 结果再推回手机**。不装任何服务端、不开公网端口,纯本地 + iMessage 自带的端到端同步。

代码在这里(公开):[Coulson-joyful/claude-iMessage-notify](https://github.com/Coulson-joyful/claude-iMessage-notify)。

## 整体思路

核心只有三件事:

1. **读**:Mac 上的「信息」App 会把所有 iMessage 存进本地的 `~/Library/Messages/chat.db`(SQLite)。监听这个库,就能拿到手机发来的新消息。
2. **执行**:把消息内容交给 `claude -p "<指令>"` 跑,Claude 在我的工作目录里干活。
3. **回**:用 AppleScript(`osascript`)驱动「信息」把结果发回同一个会话,手机就收到了。

用一个「**自己发给自己**」的 iMessage 会话当管道:手机和 Mac 登录同一个 Apple ID,消息天然在两端同步,不需要第二个账号,也不需要任何中转服务器。

## 三个把我坑惨的技术点

真正难的不是搭骨架,而是三个反直觉的坑。它们也是这个项目里最有意思的部分。

### 坑 1:怎么区分「我发的指令」和「Claude 的回复」?

命令和回复走同一个会话,就有个经典的**自读死循环**风险:Claude 发出的回复也落进 `chat.db`,如果轮询逻辑把它当成新指令再喂给 Claude……就炸了。

最初我用 SQLite 里的方向位 `is_from_me`(`0` = 收到的,`1` = 自己发的)来区分。**结果发现它根本不可靠**:同一 Apple ID 下,手机发给自己的消息,在 Mac 落库时 `is_from_me` 时 `0` 时 `1`,而且偶尔在两个自聊线程各落一份。于是出现两种诡异现象——有的指令**执行两遍**,有的**一次都不执行**。排查了很久才定位到这个「薛定谔的方向位」。

**最终解法**:不再依赖方向位,改用一条硬规则——**所有指令必须以 `cc ` 前缀开头**。

- 用户指令长这样:`cc 帮我建今天的日记`;
- Claude 自己的回复/通知**不带 `cc `**,天然被过滤掉 → 死循环护栏。
- 再加一层**内容去重**:同一条指令文本在一个时间窗口(默认 180s)内只执行一次,解决"落两份"导致的重复执行。

### 坑 2:想要「消息一到就触发」,但文件监听收不到事件

一开始是每 15 秒轮询一次 `chat.db`,延迟明显。想改成事件驱动——文件一变就查。

自然会想到 `fswatch` / FSEvents。**但它对这个场景完全失效**:`~/Library/Messages` 是 macOS 的 **TCC 保护目录**,FSEvents 的事件流**只投递给本身持有「完全磁盘访问(FDA)」的进程**。`fswatch` 是个独立二进制、没被授 FDA,于是能"建立监听"却**永远收到零个事件**——看起来在跑,实际一动不动。

**正解是 `kqueue`**(见 `bin/watch.py`):`kqueue` 的 `EVFILT_VNODE` 直接盯一个**已经 `open()` 的文件描述符**,只要进程本身有读权限(读 `chat.db` 的 FDA 我已经有了),写入就能收到 `NOTE_WRITE` 通知,**绕开了 FSEvents 那层 TCC 过滤**。改完之后实测发消息 **<1 秒**触发,整条链路(发送→触发→识别→执行→回发)约 1 秒跑通。

> 教训:在 macOS 上碰权限保护目录,先想清楚「事件是投给谁的」,别默认所有监听 API 都平权。

### 坑 3:后台常驻时,「完全磁盘访问」到底该授权给谁?

要让它脱离 Obsidian、开机自启,就用 `launchd`(LaunchAgent)常驻。结果 `poll.py` 一到后台就报 `authorization denied` 读不了 `chat.db`。

macOS 的 FDA 认的是「**责任进程 responsible process**」,不一定是你想的那个程序:

- 在**终端**里跑 → 责任主体可能是 `claude` 本体,授 `claude` 就行;
- 在 **Obsidian 插件**里跑 → 进程链是 `Obsidian → Helper → claude`,责任主体上浮到 **Obsidian.app**,得授 `Obsidian.app`;
- 在 **launchd 后台**跑 → 后台**不继承**前台的 FDA,真正读盘的责任进程是 `/bin/bash` → **必须单独给 `/bin/bash` 开完全磁盘访问**。

一个自检命令,报 `denied` 就说明当前责任主体没授权:

```bash
sqlite3 ~/Library/Messages/chat.db "SELECT 1"   # 返回 1 = 通过
```

## 还顺手解决的两件事

- **正文解码**:新版 macOS 上,消息正文常存在 `attributedBody` 这个二进制字段里(不是纯文本列)。`poll.py` 按长度前缀精确解码,中文 / emoji / 多行都能还原。
- **完成通知**:接了一个 Claude 的 `Stop` 钩子——每次答完自动判断:如果结尾像是在"等你操作"就发「🤖 在等你操作」,否则发「✅ 完成」。这样长任务跑完手机会主动响,不用一直盯着。

## 架构小结

```
手机 (iMessage, 前缀 cc)
        │  端到端同步(同一 Apple ID)
        ▼
Mac: chat.db  ──kqueue 监听(<1s)──▶  poll.py 识别(cc 前缀 + 去重)
        │
        ▼
   claude -p "<指令>"  在工作目录执行
        │
        ▼
   osascript 驱动「信息」把结果发回同一会话 ──▶ 手机收到
   (launchd 常驻 + /bin/bash 授 FDA)
```

整套东西没有服务器、没有公网暴露,消息全程走 Apple 的端到端加密同步,遥控入口就是我每天都在用的「信息」App。

代码与配置说明都在仓库里:[Coulson-joyful/claude-iMessage-notify](https://github.com/Coulson-joyful/claude-iMessage-notify)。有问题欢迎来提 issue。
