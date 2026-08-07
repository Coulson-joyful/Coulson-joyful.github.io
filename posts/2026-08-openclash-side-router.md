家里有两台路由器:红米 AX3000,Wi-Fi 6,又快又能覆盖全屋;还有一台 GL-MT3000 旅行路由器,刷了 OpenWrt + OpenClash 能科学上网,但巴掌大、信号只够一个房间。于是长期两张 Wi-Fi 并存——要速度和覆盖连红米,要科学上网连 GL,来回切,别扭。

这篇记录怎么把两者合成**一张又快又广、还自动分流的 Wi-Fi**。

## 目标

- 全屋只连红米那一张 Wi-Fi(保留它的速度和覆盖);
- 境外流量自动走代理、国内直连,**全程无需手动切换**;
- 不刷红米(高通平台刷机麻烦、有风险),复用已经配好的 GL。

## 思路:让 GL 当「旁路由」

主路由还是红米(继续拨号、发 Wi-Fi),GL 退居幕后只做一件事——跑 OpenClash 分流。让设备的**网关指向 GL**:流量先到 GL,由它决定「直连还是走节点」,再交回红米出网。

```
光猫 ── 红米 AX3000(主路由 / Wi-Fi)
             └── 红米 LAN ──网线── GL-MT3000 LAN(旁路由 / OpenClash)
```

关键点:GL 用 **LAN 口**接红米 LAN(**不是** WAN 口),让两台进同一个子网。

## 步骤

### 1. 把 GL 改成旁路由

核心是:LAN 固定成红米子网里的一个静态 IP,网关指红米;关掉 WAN;GL 自己发 DHCP,并把「网关 / DNS = GL 自己」下发给全屋。

```sh
# LAN 固定在红米子网,网关/DNS 指红米
uci set network.lan.ipaddr='192.168.31.2'
uci set network.lan.gateway='192.168.31.1'
uci set network.lan.dns='223.5.5.5 119.29.29.29'
# 关掉 WAN(不再接光猫)
uci set network.wan.disabled='1'
# GL 发 DHCP,把「网关(option 3)/ DNS(option 6)= GL 自己」下发
uci add_list dhcp.lan.dhcp_option='3,192.168.31.2'
uci add_list dhcp.lan.dhcp_option='6,192.168.31.2'
uci commit && reboot
```

### 2. 关掉红米的 DHCP

这是「全屋无感」的总开关:让所有设备改用 GL 发的地址(网关 = GL)。红米原厂固件里「局域网设置 → DHCP 服务」有开关,关掉保存即可。

> 普通家用固件不一定给关 DHCP;红米这版给了,省去了解锁 SSH 的折腾。

### 3. 改线

把 GL 从光猫上拔下来,用一根网线接 **GL LAN ↔ 红米 LAN**;红米↔光猫那根不动。

## 几个踩过的坑

- **hysteria2 必须用 Mihomo(Clash Meta)内核**,原版 Clash 直接起不来。
- **验证节点要用真实客户端**。在路由器本机 `curl -x 127.0.0.1:<port>` 反复超时,差点让我误判节点坏了;而 LAN 里的电脑走透明代理(tproxy)其实一切正常——两条路径不同,别被本机测试骗了。
- **依赖代价**:全屋网关变成 GL 之后,GL 一旦关机 / 死机,全屋会断网——这是「无感」的固有代价。想临时退回直连,把红米的 DHCP 再打开即可。

## 结果

连红米 Wi-Fi 的任何设备:国内网站直连(百度 200),境外自动走节点(Google 204),出口 IP 落在境外。一张 Wi-Fi,既快又广,还自动科学上网,全程无感。红米负责发网,GL 当隐形的「大脑」做分流。

## 出门:把 GL 带走,红米先复原

别忘了 GL 本职还是台旅行路由器。要把它带出门,不能拔了就走——这套方案的隐藏前提是「全屋网关已经交给 GL、红米的 DHCP 是关的」,GL 一走,家里所有设备拿不到地址,**全屋断网**。顺序得反过来:先救红米,再改 GL。

**第一步:红米变回完整主路由。** 登录红米后台,把第 2 步关掉的 DHCP 重新打开即可——设备重连后网关和 DNS 自然回到红米自己,全屋恢复上网(直连、无代理)。等于把那个「总开关」拨回去。

**第二步:GL 变回旅行路由。** 把旁路由那套配置反着撤掉:LAN 改回独立网段、重新自己发 DHCP、上游从「借红米 LAN」换回 WAN 口接当地网络。

```sh
# LAN 改回独立网段,自己当网关(不再指红米)
uci set network.lan.ipaddr='192.168.8.1'
uci -q delete network.lan.gateway
uci -q delete network.lan.dns
# 撤掉「网关 / DNS 都指向自己」的 DHCP 下发
uci -q delete dhcp.lan.dhcp_option
# 重新启用 WAN,接当地网络
uci set network.wan.disabled='0'
uci commit && reboot
```

到了酒店 / 机场,GL 的上游可以是三选一:网线插 **WAN 口**、用 **Repeater** 中继现场 Wi-Fi、或 **USB Tethering** 借手机热点。设备照旧连 GL 自己的 Wi-Fi,OpenClash 分流原样能用——只是这回它从「隐形的大脑」变回了独当一面的小路由。
