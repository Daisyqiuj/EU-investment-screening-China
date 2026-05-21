#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""将欧盟27国涉华投资审查案例合并入 cases.json"""
import json
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CASES_FILE = ROOT / "data" / "cases.json"

NEW_CASES = [
    {
        "id": "DE-2018-LEIFELD",
        "country": "DE",
        "country_name": "德国",
        "country_name_en": "Germany",
        "region": "EU",
        "target_company": "Leifeld Metal Spinning AG",
        "target_sector": "航空航天 / 民用核技术",
        "target_sector_en": "Aerospace / Civil nuclear",
        "investor": "Yantai Taihai（烟台台海）",
        "investor_origin": "CN",
        "deal_type": "收购",
        "deal_value_eur": None,
        "notification_date": "2018",
        "decision_date": "2018-08-01",
        "outcome": "禁止",
        "outcome_en": "Prohibited (bid withdrawn)",
        "mechanism": "德国外商投资审查（AWV）",
        "mechanism_en": "German FDI screening",
        "eu_notified": False,
        "summary_zh": "烟台台海拟收购莱费尔德（航空与民用核金属旋压技术）；内阁拟于8月1日否决，投资方同日撤回要约。为德国强化 FDI 规则后欧洲首例有效阻止涉华收购案之一。",
        "summary_en": "Yantai Taihai withdrew bid as Germany prepared first veto under tightened FDI rules over nuclear/aerospace tech risks.",
        "sources": [
            {"url": "https://www.bbc.com/news/world-europe-45030537", "title": "BBC: Chinese takeover of Leifeld collapses"},
            {"url": "https://natlawreview.com/article/germany-s-first-veto-against-foreign-investment-under-new-fdi-rules", "title": "Nat Law Review"}
        ],
        "timeline": [
            {"date": "2018-08-01", "event": "投资方撤回；政府拟否决未正式签署"}
        ],
        "tags": ["航空航天", "核电", "撤回要约"],
        "status": "closed"
    },
    {
        "id": "DE-2018-50HERTZ",
        "country": "DE",
        "country_name": "德国",
        "country_name_en": "Germany",
        "region": "EU",
        "target_company": "50Hertz Transmission GmbH（20%股权）",
        "target_sector": "电力传输 / 关键基础设施",
        "target_sector_en": "Electricity transmission",
        "investor": "State Grid Corporation of China（国家电网）",
        "investor_origin": "CN",
        "deal_type": "少数股权收购",
        "deal_value_eur": None,
        "notification_date": "2018",
        "decision_date": "2018-07",
        "outcome": "禁止",
        "outcome_en": "Blocked",
        "mechanism": "德国外商投资审查 + KfW 国有化介入",
        "mechanism_en": "German FDI screening / KfW buy-in",
        "eu_notified": False,
        "summary_zh": "联邦政府推动 KfW 收购 IFM 拟出售给国家电网的 50Hertz 20%股权，以先买权方式阻止中国国企进入德国高压电网运营商。",
        "summary_en": "Berlin had KfW acquire 50Hertz stake to block State Grid from 20% holding in critical transmission operator.",
        "sources": [
            {"url": "https://www.dw.com/en/berlin-beats-chinese-firm-to-buy-stake-in-50hertz-power-company/a-44848676", "title": "DW: Berlin stops Chinese stake in 50Hertz"},
            {"url": "https://www.jonesday.com/en/insights/2018/08/germany-blocks-two-transactions-involving-chinese", "title": "Jones Day"}
        ],
        "timeline": [{"date": "2018-07", "event": "KfW 代政府收购股权阻止国网"}],
        "tags": ["能源", "关键基础设施", "国家电网"],
        "status": "closed"
    },
    {
        "id": "DE-2022-ERS",
        "country": "DE",
        "country_name": "德国",
        "country_name_en": "Germany",
        "region": "EU",
        "target_company": "ERS electronic GmbH",
        "target_sector": "半导体设备",
        "target_sector_en": "Semiconductor equipment",
        "investor": "中国私募股权投资者（未公开）",
        "investor_origin": "CN",
        "deal_type": "收购",
        "deal_value_eur": None,
        "notification_date": "2022",
        "decision_date": "2022-11-09",
        "outcome": "禁止",
        "outcome_en": "Prohibited",
        "mechanism": "德国外商投资审查（AWV）",
        "mechanism_en": "German FDI screening",
        "eu_notified": True,
        "summary_zh": "与 Elmos 同日，BMWK 禁止未披露中国投资者收购巴伐利亚半导体设备商 ERS electronic，理由为技术与经济主权。",
        "summary_en": "BMWK blocked undisclosed Chinese PE acquirer of ERS electronic on same day as Elmos decision.",
        "sources": [
            {"url": "https://www.euronews.com/next/2022/11/09/germany-china-ers", "title": "Euronews"},
            {"url": "http://www.dw.com/en/germany-halts-chinese-buyouts-of-semiconductor-firms/a-63693350", "title": "DW"}
        ],
        "timeline": [{"date": "2022-11-09", "event": "内阁禁止收购"}],
        "tags": ["半导体设备", "禁止交易"],
        "status": "closed"
    },
    {
        "id": "DE-2022-HEYER",
        "country": "DE",
        "country_name": "德国",
        "country_name_en": "Germany",
        "region": "EU",
        "target_company": "Heyer Medical AG",
        "target_sector": "医疗器械（麻醉/呼吸机）",
        "target_sector_en": "Medical devices",
        "investor": "Aeonmed Group（怡和嘉业）",
        "investor_origin": "CN",
        "deal_type": "收购（破产程序后）",
        "deal_value_eur": None,
        "notification_date": "2020",
        "decision_date": "2022",
        "outcome": "附条件批准",
        "outcome_en": "Prohibited then cleared after court",
        "mechanism": "德国外商投资审查（AWV）",
        "mechanism_en": "German FDI screening",
        "eu_notified": True,
        "summary_zh": "2022年 BMWK 以公共卫生与安全禁止怡和嘉业收购 Heyer；2023年11月柏林行政法院以程序违法撤销禁令，交易最终完成。体现审查与司法博弈。",
        "summary_en": "2022 prohibition annulled in 2023 on procedural grounds; Aeonmed ultimately completed acquisition.",
        "sources": [
            {"url": "https://www.orrick.com/en/News/2023/11/Orrick-represents-AEONMED-in-successful-action-against-ministerial-prohibition-to-acquire-Heyer", "title": "Orrick"},
            {"url": "https://www.handelsblatt.com/politik/deutschland/heyer-medical-regierung-untersagt-chinesische-uebernahme-von-beatmungsgeraete-hersteller/28281882.html", "title": "Handelsblatt"}
        ],
        "timeline": [
            {"date": "2020-03", "event": "破产程序中签署收购"},
            {"date": "2022", "event": "BMWK 发布禁止令"},
            {"date": "2023-11-15", "event": "行政法院撤销禁止决定"},
            {"date": "2023", "event": "交易完成"}
        ],
        "tags": ["医疗器械", "程序争议", "最终批准"],
        "status": "closed"
    },
    {
        "id": "IT-2021-LPE",
        "country": "IT",
        "country_name": "意大利",
        "country_name_en": "Italy",
        "region": "EU",
        "target_company": "LPE S.p.A.",
        "target_sector": "半导体设备",
        "target_sector_en": "Semiconductor equipment",
        "investor": "Shenzhen Investment Holdings（深圳投控）",
        "investor_origin": "CN",
        "deal_type": "收购（70%股权）",
        "deal_value_eur": None,
        "notification_date": "2020-12",
        "decision_date": "2021-03-31",
        "outcome": "禁止",
        "outcome_en": "Prohibited",
        "mechanism": "意大利 Golden Power",
        "mechanism_en": "Italy Golden Power",
        "eu_notified": True,
        "summary_zh": "德拉吉政府首次动用 Golden Power 否决深圳投控收购米兰半导体设备商 LPE 70%股权，称威胁「意大利制造」与供应链安全。",
        "summary_en": "Draghi government vetoed Shenzhen Investment Holdings' 70% acquisition of LPE under Golden Power.",
        "sources": [
            {"url": "https://www.politico.eu/article/italy-golden-power-limit-sinochem-shareholder-pirelli-national-security-critical-technology/", "title": "POLITICO context"},
            {"url": "https://www.repubblica.it/economia/2021/04/09/news/golden_power_dis-295721717/", "title": "La Repubblica"}
        ],
        "timeline": [
            {"date": "2020-12", "event": "深圳投控完成交割（后被追溯审查）"},
            {"date": "2021-03-31", "event": "Golden Power 否决令"}
        ],
        "tags": ["半导体", "黄金权力", "否决"],
        "status": "closed"
    },
    {
        "id": "IT-2022-ROBOX",
        "country": "IT",
        "country_name": "意大利",
        "country_name_en": "Italy",
        "region": "EU",
        "target_company": "ROBOX S.p.A.",
        "target_sector": "工业机器人 / 运动控制",
        "target_sector_en": "Robotics / Motion control",
        "investor": "EFORT Intelligent Equipment（埃夫特）",
        "investor_origin": "CN",
        "deal_type": "增资 + 技术许可",
        "deal_value_eur": 2000000,
        "notification_date": "2022",
        "decision_date": "2022-06",
        "outcome": "附条件批准",
        "outcome_en": "Partial approval",
        "mechanism": "意大利 Golden Power",
        "mechanism_en": "Italy Golden Power",
        "eu_notified": True,
        "summary_zh": "批准埃夫特将 ROBOX 持股提高至49%，但否决向中方转让源代码与技术许可（约€100万），防止关键技术外流。",
        "summary_en": "Stake increase to 49% allowed but technology transfer and source-code licensing to EFORT blocked.",
        "sources": [
            {"url": "https://www.euronews.com/2022/06/07/italy-china-mergers-veto", "title": "Euronews"},
            {"url": "https://globalcompetitionreview.com/gcr-fic/article/italy-uses-national-security-power-block-chinese-investment-in-robot-maker", "title": "GCR FIC"}
        ],
        "timeline": [
            {"date": "2022-06", "event": "Golden Power：股权放行、技术转让禁止"}
        ],
        "tags": ["机器人", "技术转让", "部分禁止"],
        "status": "closed"
    },
    {
        "id": "IT-2020-FASTWEB-HUAWEI",
        "country": "IT",
        "country_name": "意大利",
        "country_name_en": "Italy",
        "region": "EU",
        "target_company": "Fastweb 5G 核心网供应合同",
        "target_sector": "电信 / 5G",
        "target_sector_en": "Telecom / 5G",
        "investor": "Huawei Technologies（华为）",
        "investor_origin": "CN",
        "deal_type": "供应合同 / 投资相关协议",
        "deal_value_eur": None,
        "notification_date": "2020",
        "decision_date": "2020-10",
        "outcome": "禁止",
        "outcome_en": "Prohibited",
        "mechanism": "意大利 Golden Power（5G 安全）",
        "mechanism_en": "Italy Golden Power 5G",
        "eu_notified": False,
        "summary_zh": "意大利政府首次明确动用 Golden Power 否决 Fastweb 与华为独家 5G 核心网合作，并收紧非欧洲 5G 供应商安全要求。",
        "summary_en": "Italy vetoed Fastweb-Huawei 5G core network deal under Golden Power 5G security rules.",
        "sources": [
            {"url": "https://www.euractiv.com/section/digital/news/italy-vetoes-5g-deal-between-fastweb-and-chinas-huawei-sources/", "title": "Euractiv"},
            {"url": "https://formiche.net/2020/07/italy-5g-security-measures-impair-huawei-zte/", "title": "Formiche.net"}
        ],
        "timeline": [{"date": "2020-10", "event": "否决 Fastweb-华为 5G 核心网协议"}],
        "tags": ["5G", "华为", "电信"],
        "status": "closed"
    },
    {
        "id": "IT-2018-ESAOTE",
        "country": "IT",
        "country_name": "意大利",
        "country_name_en": "Italy",
        "region": "EU",
        "target_company": "Esaote S.p.A.",
        "target_sector": "医疗影像设备",
        "target_sector_en": "Medical imaging",
        "investor": "中国财团（裕丰资本、万东医疗等六家）",
        "investor_origin": "CN",
        "deal_type": "收购",
        "deal_value_eur": 350000000,
        "notification_date": "2017-12",
        "decision_date": "2018-02",
        "outcome": "附条件批准",
        "outcome_en": "Approved with conditions",
        "mechanism": "意大利 Golden Power 审查",
        "mechanism_en": "Italy Golden Power review",
        "eu_notified": False,
        "summary_zh": "政府确认无 Golden Power 异议并附条件：总部与研发保留热那亚、不迁产中国、维持独立国际运营。",
        "summary_en": "Chinese consortium acquired Esaote with government conditions keeping HQ/R&D in Italy.",
        "sources": [
            {"url": "https://www.medicaldevice-network.com/news/chinese-consortium-acquire-italys-esaote/", "title": "Medical Device Network"},
            {"url": "https://bflexion.com/news/change-ownership-esaote", "title": "B-FLEXION"}
        ],
        "timeline": [
            {"date": "2017-12-07", "event": "签署收购协议"},
            {"date": "2018-04", "event": "交割完成"}
        ],
        "tags": ["医疗器械", "附条件批准"],
        "status": "closed"
    },
    {
        "id": "IT-2024-MANTA",
        "country": "IT",
        "country_name": "意大利",
        "country_name_en": "Italy",
        "region": "EU",
        "target_company": "Manta Aircraft S.r.l.（民用客机 ANN Plus 项目）",
        "target_sector": "航空航天",
        "target_sector_en": "Aerospace",
        "investor": "Shenyang Aviation Industries Group（沈阳航空工业集团）",
        "investor_origin": "CN",
        "deal_type": "合资 / 技术合作",
        "deal_value_eur": None,
        "notification_date": "2024",
        "decision_date": "2024-10-29",
        "outcome": "禁止",
        "outcome_en": "Prohibited",
        "mechanism": "意大利 Golden Power",
        "mechanism_en": "Italy Golden Power",
        "eu_notified": True,
        "summary_zh": "2024年 Meloni 政府唯一 Golden Power 否决：阻止 Manta Aircraft 与沈阳航空工业集团就民用客机原型及技术合作的合资， citing 敏感技术外流风险。",
        "summary_en": "2024 sole Golden Power veto blocked Manta-SAIG civil aircraft JV over sensitive tech transfer.",
        "sources": [
            {"url": "https://decode39.com/11175/italy-s-sole-2024-veto-targeted-a-sino-italian-venture/", "title": "Decode39"},
            {"url": "https://www.malpensa24.it/sesto-calende-manta-aircraft/", "title": "Malpensa24"}
        ],
        "timeline": [{"date": "2024-10-29", "event": "总统令正式否决合资"}],
        "tags": ["航空航天", "合资", "2024唯一否决"],
        "status": "closed"
    },
    {
        "id": "NL-2022-NOWI",
        "country": "NL",
        "country_name": "荷兰",
        "country_name_en": "Netherlands",
        "region": "EU",
        "target_company": "Nowi B.V.",
        "target_sector": "半导体 / 能量收集芯片",
        "target_sector_en": "Semiconductors",
        "investor": "Nexperia B.V.（闻泰科技/Wingtech 旗下）",
        "investor_origin": "CN",
        "deal_type": "收购",
        "deal_value_eur": None,
        "notification_date": "2022-11",
        "decision_date": "2023-11",
        "outcome": "批准",
        "outcome_en": "Approved after review",
        "mechanism": "荷兰投资筛查法（Vifo 2023）",
        "mechanism_en": "Dutch Investment Screening Act",
        "eu_notified": True,
        "summary_zh": "2022年11月 Nexperia（中资）收购代尔夫特芯片初创 Nowi；2023年6月新法生效后 retroactive 审查，2023年11月经济部在国家安全调查后批准。",
        "summary_en": "Dutch authorities reviewed and approved Nexperia's acquisition of Nowi under new screening law.",
        "sources": [
            {"url": "https://www.politico.eu/article/netherlands-probe-china-microchips-takeover-nowi-nexperia-wingtech/", "title": "POLITICO"},
            {"url": "https://www.yicaiglobal.com/news/chinas-wingtech-rises-after-dutch-unit-nexperia-gets-approval-to-buy-local-chip-startup-nowi", "title": "Yicai Global"}
        ],
        "timeline": [
            {"date": "2022-11", "event": "Nexperia 宣布收购 Nowi"},
            {"date": "2023-06", "event": "荷兰投资筛查法生效"},
            {"date": "2023-11", "event": "经济部批准交易"}
        ],
        "tags": ["半导体", "审查后批准", "闻泰科技"],
        "status": "closed"
    },
    {
        "id": "NL-2025-NEXPERIA",
        "country": "NL",
        "country_name": "荷兰",
        "country_name_en": "Netherlands",
        "region": "EU",
        "target_company": "Nexperia B.V.（治理与资产）",
        "target_sector": "半导体制造",
        "target_sector_en": "Semiconductor manufacturing",
        "investor": "Wingtech Technology / 闻泰科技（母公司）",
        "investor_origin": "CN",
        "deal_type": "政府干预（非典型收购审查）",
        "deal_value_eur": 3600000000,
        "notification_date": "2019",
        "decision_date": "2025-10-12",
        "outcome": "政府干预",
        "outcome_en": "Government intervention",
        "mechanism": "荷兰《商品供应法》+ FDI 政策",
        "mechanism_en": "Goods Availability Act / FDI policy",
        "eu_notified": True,
        "summary_zh": "2025年9-10月荷经济部长以技术外流与治理风险为由，罕见动用《商品供应法》对 Nexperia（2019年被闻泰收购）实施临时管控，限制向母公司转移产能与 IP；中方上诉中。",
        "summary_en": "Oct 2025 Dutch minister invoked Goods Availability Act to temporarily control Nexperia over IP/capacity transfer risks to Wingtech parent.",
        "sources": [
            {"url": "https://www.bruegel.org/newsletter/nexperia-crisis-wake-call-europes-approach-chinese-investment", "title": "Bruegel"},
            {"url": "https://www.loyensloeff.com/insights/news--events/news/emerging-fdi-dynamics-recent-developments-concerning-nexperia/", "title": "Loyens & Loeff"}
        ],
        "timeline": [
            {"date": "2019", "event": "闻泰收购 Nexperia"},
            {"date": "2025-09", "event": "部长启动干预程序"},
            {"date": "2025-10-12", "event": "临时管控令确认"}
        ],
        "tags": ["半导体", "政府接管", "闻泰科技", "进行中"],
        "status": "ongoing"
    },
    {
        "id": "CZ-2021-EMPOSAT",
        "country": "CZ",
        "country_name": "捷克",
        "country_name_en": "Czech Republic",
        "region": "EU",
        "target_company": "Emposat 卫星地面站项目（南摩拉维亚）",
        "target_sector": "航天 / 卫星基础设施",
        "target_sector_en": "Satellite infrastructure",
        "investor": "Emposat（北京总部）",
        "investor_origin": "CN",
        "deal_type": "绿地投资",
        "deal_value_eur": None,
        "notification_date": "2021",
        "decision_date": "2021",
        "outcome": "禁止",
        "outcome_en": "Prohibited",
        "mechanism": "捷克《外国投资 Screening法》",
        "mechanism_en": "Czech Foreign Investment Screening Act",
        "eu_notified": True,
        "summary_zh": "捷克政府首次依外资审查法禁止北京 Emposat 在捷运营卫星地面站，指间谍活动与国家安全风险。",
        "summary_en": "First Czech prohibition under FDI screening act blocked Chinese Emposat satellite ground station.",
        "sources": [
            {"url": "https://www.euractiv.com/section/politics/news/czech-government-blocks-chinese-investment-over-spy-fears/", "title": "Euractiv"}
        ],
        "timeline": [{"date": "2021", "event": "政府禁止投资"}],
        "tags": ["卫星", "首次禁止", "国家安全"],
        "status": "closed"
    },
    {
        "id": "SE-2024-PUTAILAI",
        "country": "SE",
        "country_name": "瑞典",
        "country_name_en": "Sweden",
        "region": "EU",
        "target_company": "Torsboda 负极材料工厂（绿地项目）",
        "target_sector": "电池 / 关键原材料",
        "target_sector_en": "Batteries / Critical materials",
        "investor": "Shanghai Putailai New Energy Technology（璞泰来，经新加坡子公司）",
        "investor_origin": "CN",
        "deal_type": "绿地投资",
        "deal_value_eur": 1300000000,
        "notification_date": "2024-02",
        "decision_date": "2024-12-17",
        "outcome": "禁止",
        "outcome_en": "Prohibited",
        "mechanism": "瑞典《战略性外国直接投资审查法》(2023:560)",
        "mechanism_en": "Swedish FDI Screening Act",
        "eu_notified": True,
        "summary_zh": "战略产品inspectorate (ISP) 首次禁止外资：璞泰来在蒂姆罗建欧洲最大锂电池负极材料厂；曾提出董事会须为瑞典籍等条件，投资方未满足。",
        "summary_en": "ISP's first prohibition blocked Putailai greenfield battery anode plant after conditional approval failed.",
        "sources": [
            {"url": "https://www.delphi.se/eu-competition-blog/the-isp-is-showcasing-its-ability-to-safeguard-swedens-strategic-interests-by-blocking-a-foreign-direct-investment-and-imposing-fines-for-failure-to-notify-on-time/", "title": "Delphi"},
            {"url": "https://kinacentrum.se/en/publications/the-putailai-investment-case-geopolitical-challenges-for-municipalities-in-sweden/", "title": "Swedish National China Centre"}
        ],
        "timeline": [
            {"date": "2024-02-09", "event": "提交审查通知"},
            {"date": "2024-06-12", "event": "启动深入审查"},
            {"date": "2024-12-17", "event": "ISP 发布禁止决定"}
        ],
        "tags": ["电池", "绿地投资", "首例禁止"],
        "status": "ongoing"
    },
    {
        "id": "AT-2025-JDCOM",
        "country": "AT",
        "country_name": "奥地利",
        "country_name_en": "Austria",
        "region": "EU",
        "target_company": "Ceconomy AG（MediaMarkt/Saturn 母公司）",
        "target_sector": "消费电子零售",
        "target_sector_en": "Consumer electronics retail",
        "investor": "JD.com（京东）",
        "investor_origin": "CN",
        "deal_type": "收购要约",
        "deal_value_eur": 2200000000,
        "notification_date": "2025",
        "decision_date": "2025",
        "outcome": "审查中",
        "outcome_en": "Under review / not approved",
        "mechanism": "奥地利投资控制法（InvKG）",
        "mechanism_en": "Austrian Investment Control Act",
        "eu_notified": True,
        "summary_zh": "奥地利经济部据 InvKG 对京东约€22亿收购 Ceconomy（MediaMarkt）开展安全审查；媒体报道政府倾向不予批准，涉敏感数据与外国政府影响担忧。",
        "summary_en": "Austria reviewing JD.com's €2.2bn Ceconomy bid under InvKG; reports suggest likely rejection on security grounds.",
        "sources": [
            {"url": "https://www.vindobona.org/article/austria-blocks-chinese-jd-com-rsquo-s-acquisition-of-mediamarkt", "title": "Vindobona"},
            {"url": "https://www.bloomberg.com/news/articles/2026-03-27/austria-declines-to-approve-jd-com-s-offer-to-buy-ceconomy", "title": "Bloomberg"}
        ],
        "timeline": [
            {"date": "2025", "event": "京东提出收购 Ceconomy"},
            {"date": "2025", "event": "奥地利启动 InvKG 审查"}
        ],
        "tags": ["零售", "京东", "审查中"],
        "status": "ongoing"
    },
    {
        "id": "PT-2018-EDP-CTG",
        "country": "PT",
        "country_name": "葡萄牙",
        "country_name_en": "Portugal",
        "region": "EU",
        "target_company": "EDP - Energias de Portugal SA",
        "target_sector": "电力公用事业",
        "target_sector_en": "Electric utilities",
        "investor": "China Three Gorges Corporation（中国三峡集团）",
        "investor_origin": "CN",
        "deal_type": "全面要约收购",
        "deal_value_eur": 9100000000,
        "notification_date": "2018-05",
        "decision_date": "2019-04",
        "outcome": "交易失败",
        "outcome_en": "Deal failed",
        "mechanism": "葡萄牙证券市场规则 + 欧盟 FDI 合作关注",
        "mechanism_en": "Portuguese securities rules / EU scrutiny",
        "eu_notified": True,
        "summary_zh": "三峡集团2018年对 EDP 发起€91亿全面要约；经监管与股东表决，2019年4月因投票权上限条款未通过而失败，反映欧盟对中资控股战略公用事业的警惕。",
        "summary_en": "CTG's €9.1bn EDP takeover failed in April 2019 after shareholders rejected voting-rights changes required for deal.",
        "sources": [
            {"url": "https://www.france24.com/en/20190424-energias-de-portugal-shareholders-block-takeover-bid-china-three-gorges", "title": "France24"},
            {"url": "https://www.datenna.com/resources/the-acquisition-of-edp/", "title": "Datenna"}
        ],
        "timeline": [
            {"date": "2011-12", "event": "三峡入股 EDP 约22%"},
            {"date": "2018-05", "event": "发起全面收购要约"},
            {"date": "2019-04", "event": "股东大会否决相关章程修改"}
        ],
        "tags": ["能源", "公用事业", "全面要约失败"],
        "status": "closed"
    },
    {
        "id": "RO-2020-CGN",
        "country": "RO",
        "country_name": "罗马尼亚",
        "country_name_en": "Romania",
        "region": "EU",
        "target_company": "切尔纳沃达核电站扩建项目",
        "target_sector": "核电",
        "target_sector_en": "Nuclear power",
        "investor": "China General Nuclear Power Corporation（中广核）",
        "investor_origin": "CN",
        "deal_type": "战略合作 / 投资",
        "deal_value_eur": None,
        "notification_date": "2019",
        "decision_date": "2020",
        "outcome": "禁止",
        "outcome_en": "Deal cancelled",
        "mechanism": "罗马尼亚能源安全政策 / 外资审查",
        "mechanism_en": "Romanian energy security policy",
        "eu_notified": False,
        "summary_zh": "罗马尼亚取消与中广核的切尔纳沃达核电扩建合作，改选美加法罗 consortium，反映对中资控制关键能源基础设施的担忧。",
        "summary_en": "Romania cancelled CGN nuclear expansion partnership, selecting US-led consortium instead.",
        "sources": [
            {"url": "https://www.politico.eu/article/romania-recoils-from-china-aggressive-diplomacy/", "title": "POLITICO"},
            {"url": "https://www.intellinews.com/romania-to-ban-chinese-companies-from-big-infrastructure-projects-204529", "title": "IntelliNews"}
        ],
        "timeline": [
            {"date": "2020", "event": "政府终止与中广核谈判"}
        ],
        "tags": ["核电", "基础设施", "战略合作终止"],
        "status": "closed"
    },
    {
        "id": "RO-2021-INFRA-MEMO",
        "country": "RO",
        "country_name": "罗马尼亚",
        "country_name_en": "Romania",
        "region": "EU",
        "target_company": "大型公共基础设施招标（公路/铁路）",
        "target_sector": "交通基础设施",
        "target_sector_en": "Transport infrastructure",
        "investor": "中国企业（普遍适用）",
        "investor_origin": "CN",
        "deal_type": "公共采购限制",
        "deal_value_eur": None,
        "notification_date": "2021",
        "decision_date": "2021",
        "outcome": "限制参与",
        "outcome_en": "Restricted",
        "mechanism": "政府备忘录 / 安全审查政策",
        "mechanism_en": "Government memorandum",
        "eu_notified": False,
        "summary_zh": "罗马尼亚政府备忘录实质排除无欧盟双边贸易安排国家企业（含中国）参与大型基建招标，以国家安全与公平竞争为由。",
        "summary_en": "Romania memorandum effectively bars Chinese firms from major public infrastructure tenders.",
        "sources": [
            {"url": "https://www.euractiv.com/section/economy-jobs/news/romania-issues-memorandum-blocking-chinese-firms-from-public-infrastructure-projects/", "title": "Euractiv"}
        ],
        "timeline": [{"date": "2021", "event": "发布限制中资参与大型基建备忘录"}],
        "tags": ["公共采购", "基础设施", "政策限制"],
        "status": "closed"
    },
    {
        "id": "ES-2016-ARITEX",
        "country": "ES",
        "country_name": "西班牙",
        "country_name_en": "Spain",
        "region": "EU",
        "target_company": "Aritex Cabrera S.A.",
        "target_sector": "航空航天制造（军民两用）",
        "target_sector_en": "Aerospace manufacturing",
        "investor": "AVIC（中国航空工业集团）+ 大族激光",
        "investor_origin": "CN",
        "deal_type": "收购（95%）",
        "deal_value_eur": None,
        "notification_date": "2016",
        "decision_date": "2016",
        "outcome": "批准",
        "outcome_en": "Approved (pre-enhanced screening)",
        "mechanism": "当时西班牙外资规则（后强化）",
        "mechanism_en": "Spanish FDI rules (later strengthened)",
        "eu_notified": False,
        "summary_zh": "2016年中航工业与大族激光收购空客/波音供应商 Aritex 95%股权；发生在西班牙2020年强化审查机制之前，属 retrospectively 敏感案例。",
        "summary_en": "2016 Chinese SOE consortium acquired 95% of Airbus/Boeing supplier Aritex before Spain's 2020 screening overhaul.",
        "sources": [
            {"url": "https://www.datenna.com/resources/the-acquisition-of-aritex/", "title": "Datenna"}
        ],
        "timeline": [{"date": "2016", "event": "完成收购"}],
        "tags": ["航空航天", "历史批准", "军民两用"],
        "status": "closed"
    },
    {
        "id": "PL-REGIME-NO-VETO",
        "country": "PL",
        "country_name": "波兰",
        "country_name_en": "Poland",
        "region": "EU",
        "target_company": "N/A（机制运行）",
        "target_sector": "跨部门（战略实体清单）",
        "target_sector_en": "Cross-sector",
        "investor": "中国等多国投资者",
        "investor_origin": "CN",
        "deal_type": "机制统计",
        "deal_value_eur": None,
        "notification_date": "2020",
        "decision_date": "2024",
        "outcome": "无公开否决",
        "outcome_en": "No public prohibition",
        "mechanism": "波兰外资审查（UOKiK / 2020年法）",
        "mechanism_en": "Polish FDI screening (UOKiK)",
        "eu_notified": True,
        "summary_zh": "2020年起 UOKiK 审查非欧盟对战略实体投资；截至2024年公开资料未见否决涉华交易（7起批准、1起深入审查），但政策对华趋严。",
        "summary_en": "Polish FDI regime active since 2020; no publicly reported Chinese deal prohibitions as of 2024.",
        "sources": [
            {"url": "https://www.lexology.com/library/detail.aspx?g=37ad37c5-4efd-4482-bcf8-4677773a7d43", "title": "Lexology: Poland FDI 2024"},
            {"url": "https://csm.org.pl/chinese-investments-in-poland-screening-procedures-and-controversial-cases/", "title": "CSM Poland"}
        ],
        "timeline": [
            {"date": "2020-07", "event": "修订外资审查法生效"},
            {"date": "2024", "event": "UOKiK 发布最新程序指南"}
        ],
        "tags": ["机制运行", "无公开个案"],
        "status": "ongoing"
    },
]

