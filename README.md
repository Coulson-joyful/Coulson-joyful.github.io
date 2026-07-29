# Coulson-joyful.github.io

Coulson 的个人主页 —— **开发者作品集 + 简历名片 + 博客 + 链接聚合**。
纯静态 HTML / CSS / JS,零构建、零依赖(仅博客用 CDN 版 marked.js),托管于 GitHub Pages。

## 目录结构

```
├── index.html            # 单页主页:Hero → 简历 → 技能 → 作品 → 博客预览 → 链接
├── blog/index.html       # 博客列表 / 文章视图
├── posts/                # 文章 md + manifest.json 索引
├── assets/css/           # style.css(全站) + blog.css(文章排版)
├── assets/js/            # main.js(主页) + blog.js(博客)
├── assets/img/           # 头像等资源
├── data/profile.json     # ★ 日常只改这个文件:个人信息 / 技能 / 精选项目 / 链接
├── favicon.svg / 404.html / robots.txt
```

## 本地预览

```bash
cd ~/Developer/Coulson-joyful.github.io
python3 -m http.server 8080
# 打开 http://localhost:8080
```

> 必须用本地服务器打开(不能直接 `file://`),否则 `fetch` JSON / md 会被浏览器拦截。

## 更新内容

- **改个人信息 / 技能 / 精选项目 / 链接**:只编辑 `data/profile.json`,不用碰 HTML。
- **作品区**:自动从 `https://api.github.com/users/Coulson-joyful/repos` 拉公开仓库(按 star / 更新时间排序,取前 6);拉取失败时自动降级为 `profile.json` 里的 `featuredProjects`。

## 新增一篇博客

1. 在 `posts/` 新建 `YYYY-MM-slug.md`。
2. 在 `posts/manifest.json` 顶部加一条索引:

   ```json
   {
     "slug": "YYYY-MM-slug",
     "title": "标题",
     "date": "YYYY-MM-DD",
     "summary": "一句话摘要",
     "tags": ["标签"]
   }
   ```

3. 提交并推送。

## 部署(GitHub Pages)

仓库必须建在 **Coulson-joyful** 名下,仓库名必须是 `Coulson-joyful.github.io`。

```bash
git init && git add -A && git commit -m "init: personal site"
git branch -M main
git remote add origin git@github.com:Coulson-joyful/Coulson-joyful.github.io.git
git push -u origin main
```

然后仓库 **Settings → Pages → Source = `main` 分支根目录**,几分钟后 `https://coulson-joyful.github.io` 生效。

> 账号:GitHub 账号为 **Coulson-joyful**,SSH 密钥(`~/.ssh/id_ed25519`)已绑定该账号,`gh` CLI 也是该账号;用户站 Pages 会在推送到 `main` 后自动发布。

## 自定义域名(可选)

在仓库根目录添加 `CNAME` 文件(内容为你的域名),并在域名服务商处配置 DNS 指向 GitHub Pages。
