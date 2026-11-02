# Coulson 的个人主页

[打开网站](https://coulson-joyful.github.io)

这里放我的个人介绍、做过的项目、博客和常用链接。网站是静态 HTML、CSS 和 JavaScript，没有构建步骤；博客用 CDN 版 marked.js 渲染 Markdown。

## 在本机看效果

在仓库根目录运行：

```bash
python3 -m http.server 8080
```

然后打开 `http://localhost:8080`。不要直接双击 HTML：页面需要用 `fetch` 读取 JSON 和文章，`file://` 打开会受到浏览器限制。

## 平时改哪里

个人介绍、技能、精选项目和链接在 `data/profile.json`，一般不用改 HTML。

主页作品区和“全部项目”页会从 `https://api.github.com/users/Coulson-joyful/repos` 获取公开、未归档、非 fork 仓库。获取失败时，主页使用 `profile.json` 里的 `featuredProjects`。这里不会展示私有仓库。

写博客需要两步：

1. 在 `posts/` 新建 `YYYY-MM-slug.md`。
2. 在 `posts/manifest.json` 顶部加入索引，再提交并推送。

```json
{
  "slug": "YYYY-MM-slug",
  "title": "标题",
  "date": "YYYY-MM-DD",
  "summary": "一句话摘要",
  "tags": ["标签"]
}
```

## 文件位置

```text
index.html          主页：介绍、简历、技能、作品、博客预览和链接
blog/index.html     博客列表和文章
projects/index.html 全部公开项目
posts/              Markdown 文章和 manifest.json
assets/css/         全站样式和文章样式
assets/js/          主页、博客和项目列表脚本
assets/img/         头像等图片
data/profile.json   个人信息和精选内容
tarot/              星语塔罗的公开隐私、支持和来源说明
favicon.svg         网站图标
404.html            未找到页面
robots.txt          爬虫规则
```

## 发布

这个用户站的仓库是 `Coulson-joyful/Coulson-joyful.github.io`，默认分支为 `main`。GitHub Pages 使用 `main` 的根目录作为发布来源。修改后正常提交、推送，等待 Pages 构建完成，再看线上效果。

如果是在新机器上接着维护：

```bash
git clone git@github.com:Coulson-joyful/Coulson-joyful.github.io.git
cd Coulson-joyful.github.io
```

不需要重新 `git init` 或重设已有仓库。SSH 密钥和 `gh` 登录状态属于本机配置，换机器后要单独确认。

如果以后使用自定义域名，在根目录添加 `CNAME`，并在域名服务商处配置 GitHub Pages 所需的 DNS。

公开支持页面应与 App 的实际行为一致。尤其是 `tarot/` 下的隐私、购买和数据说明，不要只改开发工程里的备份。
