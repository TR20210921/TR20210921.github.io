/* ═══════════════════════════════════════════════════════
   TR20210921.github.io — 页面交互 + GitHub API 数据
   ┌─────────────────────────────────────────────────────┐
   │ 只改 CONFIG 就够了，不用动下面的代码。              │
   └─────────────────────────────────────────────────────┘
   ═══════════════════════════════════════════════════════ */

/* ── 个人信息：改这里就够了 ─────────────── */
const CONTACT = {
  name: 'Tianzhi Ren',
  email: '202400820020@mail.sdu.edu.cn',
  affiliation: '山东大学 · Shandong University',
};
/* 映射：data-field 的值 → CONTACT 的字段名 */
const CONTACT_MAP = {
  'profile-name': 'name',
  'profile-email': 'email',
  'profile-affiliation': 'affiliation',
};

const CONFIG = {
  username: 'TR20210921',

  // 手写一行简介，展示在页面标题下方（留空则用 HTML 里写好的默认值）
  tagline: '',

  // 项目卡片（按数组顺序渲染）。
  //   name / icon / desc / tags 是文案；
  //   repo   填 GitHub 仓库名才会尝试用 API 补语言和 Star；
  //   lang / stars / status 是仓库未公开时手动填的兜底显示；
  //   link   有链接才会渲染「查看仓库 →」，没有就不渲染死链。
  projects: [
    {
      name: '数学建模竞赛全流程基建',
      en: 'Math Modeling Competition',
      icon: '📐',
      repo: 'MathModelCompetition',
      desc: '把数模竞赛从选题、建模到论文产出的整套流程做成可复用的工作流基建，覆盖数据处理、模型求解与结果汇总。',
      tags: ['Python', '建模工作流', '数据处理'],
      status: '本地 / 未公开',
    },
    {
      name: 'c4free Hypercube',
      en: 'c4free-hypercube-main',
      icon: '🧊',
      repo: 'c4free-hypercube-main',
      desc: '围绕超立方体结构展开的实验项目，含可视化与计算脚本。',
      tags: ['算法实验', '可视化'],
      status: '本地 / 未公开',
    },
    {
      name: 'dsh-routing-suite',
      icon: '🧭',
      desc: '注入器 × 思维模式路由套装：一条安装链装齐运行时手术台与 router-standard 预设，附 P1–P23 实测记录（路由 96%、收敛 100%）。',
      tags: ['TypeScript', 'PowerShell', 'LLM 路由'],
      status: '本地开发中',
    },
    {
      name: 'dsh-super-injector',
      icon: '💉',
      desc: 'DSH 运行时插件注入器：免重启完成插件注入 / 热重载 / 侧挂转正 / 卸载与路由自愈，dev_* 工具全家桶。',
      tags: ['TypeScript', '插件体系', '热重载'],
      status: '本地开发中',
    },
    {
      name: 'modlens',
      icon: '👁️',
      desc: '多模态视觉读取桥：给纯文本模型接上「看图」能力，输出结构化证据（OCR 全文、版面区域、语义、不确定项）并附评测集。',
      tags: ['CLI', 'Vision', 'Evals'],
      status: '学习 / 使用',
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

/* ── 4. 个人信息 / 年份 / 链接 ───────────── */
(function staticBits() {
  // 把 CONTACT 写进所有带 data-field 的元素
  $$('[data-field]').forEach((el) => {
    const val = CONTACT[CONTACT_MAP[el.dataset.field]];
    if (val) el.textContent = val;
  });

  // 邮箱卡片同步成可点的 mailto
  const email = (CONTACT.email || '').trim();
  const text = $('#mail-text');
  const card = $('#mail-card');
  if (email) {
    if (text) text.textContent = email;
    if (card) card.setAttribute('href', `mailto:${email}`);
  } else if (text) {
    text.textContent = '（待填写）';
  }

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

/* ── 6. 项目卡片渲染（静态文案 + 公开仓库的 API 增强） ── */
function renderProjects() {
  const box = $('#project-cards');
  if (!box) return;

  box.innerHTML = CONFIG.projects.map((p) => {
    const tags = (p.tags || []).map((t) => `<span>${t}</span>`).join('');
    // 只有在 CONFIG 里显式给了 lang/stars 才渲染这行，避免一排「—」
    const hasMeta = p.lang || p.stars;
    const meta = hasMeta
      ? `<div class="pcard-meta">
           <span class="lang"><i data-lang-dot style="${p.lang ? '' : 'display:none'}"></i><span data-lang-text>${p.lang || ''}</span></span>
           <span>★ <span data-stars>${p.stars != null ? fmt(p.stars) : '—'}</span></span>
           <span data-updated></span>
         </div>`
      : '';
    const link = p.link
      ? `<a class="repo" href="${p.link}" target="_blank" rel="noopener">查看仓库 →</a>`
      : '';
    const status = p.status ? `<span class="badge muted">${p.status}</span>` : '';
    return `
      <article class="pcard reveal" data-repo="${p.repo || ''}">
        <div class="pcard-head">
          <span class="ico" aria-hidden="true">${p.icon || '📦'}</span>
          <h3>${p.name}</h3>
          ${status}
        </div>
        ${p.en ? `<p class="pcard-en">${p.en}</p>` : ''}
        <p>${p.desc || ''}</p>
        ${tags ? `<div class="tags-mini">${tags}</div>` : ''}
        ${meta}
        ${link}
      </article>`;
  }).join('');

  // 没填 repo 的卡片不再去 API 找，直接定格
  $$('.pcard', box).filter((c) => !c.dataset.repo).forEach((c) => c.classList.add('is-missing'));
  $$('.pcard', box).forEach(reveal);
}

async function enrichProjects() {
  const cards = $$('.pcard[data-repo]').filter((c) => c.dataset.repo);
  if (!cards.length) return;

  let repos = window.__repos;
  if (!repos) {
    try { repos = await ghFetch(`/users/${CONFIG.username}/repos?per_page=100&sort=updated`); }
    catch { return; }   // 取数失败就保留静态文案，不下任何判断
  }
  const byName = new Map(repos.map((r) => [r.name.toLowerCase(), r]));

  cards.forEach((card) => {
    const r = byName.get(card.dataset.repo.toLowerCase());

    // 仓库未公开：保持卡片文案，只标记状态（私有库未认证 API 取不到）
    if (!r) {
      card.classList.add('is-missing');
      if (!$('.badge.muted', card)) {
        const b = document.createElement('span');
        b.className = 'badge muted';
        b.textContent = '本地 / 未公开';
        $('.pcard-head', card)?.appendChild(b);
      }
      return;
    }

    // 公开仓库：补语言、Star、更新时间和链接
    const dot = $('[data-lang-dot]', card);
    const langText = $('[data-lang-text]', card);
    const stars = $('[data-stars]', card);
    const updated = $('[data-updated]', card);

    if (r.language) {
      if (langText) langText.textContent = r.language;
      if (dot) { dot.style.display = ''; dot.style.background = LANG_COLORS[r.language] || 'var(--accent)'; }
    }
    if (stars) stars.textContent = fmt(r.stargazers_count || 0);
    if (updated && r.pushed_at) {
      const d = new Date(r.pushed_at);
      updated.textContent = `更新 ${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
    if (!$('.repo', card)) {
      const a = document.createElement('a');
      a.className = 'repo';
      a.href = r.html_url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = '查看仓库 →';
      card.appendChild(a);
    }
    $('.badge.muted', card)?.remove();
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
