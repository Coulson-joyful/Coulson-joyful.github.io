# Hello World —— 这个博客是怎么搭起来的

欢迎来到我的博客!这是第一篇示例文章,用来验证整套「零构建」发文流程。

## 为什么选择纯静态

- **好维护**:没有框架、没有构建步骤,一个文件夹就是全部。
- **免费托管**:GitHub Pages 直接托管 `Coulson-joyful.github.io`。
- **写 Markdown 就能发**:新增一篇文章 = 加一个 `.md` + 在 `manifest.json` 里加一行。

## 它是怎么工作的

前端用 CDN 版的 [marked.js](https://marked.js.org/) 在浏览器里把 Markdown 渲染成 HTML:

```js
const md = await fetch(`posts/${slug}.md`).then(r => r.text());
container.innerHTML = marked.parse(md);
```

就这么简单。列表页读取 `posts/manifest.json`,把每篇文章渲染成卡片;点进去带上 `?post=slug`,文章视图再去拉对应的 md 文件。

## 怎么写下一篇

1. 在 `posts/` 新建 `2026-08-my-post.md`。
2. 在 `posts/manifest.json` 顶部加一条索引:

   ```json
   {
     "slug": "2026-08-my-post",
     "title": "我的新文章",
     "date": "2026-08-01",
     "summary": "一句话摘要。",
     "tags": ["标签"]
   }
   ```

3. 提交、推送,几分钟后就上线了。

> 就这样,享受写作吧 ✍️
