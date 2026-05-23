# 只需做一次（约 3 分钟），以后每次 push 自动上线

您的网站**已经在 GitHub 公网运行**：  
https://daisyqiuj.github.io/EU-investment-screening-China/web/index.html  

若还要 **Cloudflare 短网址**（`*.pages.dev`），AI 无法代替您登录 Cloudflare，但已配置好**全自动部署**。您只需完成下面 **2 步一次性设置**：

---

## 第 1 步：拿 Cloudflare 密钥（2 个值）

1. 注册/登录 https://dash.cloudflare.com  
2. 右侧复制 **Account ID**（32 位字符）  
3. 打开 https://dash.cloudflare.com/profile/api-tokens → **Create Token**  
4. 选模板 **Edit Cloudflare Workers**（或 Custom：Account → Cloudflare Pages → Edit）  
5. 创建后**复制 Token**（只显示一次，请保存）

记下：
- `CLOUDFLARE_ACCOUNT_ID` = Account ID  
- `CLOUDFLARE_API_TOKEN` = 刚复制的 Token  

---

## 第 2 步：放进 GitHub（一次性）

打开（已指向您的仓库）：

**https://github.com/Daisyqiuj/EU-investment-screening-China/settings/secrets/actions**

点 **New repository secret**，添加两条：

| Name | Value |
|------|--------|
| `CLOUDFLARE_ACCOUNT_ID` | 第 1 步的 Account ID |
| `CLOUDFLARE_API_TOKEN` | 第 1 步的 Token |

---

## 完成！触发部署

1. 打开 **Actions** → **Deploy Cloudflare Pages** → **Run workflow**  
   或随便改一行 README 再 push，都会自动部署。  
2. 约 2 分钟后访问：  
   **https://eu-fdi-screening.pages.dev/web/index.html**

以后您**不用再管**，每次 `git push` 都会自动更新 Cloudflare 和 GitHub 两处。

---

## 不想用 Cloudflare？

**什么都不用做**——GitHub Pages 已在自动更新，链接见文首。

---

## 遇到问题

Actions 里若显示红色失败且提示缺少 secret，说明第 2 步还没填完。  
若 404，等 2 分钟再刷新，或到 Cloudflare Dashboard → Workers & Pages 查看项目名是否为 `eu-fdi-screening`。