# Per-member-state mechanism notes where no public Chinese case veto found
MECHANISM_ONLY = [
    ("FR", "法国", "French IEF / Golden Power", "法国 IEF 机制2022年审查325宗；公开渠道未见明确禁止中资并购案（存在对美企否决），对华为5G采取事实限制。"),
    ("BE", "比利时", "Belgian FDI screening", "2022年建立协调机制；未见公开涉华禁止案例。"),
    ("BG", "保加利亚", "Bulgarian IPA FDI screening", "2024-2025年建立审查机制；未见公开涉华个案。"),
    ("HR", "克罗地亚", "Croatian FDI screening", "机制完善中；未见公开涉华禁止案例。"),
    ("CY", "塞浦路斯", "Cyprus FDI screening", "机制制定中；未见公开涉华个案。"),
    ("DK", "丹麦", "Danish Investment Screening Act", "2021年通过审查法；未见公开涉华禁止个案。"),
    ("EE", "爱沙尼亚", "Estonian FDI screening", "依欧盟条例协调；未见公开涉华禁止个案。"),
    ("FI", "芬兰", "Finnish FDI Act 2020", "审查偏自由；公开资料未见禁止涉华投资，多以风险沟通化解。"),
    ("GR", "希腊", "Greek FDI screening", "2025年建立机制；未见公开涉华否决个案。"),
    ("HU", "匈牙利", "Hungarian FDI Act", "积极吸引中资（电池、电动车）；审查机制下禁止率<3%，未见公开涉华否决。"),
    ("IE", "爱尔兰", "Irish Screening of Third Country Transactions Act 2023", "2025年1月生效；尚无公开涉华审查个案。"),
    ("LU", "卢森堡", "Luxembourg FDI screening", "2023年机制；未见公开涉华禁止案例。"),
    ("LV", "拉脱维亚", "Latvian FDI screening", "与立陶宛类似立场；除区域安全事件外未见单独涉华并购否决。"),
    ("MT", "马耳他", "Malta FDI screening", "机制运行；未见公开涉华个案。"),
    ("SK", "斯洛伐克", "Slovak FDI screening", "机制运行；未见公开涉华禁止个案。"),
    ("SI", "斯洛文尼亚", "Slovenian FDI screening", "机制运行；未见公开涉华禁止个案。"),
]


