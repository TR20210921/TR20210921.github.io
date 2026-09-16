/* ═══════════════════════════════════════════════════════
   TR20210921.github.io — 页面交互 + GitHub API 数据
   ┌─────────────────────────────────────────────────────┐
   │ 只改 CONFIG 就够了，不用动下面的代码。              │
   └─────────────────────────────────────────────────────┘
   ═══════════════════════════════════════════════════════ */

const CONFIG = {
  username: 'TR20210921',

  // 邮箱会同时写入「联系」卡片；留空则显示「待填写」
  email: 'you@example.com',

  // 手写一行简介，展示在页面标题下方（留空则用 HTML 里写好的默认值）
  tagline: '',

  // 要重点展示的仓库（按这个顺序渲染）。name 必须和 GitHub 仓库名一致。
  // 顺带说明：nonce = 归属，「mine」原创 / 「credit」致谢他人作品
  projects: [
    {
      name: 'dsh-routing-suite',
      icon: '🧭',
      nonce: 'mine',
      desc: '注入器 × 思维模式路由套装：一条安装链装齐运行时手术台与 router-standard 预设，附 P1–P23 实测记录（路由 96%、收敛 100%）。',
      tags: ['TypeScript', 'PowerShell', 'LLM 路由'],
    },
    {
      name: 'dsh-super-injector',
      icon: '💉',
      nonce: 'mine',
      desc: 'DSH 运行时插件注入器：免重启完成插件注入 / 热重载 / 侧挂转正 / 卸载与路由自愈，dev_* 工具全家桶。',
      tags: ['TypeScript', '插件体系', '热重载'],
    },
    {
      name: 'dsh-router-standard',
      icon: '🎛️',
      nonce: 'mine',
      desc: '思维模式路由预设：三行为带（spec / react / mixed）+ weak 内路由，按模型选 persona，接近零成本的每轮引导。',
      tags: ['Prompt 工程', 'Persona', 'A/B 实测'],
    },
    {
      name: 'modlens',
      icon: '👁️',
      nonce: 'credit',
      desc: '多模态视觉读取桥：给纯文本模型接上「看图」能力，输出结构化证据（OCR 全文、版面区域、语义、不确定项）并附评测集。',
      tags: ['CLI', 'Vision', 'Evals'],
      credit: '参与贡献 / 使用',
    },
    {
      name: 'dsh-agent-teams',
      icon: '🤝',
      nonce: 'credit',
      desc: '多智能体团队协作框架：队长协议、DAG 任务图、质量门与评审闭环，把「一个模型干活」升级为「一支团队交付」。',
      tags: ['Agent 编排', 'DAG', '质量门'],
      credit: '参与贡献 / 使用',
    },
  ],

  // 技术栈标签也可以在这里动态追加；留空则用 HTML 里的静态内容
  extraStack: [],
};

/* ── 工具函数 ─────────────────────────────── */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const LANG_COLORS = {
  TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572A5', HTML: '#e34c26',
  CSS: '#563d7c', Shell: '#89e051', PowerShell: '#012456', Rust: '#dea584',
  Go: '#00ADD8', Vue: '#41b883', 'C++': '#f34b7d', C: '#555555', Java: '#b07219',
  Ruby: '#701516', PHP: '#4F5D95', Jupyter: '#DA5B0B', MDX: '#fcb32c',
};

async function ghFetch(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  return res.json();
}

const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n));

/* ── 1. 主题切换（记忆到 localStorage） ───── */
(function theme() {
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  root.dataset.theme = saved || (prefersLight ? 'light' : 'dark');

  $('#theme-toggle')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('theme', next);
  });
})();

