/* ===========================================================
   main.js — 渲染 profile.json、动效、主题切换、GitHub 拉取
   =========================================================== */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ---------- 小工具:安全文本 ---------- */
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

/* ---------- SVG 图标 ---------- */
const ICONS = {
  github:
    '<svg class="link-card__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z"/></svg>',
  mail:
    '<svg class="link-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  rss:
    '<svg class="link-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1.5" fill="currentColor" stroke="none"/></svg>',
  link:
    '<svg class="link-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>',
};
const iconFor = (name) => ICONS[name] || ICONS.link;

/* ---------- 主题切换 ---------- */
function initTheme() {
  const root = document.documentElement;
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.setAttribute("data-theme", stored || (prefersDark ? "dark" : "light"));

  const btn = $("#themeToggle");
  btn?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });
}

/* ---------- 移动端导航 ---------- */
function initNav() {
  const burger = $("#navBurger");
  const links = $(".nav__links");
  burger?.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
  });
  $$(".nav__links a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("is-open");
      burger?.setAttribute("aria-expanded", "false");
    })
  );
}

/* ---------- 滚动淡入 ---------- */
function initReveal() {
  const els = $$(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  els.forEach((el) => io.observe(el));
}

/* ---------- 渲染 profile ---------- */
function renderProfile(p) {
  // Hero
  if (p.avatar) $("#heroAvatar").src = p.avatar;
  $("#heroName").textContent = p.name || p.handle || "";
  $("#heroTagline").textContent = p.tagline || "";
  $("#heroIntro").textContent = p.intro || "";
  $("#heroLocation").textContent = p.location || "";
  $("#footerName").textContent = p.name || p.handle || "Coulson";
  document.title = `${p.name || p.handle} · 个人主页`;

  // 简历
  if (p.resume?.summary) $("#resumeSummary").textContent = p.resume.summary;
  const exp = $("#experience");
  exp.innerHTML = (p.resume?.experience || [])
    .map(
      (x) => `
      <article class="timeline__item">
        <p class="timeline__role">${esc(x.role)}</p>
        <p class="timeline__meta">${esc(x.org)} · ${esc(x.period)}</p>
        <p class="timeline__detail">${esc(x.detail)}</p>
      </article>`
    )
    .join("");

  // 技能
  $("#skillsGrid").innerHTML = (p.skills || [])
    .map(
      (g) => `
      <div class="skill-group">
        <h3>${esc(g.group)}</h3>
        <ul>${(g.items || []).map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
      </div>`
    )
    .join("");

  // 链接
  $("#linksGrid").innerHTML = (p.links || [])
    .map(
      (l) => `
      <a class="link-card" href="${esc(l.url)}" ${
        /^https?:/.test(l.url) ? 'target="_blank" rel="noopener"' : ""
      }>
        ${iconFor(l.icon)}
        <span class="link-card__label">${esc(l.label)}</span>
      </a>`
    )
    .join("");
}

/* ---------- 精选项目卡片(降级用) ---------- */
function projectCard({ name, desc, url, tags = [], stars }) {
  const starHtml =
    typeof stars === "number"
      ? `<span class="card__star">${stars}</span>`
      : "";
  return `
    <a class="card" href="${esc(url)}" target="_blank" rel="noopener">
      <h3 class="card__title">${esc(name)}</h3>
      <div class="card__meta">${starHtml}</div>
      <p class="card__desc">${esc(desc || "")}</p>
      <div class="card__tags">${(tags || [])
        .map((t) => `<span class="tag">${esc(t)}</span>`)
        .join("")}</div>
    </a>`;
}

/* ---------- GitHub 项目拉取(失败降级到 featuredProjects) ---------- */
async function renderProjects(p) {
  const grid = $("#projectsGrid");
  const hint = $("#projectsHint");
  const featured = p.featuredProjects || [];

  const renderFeatured = () => {
    hint.textContent = "精选项目";
    grid.innerHTML = featured.length
      ? featured.map(projectCard).join("")
      : '<p class="muted">暂无项目。</p>';
  };

  if (!p.githubUser) return renderFeatured();

  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(
        p.githubUser
      )}/repos?per_page=100&sort=updated`
    );
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    let repos = await res.json();
    if (!Array.isArray(repos)) throw new Error("bad payload");

    repos = repos
      .filter((r) => !r.fork && !r.archived)
      .sort(
        (a, b) =>
          b.stargazers_count - a.stargazers_count ||
          new Date(b.updated_at) - new Date(a.updated_at)
      )
      .slice(0, 6);

    if (!repos.length) return renderFeatured();

    // 精选项目名 -> 置顶去重
    const featuredNames = new Set(featured.map((f) => f.name?.toLowerCase()));
    const apiCards = repos
      .filter((r) => !featuredNames.has(r.name.toLowerCase()))
      .map((r) =>
        projectCard({
          name: r.name,
          desc: r.description,
          url: r.html_url,
          tags: r.language ? [r.language] : [],
          stars: r.stargazers_count,
        })
      );

    hint.textContent = "从 GitHub 自动获取";
    grid.innerHTML = featured.map(projectCard).join("") + apiCards.join("");
  } catch (err) {
    console.warn("GitHub 拉取失败,降级为精选项目:", err);
    renderFeatured();
  }
}

/* ---------- 博客预览(读 manifest,取最新 3 篇) ---------- */
async function renderBlogPreview() {
  const grid = $("#blogGrid");
  try {
    const posts = await fetch("posts/manifest.json").then((r) => {
      if (!r.ok) throw new Error("no manifest");
      return r.json();
    });
    const latest = [...posts]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
    grid.innerHTML = latest.length
      ? latest
          .map(
            (post) => `
        <a class="card" href="blog/?post=${encodeURIComponent(post.slug)}">
          <h3 class="card__title">${esc(post.title)}</h3>
          <div class="card__meta">${esc(post.date)}</div>
          <p class="card__desc">${esc(post.summary || "")}</p>
          <div class="card__tags">${(post.tags || [])
            .map((t) => `<span class="tag">${esc(t)}</span>`)
            .join("")}</div>
        </a>`
          )
          .join("")
      : '<p class="muted">还没有文章。</p>';
  } catch (err) {
    console.warn("博客预览加载失败:", err);
    grid.innerHTML = '<p class="muted">博客暂不可用。</p>';
  }
}

/* ---------- 启动 ---------- */
async function init() {
  initTheme();
  initNav();
  $("#year").textContent = new Date().getFullYear();

  try {
    const profile = await fetch("data/profile.json").then((r) => {
      if (!r.ok) throw new Error("no profile.json");
      return r.json();
    });
    renderProfile(profile);
    await Promise.all([renderProjects(profile), renderBlogPreview()]);
  } catch (err) {
    console.error("加载 profile.json 失败:", err);
  }

  // 内容渲染后再挂动效,保证 section 高度已定
  initReveal();
}

document.addEventListener("DOMContentLoaded", init);