def mechanism_case(code, name_zh, mech_en, summary_zh):
    return {
        "id": f"{code}-MECH-NO-PUBLIC",
        "country": code,
        "country_name": name_zh,
        "country_name_en": mech_en.split()[0] if mech_en else code,
        "region": "EU",
        "target_company": "N/A（机制运行 / 无公开涉华否决）",
        "target_sector": "跨部门",
        "target_sector_en": "Cross-sector",
        "investor": "中国投资者（监测中）",
        "investor_origin": "CN",
        "deal_type": "机制说明",
        "deal_value_eur": None,
        "notification_date": None,
        "decision_date": "2025",
        "outcome": "无公开否决",
        "outcome_en": "No public prohibition",
        "mechanism": mech_en,
        "mechanism_en": mech_en,
        "eu_notified": True,
        "summary_zh": summary_zh,
        "summary_en": "FDI screening active; no publicly documented prohibition of Chinese investor deal.",
        "sources": [],
        "timeline": [{"date": "2025", "event": "持续监测公开来源"}],
        "tags": ["机制运行", "欧盟27国覆盖"],
        "status": "ongoing",
    }


def main():
    data = json.loads(CASES_FILE.read_text(encoding="utf-8"))
    existing_ids = {c["id"] for c in data["cases"]}
    added = 0
    for case in NEW_CASES:
        if case["id"] not in existing_ids:
            data["cases"].append(case)
            existing_ids.add(case["id"])
            added += 1
    for code, name_zh, mech, summary in MECHANISM_ONLY:
        cid = f"{code}-MECH-NO-PUBLIC"
        if cid not in existing_ids:
            data["cases"].append(mechanism_case(code, name_zh, mech, summary))
            added += 1

    eu27 = [
        "AT", "BE", "BG", "HR", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR",
        "GR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO",
        "SE", "SI", "SK",
    ]
    with_cases = sorted({c["country"] for c in data["cases"] if c["country"] != "EU" and c["region"] == "EU"})
    data["meta"]["version"] = "2.0.0"
    data["meta"]["last_updated"] = datetime.now().astimezone().isoformat(timespec="seconds")
    data["meta"]["eu27_coverage"] = {
        "member_states": eu27,
        "countries_with_entries": with_cases,
        "total_cases": len([c for c in data["cases"] if c["country"] != "EU"]),
        "note": "含具体交易案例及「无公开否决」机制说明条目；英国(GB)案例保留为欧洲范围参考。",
    }

    CASES_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Added {added} cases. Total cases: {len(data['cases'])}")
    print(f"EU countries covered: {len(with_cases)}/27")


if __name__ == "__main__":
    main()
