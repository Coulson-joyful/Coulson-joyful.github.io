/* ===========================================================
   i18n.js — 中 / 日 / EN 三语切换(共享模块,零依赖)
   两个页面(index.html、blog/index.html)都引用。
   - 维护界面文案字典 UI
   - localStorage["lang"] 持久化、跨页面共享
   - pick():内容字段 {zh,ja,en} 取当前语言,普通字符串原样返回(向后兼容)
   - 自动翻译 [data-i18n] / [data-i18n-attr] 元素
   - 构建并接管导航里的分段药丸切换器
   - 切换时派发 langchange 事件,让页面脚本用缓存数据重渲染
   =========================================================== */
(function () {
  "use strict";

  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const LANGS = ["zh", "ja", "en"];
  const LABELS = { zh: "中", ja: "日", en: "EN" };
  const HTML_LANG = { zh: "zh-CN", ja: "ja", en: "en" };

  /* ---------- 界面文案字典(静态标签 + JS 动态串) ---------- */
  const UI = {
    // 导航 / 区块标题
    nav_projects: { zh: "作品", ja: "作品", en: "Work" },
    nav_blog: { zh: "博客", ja: "ブログ", en: "Blog" },
    nav_links: { zh: "链接", ja: "リンク", en: "Links" },
    blog_all: { zh: "全部文章 →", ja: "すべての記事 →", en: "All posts →" },

    // CTA
    cta_work: { zh: "看看作品", ja: "作品を見る", en: "See my work" },
    cta_contact: { zh: "联系我", ja: "連絡する", en: "Get in touch" },

    // 提示
    hint_github: {
      zh: "从 GitHub 自动获取",
      ja: "GitHub から自動取得",
      en: "Auto-fetched from GitHub",
    },
    hint_featured: {
      zh: "精选项目",
      ja: "注目のプロジェクト",
      en: "Featured projects",
    },

    // 状态
    loading: { zh: "加载中…", ja: "読み込み中…", en: "Loading…" },
    no_projects: {
      zh: "暂无项目。",
      ja: "プロジェクトはまだありません。",
      en: "No projects yet.",
    },
    no_posts: {
      zh: "还没有文章。",
      ja: "まだ記事がありません。",
      en: "No posts yet.",
    },
    blog_unavailable: {
      zh: "博客暂不可用。",
      ja: "ブログは現在利用できません。",
      en: "Blog unavailable.",
    },
    blog_load_failed: {
      zh: "博客加载失败。",
      ja: "ブログの読み込みに失敗しました。",
      en: "Failed to load blog.",
    },
    post_not_found: {
      zh: "找不到这篇文章。",
      ja: "この記事は見つかりません。",
      en: "Post not found.",
    },
    post_load_failed: {
      zh: "文章加载失败。",
      ja: "記事の読み込みに失敗しました。",
      en: "Failed to load post.",
    },

    // footer / aria / 标题后缀
    footer_note: {
      zh: "本站在 AI 协助下完成 · Built with the help of AI",
      ja: "このサイトは AI の協力のもとで作られています",
      en: "Built with the help of AI",
    },
    aria_menu: { zh: "展开菜单", ja: "メニューを開く", en: "Open menu" },
    aria_theme: {
      zh: "切换深色 / 浅色模式",
      ja: "テーマ切り替え",
      en: "Toggle dark / light mode",
    },
    doc_home_suffix: { zh: " · 个人主页", ja: " · ホーム", en: " · Home" },

    // 博客页
    back: { zh: "← 返回列表", ja: "← 一覧に戻る", en: "← Back to list" },
    blog_title: { zh: "博客", ja: "ブログ", en: "Blog" },
    blog_lead: {
      zh: "想到什么写什么 —— 建站、工具、折腾记录。",
      ja: "思いつくままに —— サイト作り、ツール、いじり倒した記録。",
      en: "Whatever comes to mind — site-building, tools, tinkering notes.",
    },
  };

  /* ---------- 语言读写 ---------- */
  function getLang() {
    const stored = localStorage.getItem("lang");
    if (stored && LANGS.includes(stored)) return stored;
    const nav = (navigator.language || "zh").toLowerCase();
    if (nav.startsWith("ja")) return "ja";
    if (nav.startsWith("en")) return "en";
    return "zh";
  }

  function setLang(lang) {
    if (LANGS.includes(lang)) localStorage.setItem("lang", lang);
  }

  /* ---------- 取词 ---------- */
  function t(key, lang = getLang()) {
    const entry = UI[key];
    if (!entry) return key;
    return entry[lang] ?? entry.zh ?? key;
  }

  // 内容字段:{zh,ja,en} 取对应语言(缺失回退 zh),普通字符串原样返回
  function pick(val, lang = getLang()) {
    if (val && typeof val === "object" && !Array.isArray(val)) {
      return val[lang] ?? val.zh ?? "";
    }
    return val;
  }

  /* ---------- 应用语言 ---------- */
  function apply(lang) {
    document.documentElement.lang = HTML_LANG[lang] || "zh-CN";

    // 文本内容
    $$("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"), lang);
    });

    // 属性(格式:"aria-label:key",可逗号分隔多组)
    $$("[data-i18n-attr]").forEach((el) => {
      el.getAttribute("data-i18n-attr")
        .split(",")
        .forEach((pair) => {
          const [attr, key] = pair.split(":").map((s) => s.trim());
          if (attr && key) el.setAttribute(attr, t(key, lang));
        });
    });

    // 药丸高亮
    $$(".lang-switch [data-lang]").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.lang === lang);
      b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
    });

    window.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
  }

  /* ---------- 构建分段药丸切换器 ---------- */
  function initLangSwitch(container) {
    if (!container) return;
    container.innerHTML = LANGS.map(
      (l) =>
        `<button type="button" class="lang-switch__seg" data-lang="${l}" aria-pressed="false">${LABELS[l]}</button>`
    ).join("");
    container.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-lang]");
      if (!btn) return;
      const lang = btn.dataset.lang;
      setLang(lang);
      apply(lang);
    });
    apply(getLang());
  }

  window.i18n = { getLang, setLang, t, pick, apply, initLangSwitch, LANGS, LABELS };
})();
