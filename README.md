# TR20210921.github.io

个人主页源码 —— 纯手写 HTML / CSS / JS，无构建步骤、零依赖，由 GitHub Pages 直接托管。

线上地址：<https://tr20210921.github.io/>

## 结构

```
.
├── index.html          # 整页结构（hero / 关于 / 项目 / 技术栈 / 联系）
├── assets/
│   ├── styles.css      # 全部样式，主题变量集中在 :root
│   └── script.js       # 交互 + GitHub API 取数（改 CONFIG 即可）
├── 404.html            # 找不到页面时的复古像素小游戏风页面
└── .nojekyll           # 告诉 GitHub Pages 跳过 Jekyll 处理
```

## 怎么改内容

**改基本信息**：编辑 `assets/script.js` 顶部的 `CONFIG`

```js
const CONFIG = {
  username: 'TR20210921',        // 换成你的用户名（统计数字、链接自动跟着变）
  email: 'you@example.com',      // 填上真实邮箱，联系卡片会自动变成 mailto 链接
  tagline: '',                   // 想在标题下自定义一句话就写这里
  projects: [ /* 项目卡片列表，顺序即显示顺序 */ ],
  extraStack: [],                // 想追加的技术栈标签
};
```

**改文案**：直接编辑 `index.html` 里对应 section 的文字。

**改配色**：编辑 `assets/styles.css` 顶部 `:root` 的 `--accent` / `--accent-2` / `--accent-3` 等变量；
浅色主题在 `html[data-theme="light"]` 那一块。

**换项目**：只改 `CONFIG.projects` 里的 `name`（必须与 GitHub 仓库名一致），
卡片上的语言 / Star / 更新时间会在页面加载时从 GitHub API 实时拉取。

> 注意：GitHub 未认证 API 限速 60 次/小时/IP。页面只发 2~3 个请求，正常访问完全够用。

## 本地预览

因为是纯静态站，任意静态服务器都行：

```bash
python -m http.server 8080
# 或
npx serve .
```

然后打开 <http://localhost:8080>。
直接双击 `index.html` 也能看，但 GitHub API 取数在 `file://` 下会被浏览器拦截，统计数字会显示 `—`。

## 部署

推送到 `main` 分支后，在仓库 **Settings → Pages** 把 Source 设为
`Deploy from a branch` → `main` → `/ (root)`，等待约 1 分钟即可访问
<https://tr20210921.github.io/>。

## 许可

MIT
