@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Cloudflare 一键部署 - 只需设置一次
echo ========================================
echo.
echo [说明] 网站已在 GitHub 公网可访问：
echo   https://daisyqiuj.github.io/EU-investment-screening-China/web/index.html
echo.
echo [您只需做 1 次] 在 GitHub 填入 Cloudflare 两个密钥，之后全自动部署。
echo.
echo 1. 打开 Cloudflare 获取 Account ID 和 API Token
start https://dash.cloudflare.com
echo.
echo 2. 打开 GitHub Secrets 页面，添加：
echo    CLOUDFLARE_ACCOUNT_ID
echo    CLOUDFLARE_API_TOKEN
start https://github.com/Daisyqiuj/EU-investment-screening-China/settings/secrets/actions
echo.
echo 3. 详细图文步骤见：docs\一键部署Cloudflare.md
echo.
echo 4. 填好后到 GitHub Actions 点 Run workflow，或重新 push 代码
start https://github.com/Daisyqiuj/EU-investment-screening-China/actions/workflows/cloudflare-pages.yml
echo.
pause
