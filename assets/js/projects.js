/* ===========================================================
   projects.js — 全部公开 GitHub 项目列表
   =========================================================== */

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

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

async function fetchAllRepos(user) {
  let url = `https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100&sort=updated`;
  const repos = [];

  while (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const page = await res.json();
    if (!Array.isArray(page)) throw new Error("bad payload");
    repos.push(...page);
    const next = (res.headers.get("Link") || "").match(/<([^>]+)>; rel="next"/);
    url = next ? next[1] : null;
  }

  return repos
    .filter((repo) => !repo.fork && !repo.archived)
    .sort(
      (a, b) =>
        b.stargazers_count - a.stargazers_count ||
        new Date(b.updated_at) - new Date(a.updated_at)
    );
}

function projectCard(repo) {
  return `
    <a class="card" href="${esc(repo.html_url)}" target="_blank" rel="noopener">
      <h2 class="card__title">${esc(repo.name)}</h2>
      <div class="card__meta"><span class="card__star">${repo.stargazers_count}</span></div>
      <p class="card__desc">${esc(repo.description || "")}</p>
      <div class="card__tags">${repo.language ? `<span class="tag">${esc(repo.language)}</span>` : ""}</div>
    </a>`;
}

async function init() {
  initTheme();
  $("#year").textContent = new Date().getFullYear();
  i18n.initLangSwitch($("#langSwitch"));

  try {
    const profileRes = await fetch("../data/profile.json", { cache: "no-store" });
    if (!profileRes.ok) throw new Error("profile 加载失败");
    const profile = await profileRes.json();
    const user = profile.githubUser;
    if (!user) throw new Error("缺少 githubUser");
    $("#githubProfile").href = `https://github.com/${encodeURIComponent(user)}`;

    const repos = await fetchAllRepos(user);
    $("#projectList").innerHTML = repos.length
      ? repos.map(projectCard).join("")
      : `<p class="muted">${i18n.t("no_projects")}</p>`;
  } catch (err) {
    console.error(err);
    $("#projectList").innerHTML = `<p class="muted">${i18n.t("projects_load_failed")}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", init);
