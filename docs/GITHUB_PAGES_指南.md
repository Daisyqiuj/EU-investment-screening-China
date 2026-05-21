# GitHub Pages 发布指南（含排错）

## 先确认：代码是否已在 GitHub 上？

1. 浏览器打开你的仓库：**https://github.com/Daisyqiuj/EU-investment-screening-China**
2. 页面上应能看到 `web/`、`data/`、`.github` 等文件夹  
3. 点进 `.github/workflows/`，里面应有 `pages.yml`

**若仓库是空的或只有 README**：说明还没推送成功，请先完成下面的「推送代码」。

---

## 方法一：不用 Actions（最简单，推荐新手）

不需要找 Actions，也不会出现「Deploy GitHub Pages」工作流。

### 步骤

1. **推送代码**（见文末「推送代码」）
2. 仓库 → **Settings** → 左侧 **Pages**
3. **Build and deployment**：
   - **Source** 选 **Deploy from a branch**
   - **Branch** 选 `main`，文件夹选 **`/ (root)`**，点 **Save**
4. 等 1～3 分钟，页面上方会出现绿色提示，例如：  
   `Your site is live at https://用户名.github.io/仓库名/`
5. 浏览器打开：
   - **https://daisyqiuj.github.io/EU-investment-screening-China/web/index.html**  
   - 或 **https://daisyqiuj.github.io/EU-investment-screening-China/**（会自动跳转）

---

## 方法二：用 GitHub Actions（需工作流变绿）

### 在哪里找 Actions？

1. 打开 **你的仓库首页**（不是个人主页）
2. 顶部菜单有一排：**Code · Issues · Pull requests · Actions · …**
3. 点 **Actions**
4. 左侧列表里点 **Deploy GitHub Pages**
5. 中间会有一条运行记录，点进去可看日志

### 正常情况

| 图标颜色 | 含义 |
|---------|------|
| 🟡 黄色转圈 | 正在运行，等 1～2 分钟 |
| ✅ 绿色勾 | 成功，可去 Settings → Pages 看网址 |
| ❌ 红色叉 | 失败，点进去看哪一步报错 |

### 第一次常见：要手动「批准」环境

若显示 **Waiting for approval** 或 **Review pending deployments**：

1. 在 Actions 里点进该次运行
2. 找到 **Review deployments** 或黄色横幅
3. 勾选 **github-pages** → **Approve and deploy**

### Pages 设置必须匹配

**Settings → Pages → Source** 必须选 **GitHub Actions**（不是 “Deploy from a branch”）。

若选错了 branch 部署，Actions 里的 “Deploy GitHub Pages” 可能成功但网站仍不对，请改回 **GitHub Actions** 或改用上面的**方法一**。

### 完全没有工作流？

- 仓库里还没有 `.github/workflows/pages.yml` → 需要重新 `git push`
- **Settings → Actions → General** → 选 **Allow all actions**
- 是否推送到 `main` 分支（不是别的分支名）

---

## 推送代码（必做）

在 PowerShell 里（**把下面换成你的真实地址**）：

```powershell
cd "d:\Users\qdaisy\Desktop\网站创建"

# 若之前填的是 YOUR_USER/YOUR_REPO，先删掉再添加正确地址：
git remote remove origin
git remote add origin https://github.com/Daisyqiuj/EU-investment-screening-China.git

git push -u origin main
```

推送成功后，到 GitHub 网页刷新仓库，应能看到所有文件。

登录方式：浏览器会弹出 GitHub 登录；或使用 [Personal Access Token](https://github.com/settings/tokens) 作为密码。

---

## 仍然不行？

请记下并反馈：

1. 仓库完整 URL（例如 `https://github.com/xxx/yyy`）
2. Settings → Pages 页面截图或文字（Source 选的是什么）
3. Actions 里是「没有列表」还是「红色失败」（失败时最后几行错误）
