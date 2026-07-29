/* ===========================================================
   blog.js — 博客列表 + 文章渲染(marked.js via CDN)
   =========================================================== */

const $ = (sel, root = document) => root.querySelector(sel);

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

/* ---------- 主题(与主页一致) ---------- */
function initTheme() {
  const root = document.documentElement;
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.setAttribute("data-theme", stored || (prefersDark ? "dark" : "light"));
  $("#themeToggle")?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });
}

/* ---------- 加载 manifest ---------- */
async function loadManifest() {
  const res = await fetch("../posts/manifest.json");
  if (!res.ok) throw new Error("manifest 加载失败");
  const posts = await res.json();
  return [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
}

/* ---------- 列表视图 ---------- */
function renderList(posts) {
  const list = $("#postList");
  list.innerHTML = posts.length
    ? posts
        .map(
          (post) => `
      <a class="card" href="?post=${encodeURIComponent(post.slug)}">
        <h2 class="card__title">${esc(post.title)}</h2>
        <div class="card__meta">${esc(post.date)}</div>
        <p class="card__desc">${esc(post.summary || "")}</p>
        <div class="card__tags">${(post.tags || [])
          .map((t) => `<span class="tag">${esc(t)}</span>`)
          .join("")}</div>
      </a>`
        )
        .join("")
    : '<p class="muted">还没有文章。</p>';
}

/* ---------- 文章视图 ---------- */
async function renderPost(slug, posts) {
  const meta = posts.find((p) => p.slug === slug);
  const container = $("#postContent");

  if (!meta) {
    container.innerHTML = '<p class="muted">找不到这篇文章。</p>';
    return;
  }

  document.title = `${meta.title} · Coulson`;

  try {
    const res = await fetch(`../posts/${encodeURIComponent(slug)}.md`);
    if (!res.ok) throw new Error("md 加载失败");
    const md = await res.text();

    const header = `
      <header class="post__header">
        <h1 class="post__title">${esc(meta.title)}</h1>
        <p class="post__meta">${esc(meta.date)}${
      meta.tags?.length ? " · " + meta.tags.map(esc).join(" · ") : ""
    }</p>
      </header>`;

    const body =
      typeof marked !== "undefined"
        ? marked.parse(md, { mangle: false, headerIds: true })
        : `<pre>${esc(md)}</pre>`;

    container.innerHTML = header + body;
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p class="muted">文章加载失败。</p>';
  }
}

/* ---------- 视图切换 ---------- */
function showView(isPost) {
  $("#listView").hidden = isPost;
  $("#postView").hidden = !isPost;
}

/* ---------- 启动 ---------- */
async function init() {
  initTheme();
  $("#year").textContent = new Date().getFullYear();

  const slug = new URLSearchParams(location.search).get("post");

  let posts = [];
  try {
    posts = await loadManifest();
  } catch (err) {
    console.error(err);
    $("#postList").innerHTML = '<p class="muted">博客加载失败。</p>';
    return;
  }

  if (slug) {
    showView(true);
    await renderPost(slug, posts);
    window.scrollTo(0, 0);
  } else {
    showView(false);
    renderList(posts);
  }
}

document.addEventListener("DOMContentLoaded", init);