/* ── 2. 顶部导航：滚动阴影 / 阅读进度 / 高亮当前节 ── */
(function nav() {
  const nav = $('#nav');
  const bar = $('#progress');
  const links = $$('.nav-links a[data-nav]');
  const sections = links
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const onScroll = () => {
    const y = window.scrollY;
    nav?.classList.toggle('scrolled', y > 8);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = `${h > 0 ? (y / h) * 100 : 0}%`;

    let current = null;
    for (const sec of sections) {
      if (sec.getBoundingClientRect().top <= 120) current = sec.id;
    }
    links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${current}`));
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── 3. 进入视口淡入 ─────────────────────── */
function reveal(el) {
  if (!el) return;
  el.classList.add('reveal');
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
  );
  io.observe(el);
}

/* ── 4. 邮箱 / 年份 / 页脚 ──────────────── */
(function staticBits() {
  const email = (CONFIG.email || '').trim();
  const isPlaceholder = !email || email === 'you@example.com';
  const text = $('#mail-text');
  const card = $('#mail-card');
  if (text) text.textContent = isPlaceholder ? '（待填写）' : email;
  if (card && !isPlaceholder) card.setAttribute('href', `mailto:${email}`);

  const y = $('#year');
  if (y) y.textContent = String(new Date().getFullYear());

  const site = $('#site-card');
  if (site) site.setAttribute('href', `https://${CONFIG.username.toLowerCase()}.github.io/`);

  const ghBtn = $('#gh-btn');
  if (ghBtn) ghBtn.setAttribute('href', `https://github.com/${CONFIG.username}`);

  const tagline = $('.hero-sub');
  if (tagline && CONFIG.tagline) tagline.innerHTML = CONFIG.tagline;
})();

/* ── 5. GitHub 统计数字 ──────────────────── */
async function loadStats() {
  const box = $('#stats');
  const set = (key, val) => { const el = $(`[data-stat="${key}"]`); if (el) el.textContent = val; };

  // 取不到数据时（限速 / 断网 / file:// 打开）整块隐藏，不留一排「—」
  const fail = (why) => { if (box) box.hidden = true; console.debug('[stats] hidden:', why); };

  try {
    const [user, repos] = await Promise.all([
      ghFetch(`/users/${CONFIG.username}`),
      ghFetch(`/users/${CONFIG.username}/repos?per_page=100&sort=updated`),
    ]);
    const stars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);

    // 新账号：仓库/Star/关注者全为 0 时展示四个 0 很空洞，直接隐藏
    if (!repos.length && !stars && !(user.followers > 0)) return fail('账号还没有公开数据');

    set('repos', fmt(user.public_repos ?? repos.length));
    set('stars', fmt(stars));
    set('followers', fmt(user.followers ?? 0));
    set('years', user.created_at ? String(new Date(user.created_at).getFullYear()) : '—');

    if (box) box.hidden = false;   // 有真实数据才亮出来
    window.__repos = repos;        // 缓存给项目卡片复用，省一次请求
  } catch (e) {
    fail(e.message);
  }
}

/* ── 6. 项目卡片渲染（静态兜底 + API 增强） ── */
function renderProjects() {
  const box = $('#project-cards');
  if (!box) return;

  box.innerHTML = CONFIG.projects.map((p) => {
    const isMine = p.nonce !== 'credit';
    const badge = isMine
      ? '<span class="badge mine">原创</span>'
      : `<span class="badge credit">${p.credit || '致谢'}</span>`;
    const tags = (p.tags || []).map((t) => `<span>${t}</span>`).join('');
    return `
      <article class="pcard reveal" data-repo="${p.name}">
        <div class="pcard-head">
          <span class="ico" aria-hidden="true">${p.icon || '📦'}</span>
          <h3>${p.name}</h3>
          ${badge}
        </div>
        <p>${p.desc || ''}</p>
        ${tags ? `<div class="tags-mini">${tags}</div>` : ''}
        <div class="pcard-meta">
          <span class="lang"><i data-lang-dot></i><span data-lang-text>—</span></span>
          <span>★ <span data-stars>—</span></span>
          <span data-updated></span>
        </div>
        <a class="repo" href="https://github.com/${CONFIG.username}/${p.name}" target="_blank" rel="noopener">查看仓库 →</a>
      </article>`;
  }).join('');

  $$('.pcard', box).forEach(reveal);
}

async function enrichProjects() {
  const cards = $$('.pcard');
  let repos = window.__repos;
  if (!repos) {
    try { repos = await ghFetch(`/users/${CONFIG.username}/repos?per_page=100&sort=updated`); }
    catch { return; }   // 取数失败就保留静态卡片，不下「未公开」的判断
  }
  const byName = new Map(repos.map((r) => [r.name.toLowerCase(), r]));

  cards.forEach((card) => {
    const r = byName.get((card.dataset.repo || '').toLowerCase());

    // 仓库还没推到 GitHub：降级显示，别留一个点了 404 的链接
    if (!r) { card.classList.add('is-missing'); return; }

    const dot = $('[data-lang-dot]', card);
    const langText = $('[data-lang-text]', card);
    const stars = $('[data-stars]', card);
    const updated = $('[data-updated]', card);

    if (r.language) {
      if (langText) langText.textContent = r.language;
      if (dot) dot.style.background = LANG_COLORS[r.language] || 'var(--accent)';
    } else if (langText) {
      langText.textContent = 'Mixed';
    }
    if (stars) stars.textContent = fmt(r.stargazers_count || 0);
    if (updated && r.pushed_at) {
      const d = new Date(r.pushed_at);
      updated.textContent = `更新 ${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
  });
}

/* ── 7. 额外技术栈标签 ───────────────────── */
(function extraStack() {
  if (!CONFIG.extraStack?.length) return;
  const first = $('.stack-group .tags');
  if (!first) return;
  CONFIG.extraStack.forEach((t) => {
    const s = document.createElement('span');
    s.textContent = t;
    first.appendChild(s);
  });
})();

/* ── 启动 ─────────────────────────────────── */
renderProjects();
$$('.section-title, .stats, .stack-group, .contact-card, .about-grid > *').forEach(reveal);
loadStats().then(enrichProjects);
