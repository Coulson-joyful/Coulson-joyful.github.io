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
  bilibili:
    '<svg class="link-card__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373Z"/></svg>',
  weibo:
    '<svg class="link-card__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.737 5.439l-.002.004zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.18.601l.014-.028zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.57-.18-.405-.615.375-.977.42-1.804 0-2.404-.781-1.112-2.915-1.053-5.364-.03 0 0-.766.331-.571-.271.376-1.217.315-2.224-.27-2.809-1.338-1.337-4.869.045-7.888 3.08C1.309 10.87 0 13.273 0 15.348c0 3.981 5.099 6.395 10.086 6.395 6.536 0 10.888-3.801 10.888-6.82 0-1.822-1.547-2.854-2.915-3.284v.01zm1.908-5.092c-.766-.856-1.908-1.187-2.96-.962-.436.09-.706.511-.616.932.09.42.511.691.932.602.511-.105 1.067.044 1.442.465.376.421.466.977.316 1.473-.136.406.089.856.51.992.405.119.857-.105.992-.512.33-1.021.12-2.178-.646-3.035l.03.045zm2.418-2.195c-1.576-1.757-3.905-2.419-6.054-1.968-.496.104-.812.587-.706 1.081.104.496.586.813 1.082.707 1.532-.331 3.185.15 4.296 1.383 1.112 1.246 1.429 2.943.947 4.416-.165.48.106 1.007.586 1.157.479.165.991-.104 1.157-.586.675-2.088.241-4.478-1.338-6.235l.03.045z"/></svg>',
  xiaohongshu:
    '<svg class="link-card__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22.405 9.879c.002.016.01.02.07.019h.725a.797.797 0 0 0 .78-.972.794.794 0 0 0-.884-.618.795.795 0 0 0-.692.794c0 .101-.002.666.001.777zm-11.509 4.808c-.203.001-1.353.004-1.685.003a2.528 2.528 0 0 1-.766-.126.025.025 0 0 0-.03.014L7.7 16.127a.025.025 0 0 0 .01.032c.111.06.336.124.495.124.66.01 1.32.002 1.981 0 .01 0 .02-.006.023-.015l.712-1.545a.025.025 0 0 0-.024-.036zM.477 9.91c-.071 0-.076.002-.076.01a.834.834 0 0 0-.01.08c-.027.397-.038.495-.234 3.06-.012.24-.034.389-.135.607-.026.057-.033.042.003.112.046.092.681 1.523.787 1.74.008.015.011.02.017.02.008 0 .033-.026.047-.044.147-.187.268-.391.371-.606.306-.635.44-1.325.486-1.706.014-.11.021-.22.03-.33l.204-2.616.022-.293c.003-.029 0-.033-.03-.034zm7.203 3.757a1.427 1.427 0 0 1-.135-.607c-.004-.084-.031-.39-.235-3.06a.443.443 0 0 0-.01-.082c-.004-.011-.052-.008-.076-.008h-1.48c-.03.001-.034.005-.03.034l.021.293c.076.982.153 1.964.233 2.946.05.4.186 1.085.487 1.706.103.215.223.419.37.606.015.018.037.051.048.049.02-.003.742-1.642.804-1.765.036-.07.03-.055.003-.112zm3.861-.913h-.872a.126.126 0 0 1-.116-.178l1.178-2.625a.025.025 0 0 0-.023-.035l-1.318-.003a.148.148 0 0 1-.135-.21l.876-1.954a.025.025 0 0 0-.023-.035h-1.56c-.01 0-.02.006-.024.015l-.926 2.068c-.085.169-.314.634-.399.938a.534.534 0 0 0-.02.191.46.46 0 0 0 .23.378.981.981 0 0 0 .46.119h.59c.041 0-.688 1.482-.834 1.972a.53.53 0 0 0-.023.172.465.465 0 0 0 .23.398c.15.092.342.12.475.12l1.66-.001c.01 0 .02-.006.023-.015l.575-1.28a.025.025 0 0 0-.024-.035zm-6.93-4.937H3.1a.032.032 0 0 0-.034.033c0 1.048-.01 2.795-.01 6.829 0 .288-.269.262-.28.262h-.74c-.04.001-.044.004-.04.047.001.037.465 1.064.555 1.263.01.02.03.033.051.033.157.003.767.009.938-.014.153-.02.3-.06.438-.132.3-.156.49-.419.595-.765.052-.172.075-.353.075-.533.002-2.33 0-4.66-.007-6.991a.032.032 0 0 0-.032-.032zm11.784 6.896c0-.014-.01-.021-.024-.022h-1.465c-.048-.001-.049-.002-.05-.049v-4.66c0-.072-.005-.07.07-.07h.863c.08 0 .075.004.075-.074V8.393c0-.082.006-.076-.08-.076h-3.5c-.064 0-.075-.006-.075.073v1.445c0 .083-.006.077.08.077h.854c.075 0 .07-.004.07.07v4.624c0 .095.008.084-.085.084-.37 0-1.11-.002-1.304 0-.048.001-.06.03-.06.03l-.697 1.519s-.014.025-.008.036c.006.01.013.008.058.008 1.748.003 3.495.002 5.243.002.03-.001.034-.006.035-.033v-1.539zm4.177-3.43c0 .013-.007.023-.02.024-.346.006-.692.004-1.037.004-.014-.002-.022-.01-.022-.024-.005-.434-.007-.869-.01-1.303 0-.072-.006-.071.07-.07l.733-.003c.041 0 .081.002.12.015.093.025.16.107.165.204.006.431.002 1.153.001 1.153zm2.67.244a1.953 1.953 0 0 0-.883-.222h-.18c-.04-.001-.04-.003-.042-.04V10.21c0-.132-.007-.263-.025-.394a1.823 1.823 0 0 0-.153-.53 1.533 1.533 0 0 0-.677-.71 2.167 2.167 0 0 0-1-.258c-.153-.003-.567 0-.72 0-.07 0-.068.004-.068-.065V7.76c0-.031-.01-.041-.046-.039H17.93s-.016 0-.023.007c-.006.006-.008.012-.008.023v.546c-.008.036-.057.015-.082.022h-.95c-.022.002-.028.008-.03.032v1.481c0 .09-.004.082.082.082h.913c.082 0 .072.128.072.128V11.19s.003.117-.06.117h-1.482c-.068 0-.06.082-.06.082v1.445s-.01.068.064.068h1.457c.082 0 .076-.006.076.079v3.225c0 .088-.007.081.082.081h1.43c.09 0 .082.007.082-.08v-3.27c0-.029.006-.035.033-.035l2.323-.003c.098 0 .191.02.28.061a.46.46 0 0 1 .274.407c.008.395.003.79.003 1.185 0 .259-.107.367-.33.367h-1.218c-.023.002-.029.008-.028.033.184.437.374.871.57 1.303a.045.045 0 0 0 .04.026c.17.005.34.002.51.003.15-.002.517.004.666-.01a2.03 2.03 0 0 0 .408-.075c.59-.18.975-.698.976-1.313v-1.981c0-.128-.01-.254-.034-.38 0 .078-.029-.641-.724-.998z"/></svg>',
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
    .map((l) => {
      const { url, external } = resolveLinkUrl(l);
      return `
      <a class="link-card" href="${esc(url)}" ${
        external ? 'target="_blank" rel="noopener"' : ""
      }>
        ${iconFor(l.icon)}
        <span class="link-card__label">${esc(l.label)}</span>
      </a>`;
    })
    .join("");

  // 导航栏社交图标(profile.links 里带 "nav": true 的)
  const navSocial = $("#navSocial");
  if (navSocial) {
    navSocial.innerHTML = (p.links || [])
      .filter((l) => l.nav)
      .map((l) => {
        const { url, external } = resolveLinkUrl(l);
        return `
      <a href="${esc(url)}" aria-label="${esc(l.label)}" title="${esc(l.label)}"${
          external ? ' target="_blank" rel="noopener"' : ""
        }>${iconFor(l.icon)}</a>`;
      })
      .join("");
  }
}

/* ---------- 链接地址解析 ----------
   邮箱(mailto:)统一改成 Gmail 网页写信,新标签打开,不再唤起本地邮件客户端。 */
function resolveLinkUrl(l) {
  const raw = String(l.url || "");
  if (l.icon === "mail" || raw.toLowerCase().startsWith("mailto:")) {
    const addr = raw.replace(/^mailto:/i, "").split("?")[0].trim();
    return {
      url: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(addr)}`,
      external: true,
    };
  }
  return { url: raw, external: /^https?:/i.test(raw) };
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
