# 欧盟及欧洲范围 · 涉中国企业投资审查案例库

互动 HTML 网站 + JSON 资料库 + 每周一自动更新脚本。

## 功能概览

1. **资料库**（`data/cases.json`）：收录德国、意大利、英国、立陶宛等国公开案例，以及欧盟 FDI 合作机制政策统计。
2. **可视化网站**（`web/`）：
   - **案例总览**（`index.html`）：可筛选表格 + 柱状图/环形图/折线图（Chart.js）
   - **欧洲互动地图**（`map.html`）：基于 Natural Earth GeoJSON 精确国界（Leaflet），点击国家查看案例
   - **国家专题页**（`country.html?c=DE`）：完整时间线与来源链接
   - **政策与法律框架**（`policy.html`）：可视化专题（KPI、流程图、交互时间线、Chart 图表、法规对比、专家折叠卡片）
3. **每周播客**：`scripts/generate_podcast.py` 根据案例库生成约 800 字中文周评脚本，并用 edge-tts 合成 MP3；主页可在线播放。每周一更新数据库后自动生成。
4. **自动更新**：`scripts/update_database.py` 每周一 09:00 抓取欧盟委员会贸易政策新闻与投资审查页面，补充 `framework_updates`，并对可能相关的已有案例追加时间线备注；完成后同步生成播客。

> **说明**：欧盟合作机制下的个案详情不向公众披露；本库个案来自各国政府决定、媒体报道及 EC 年度报告等公开信息。自动脚本主要同步 **EC 政策与年度报告类动态**。

## 发布到 GitHub Pages

### 一次性设置

1. 仓库地址：[github.com/Daisyqiuj/EU-investment-screening-China](https://github.com/Daisyqiuj/EU-investment-screening-China)

2. 推送代码（若尚未推送）：

```powershell
cd "d:\Users\qdaisy\Desktop\网站创建"
git remote set-url origin https://github.com/Daisyqiuj/EU-investment-screening-China.git
git push -u origin main
```

3. 发布网站（**二选一**，新手建议用 A）：

   **A. 不用 Actions（最简单）**  
   **Settings → Pages** → Source 选 **Deploy from a branch** → 分支 `main`、文件夹 **`/ (root)`** → Save。等 1～3 分钟，访问下方网址即可。

   **B. 用 Actions**  
   **Settings → Pages** → Source 选 **GitHub Actions**。然后打开仓库顶部 **Actions** 标签 → 左侧点 **Deploy GitHub Pages** → 等出现绿色 ✅。若提示 **Review deployments**，需点 **Approve and deploy**。

4. 访问：**https://daisyqiuj.github.io/EU-investment-screening-China/web/index.html**（根路径也会跳转到 `web/`）

> 卡在 Actions？见详细图文说明：[docs/GITHUB_PAGES_指南.md](docs/GITHUB_PAGES_指南.md)

### 之后更新网站

```powershell
git add .
git commit -m "Update cases and content"
git push
```

推送后 GitHub Actions 会自动重新发布。

## 快速开始

### 1. 安装 Python 依赖

```powershell
cd "d:\Users\qdaisy\Desktop\网站创建"
pip install -r requirements.txt
```

### 2. 启动本地网站（必须用 HTTP 服务，不能直接双击 HTML）

```powershell
py -3 -m http.server 8888
```

或双击 `start_server.bat`。

浏览器打开：**http://localhost:8888/web/index.html**（主页含播客播放器）

> 须从项目根目录启动服务，以便加载 `data/cases.json`。

### 3. 手动运行更新

```powershell
py -3 scripts\update_database.py
```

更新日志：`data/update_log.json`

### 4. 单独生成播客（可选）

```powershell
py -3 scripts\generate_podcast.py
```

输出：`data/podcast.json`、`web/audio/latest.mp3`

### 5. 设置每周一 09:00 自动更新（Windows）

以管理员或当前用户打开 PowerShell：

```powershell
cd "d:\Users\qdaisy\Desktop\网站创建"
.\scripts\setup_scheduler.ps1
```

将创建计划任务 `EU-China-FDI-Weekly-Update`。

## 目录结构

```
网站创建/
├── data/
│   ├── cases.json          # 主资料库
│   ├── podcast.json        # 播客元数据与文稿
│   └── update_log.json     # 自动更新日志
├── scripts/
│   ├── update_database.py  # 抓取 EC 官网并更新
│   ├── generate_podcast.py # 周评脚本 + TTS 音频
│   └── setup_scheduler.ps1 # Windows 计划任务
├── web/
│   ├── index.html          # 表格 + 图表 + 播客
│   ├── audio/              # MP3 音频文件
│   ├── map.html            # 欧洲地图
│   ├── country.html        # 国家案例页
│   ├── css/
│   └── js/
├── requirements.txt
└── README.md
```

## 重新生成 GeoJSON 地图数据

若需更新国界矢量数据：

```powershell
# 下载 Natural Earth 50m 国家边界后执行
py -3 scripts\build_europe_geojson.py
```

输出文件：`web/data/europe.geojson`

## 扩展案例

编辑 `data/cases.json`，在 `cases` 数组中按现有字段添加新对象。下次自动更新不会删除手工条目，仅追加 `framework_updates` 与可能的时间线备注。

## 官方数据来源

- [Investment Screening in the EU](https://policy.trade.ec.europa.eu/enforcement-and-protection/investment-screening_en)
- [Trade DG News](https://policy.trade.ec.europa.eu/news)
- [FDI Screening — Access2Markets](https://trade.ec.europa.eu/access-to-markets/en/content/fdi-screening)
