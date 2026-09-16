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

**改个人信息**：编辑 `assets/script.js` 顶部的 `CONTACT`（姓名 / 邮箱 / 学校）。
HTML 里凡是带 `data-field="profile-xxx"` 的元素都会被自动填充，改一处全站生效。

```js
const CONTACT = {
  name: 'Tianzhi Ren',
  email: '202400820020@mail.sdu.edu.cn',
  affiliation: '山东大学 · Shandong University',
};
```

**改项目卡片**：编辑 `CONFIG.projects`，每张卡片支持的字段

| 字段 | 作用 |
|---|---|
| `name` / `en` / `icon` / `desc` / `tags` | 中英文名、图标、简介、标签（纯文案） |
| `repo` | 填 GitHub 仓库名。**只有填了才会去 API 补语言 / Star / 更新时间和链接** |
| `lang` / `stars` | 仓库未公开时手动兜底显示的数值 |
| `status` | 卡片右上角状态标记，如「本地 / 未公开」 |
| `link` | 填了才渲染「查看仓库 →」；不填就没有链接，不会留下死链 |

> 私有仓库用未认证 API 取不到数据，所以私有项目和本机作品请填 `status` 而不要填 `link`，
> 卡片会如实标注「本地 / 未公开」，点击不会进 404。

**改配色**：编辑 `assets/styles.css` 顶部 `:root` 的 `--accent` / `--accent-2` / `--accent-3` 等变量；
浅色主题在 `html[data-theme="light"]` 那一块。

**改文案**：直接编辑 `index.html` 里对应 section 的文字。

> 注意：GitHub 未认证 API 限速 60 次/小时/IP。页面只发 2~3 个请求，正常访问完全够用。
> 账号没有公开数据时统计区会整块隐藏，不会留一排「—」。

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
