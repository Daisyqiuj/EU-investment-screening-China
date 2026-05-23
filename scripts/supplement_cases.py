#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""补充公开文献记载的欧盟/欧洲涉华 FDI 审查案例，并修正既有条目。"""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CASES_FILE = ROOT / "data" / "cases.json"

NEW_CASES = [
    {
        "id": "DE-2020-IMST",
        "country": "DE",
        "country_name": "德国",
        "country_name_en": "Germany",
        "region": "EU",
        "target_company": "IMST GmbH",
        "target_sector": "卫星通信 / 雷达 / 5G",
        "target_sector_en": "Satellite / radar / 5G",
        "investor": "Addsino Co. Ltd（中国航天科工集团 CASIC 子公司）",
        "investor_origin": "CN",
        "deal_type": "收购",
        "deal_value_eur": None,
        "notification_date": "2020",
        "decision_date": "2020-12-02",
        "outcome": "禁止",
        "outcome_en": "Prohibited",
        "mechanism": "德国外商投资审查（AWV / 外贸条例）",
        "mechanism_en": "German FDI screening (AWV)",
        "eu_notified": True,
        "summary_zh": "联邦内阁禁止中国航天科工旗下 Addsino 收购北威州通信技术企业 IMST，防止卫星、雷达与 5G 毫米波等敏感技术流向中国国有防务集团。",
        "summary_en": "Cabinet blocked CASIC subsidiary Addsino from acquiring IMST citing public order and security in comms/satellite tech.",
        "sources": [
            {
                "url": "https://www.concurrences.com/en/bulletin/news-issues/december-2020/the-german-government-prohibits-the-acquisition-of-a-communications-technology",
                "title": "Concurrences: IMST / Addsino",
            },
            {
                "url": "https://www.jdsupra.com/legalnews/this-time-s-for-real-german-government-94391/",
                "title": "Hogan Lovells / JDSupra",
            },
        ],
        "timeline": [{"date": "2020-12-02", "event": "内阁批准禁止收购"}],
        "tags": ["5G", "雷达", "国有防务", "禁止交易"],
        "status": "closed",
    },
    {
        "id": "DE-2023-KLEO",
        "country": "DE",
        "country_name": "德国",
        "country_name_en": "Germany",
        "region": "EU",
        "target_company": "KLEO Connect GmbH",
        "target_sector": "低轨卫星通信",
        "target_sector_en": "LEO satellite communications",
        "investor": "Shanghai Spacecom Satellite Technology（SSST）",
        "investor_origin": "CN",
        "deal_type": "增持（45%，已持53%）",
        "deal_value_eur": None,
        "notification_date": "2023",
        "decision_date": "2023-09-13",
        "outcome": "禁止",
        "outcome_en": "Prohibited",
        "mechanism": "德国外商投资审查（AWV）",
        "mechanism_en": "German FDI screening (AWV)",
        "eu_notified": True,
        "summary_zh": "尽管中方已持 KLEO Connect 多数股权，BMWK 仍禁止 SSST 再收购 45% 以实现近乎全资，认定卫星通信关系公共安全。",
        "summary_en": "Germany blocked additional 45% stake purchase by SSST in majority-held satellite startup KLEO Connect.",
        "sources": [
            {
                "url": "https://www.zeit.de/wirtschaft/2023-09/bundesregierung-verbot-uebernahme-kleo-connect-china",
                "title": "DIE ZEIT",
            },
            {
                "url": "https://www.celis.institute/celis-blog/lessons-learned-from-the-kleo-connect-case/",
                "title": "CELI Institute",
            },
        ],
        "timeline": [
            {"date": "2018", "event": "中方首次获 KLEO 53% 股权（当时获无异议证明）"},
            {"date": "2023-09-13", "event": "内阁禁止进一步增持"},
        ],
        "tags": ["卫星", "低轨通信", "已持多数仍禁止"],
        "status": "closed",
    },
    {
        "id": "DE-2024-MAN",
        "country": "DE",
        "country_name": "德国",
        "country_name_en": "Germany",
        "region": "EU",
        "target_company": "MAN Energy Solutions 燃气轮机业务",
        "target_sector": "燃气轮机 / 军民两用",
        "target_sector_en": "Gas turbines / dual-use",
        "investor": "CSSC Longjiang GH Gas Turbine（中国船舶集团）",
        "investor_origin": "CN",
        "deal_type": "业务出售",
        "deal_value_eur": None,
        "notification_date": "2023",
        "decision_date": "2024-07",
        "outcome": "禁止",
        "outcome_en": "Prohibited",
        "mechanism": "德国外商投资审查（AWV）",
        "mechanism_en": "German FDI screening (AWV)",
        "eu_notified": True,
        "summary_zh": "德内阁禁止将中国船舶集团关联企业出售 MAN 燃气轮机业务，指国家安全与军民两用技术外流风险。",
        "summary_en": "German cabinet blocked sale of MAN gas turbine unit to CSSC-linked buyer on security grounds.",
        "sources": [
            {
                "url": "https://www.reuters.com/markets/deals/germany-blocks-sale-man-energys-gas-turbine-business-chinese-state-owned-shipbuilder-2024-07-03/",
                "title": "Reuters",
            },
            {
                "url": "https://merics.org/en/report/chinese-investment-rebounds-despite-growing-frictions-chinese-fdi-europe-2024-update",
                "title": "MERICS 2024 update",
            },
        ],
        "timeline": [
            {"date": "2023", "event": "交易进入外资审查"},
            {"date": "2024-07", "event": "内阁正式禁止"},
        ],
        "tags": ["燃气轮机", "军民两用", "能源装备"],
        "status": "closed",
    },
    {
        "id": "DE-2023-VISIBLE",
        "country": "DE",
        "country_name": "德国",
        "country_name_en": "Germany",
        "region": "EU",
        "target_company": "Visable GmbH（欧洲 B2B 平台）",
        "target_sector": "数字平台 / B2B",
        "target_sector_en": "Digital B2B platforms",
        "investor": "Alibaba.com（阿里巴巴国际）",
        "investor_origin": "CN",
        "deal_type": "少数股权投资",
        "deal_value_eur": None,
        "notification_date": "2023",
        "decision_date": "2023",
        "outcome": "批准",
        "outcome_en": "Approved",
        "mechanism": "德国外商投资审查（AWV）",
        "mechanism_en": "German FDI screening (AWV)",
        "eu_notified": True,
        "summary_zh": "阿里投资汉堡 B2B 平台 Visable；MERICS 2023 公开追踪案例显示德国审查后予以放行，体现并非所有涉华交易均被否决。",
        "summary_en": "Germany cleared Alibaba investment in Visable; listed as permitted case in MERICS 2023 tracking.",
        "sources": [
            {
                "url": "https://merics.org/sites/default/files/2024-06/merics-rhodium-group-chinese-fdi-in-europe-2023_1.pdf",
                "title": "MERICS/Rhodium 2023 report",
            },
        ],
        "timeline": [{"date": "2023", "event": "审查后批准"}],
        "tags": ["数字平台", "批准", "对照案例"],
        "status": "closed",
    },
    {
        "id": "DE-2024-CORNING-LASER",
        "country": "DE",
        "country_name": "德国",
        "country_name_en": "Germany",
        "region": "EU",
        "target_company": "Corning Laser Technologies（德国激光业务）",
        "target_sector": "激光 / 半导体设备",
        "target_sector_en": "Laser / semiconductor equipment",
        "investor": "Suzhou Delphi Laser Co. Ltd（德龙激光）",
        "investor_origin": "CN",
        "deal_type": "收购",
        "deal_value_eur": None,
        "notification_date": "2024",
        "decision_date": "2024-06",
        "outcome": "交易失败",
        "outcome_en": "Deal abandoned",
        "mechanism": "德国外商投资审查（AWV）+ 多国审批",
        "mechanism_en": "German FDI screening / multi-jurisdiction clearance",
        "eu_notified": True,
        "summary_zh": "德龙激光宣布放弃收购康宁德国激光业务，称因中德美监管审批前景不明；属审查压力下交易主动终止，非内阁正式否决令。",
        "summary_en": "Delphi Laser abandoned Corning Germany laser unit bid citing regulatory uncertainty in DE/CN/US.",
        "sources": [
            {
                "url": "https://www.yicaiglobal.com/news/chinas-delphi-gives-up-on-plan-to-acquire-apple-supplier-cornings-german-unit",
                "title": "Yicai Global",
            },
        ],
        "timeline": [{"date": "2024-06", "event": "投资方宣布放弃交易"}],
        "tags": ["激光", "半导体设备", "交易终止"],
        "status": "closed",
    },
    {
        "id": "FR-2025-JDCOM-FNAC",
        "country": "FR",
        "country_name": "法国",
        "country_name_en": "France",
        "region": "EU",
        "target_company": "Fnac Darty（间接，经 Ceconomy 22% 股权）",
        "target_sector": "消费电子零售 / 文化产品",
        "target_sector_en": "Consumer electronics retail",
        "investor": "JD.com（京东）",
        "investor_origin": "CN",
        "deal_type": "间接少数股权（随 Ceconomy 要约）",
        "deal_value_eur": None,
        "notification_date": "2025",
        "decision_date": "2025-11",
        "outcome": "附条件批准",
        "outcome_en": "Conditionally cleared",
        "mechanism": "法国 IEF（外国投资审查）",
        "mechanism_en": "French IEF screening",
        "eu_notified": True,
        "summary_zh": "法国 Bercy 对京东经 Ceconomy 间接进入 Fnac Darty 启动 IEF 审查；京东接受被动少数股东、无治理权、不增持及本地就业制造承诺等条件后放行。",
        "summary_en": "France cleared JD.com's indirect Fnac Darty stake via Ceconomy with strict passive-investor conditions.",
        "sources": [
            {
                "url": "https://www.lemonde.fr/economie/article/2025/11/26/le-site-chinois-jd-com-devient-le-deuxieme-actionnaire-de-fnac-darty-mais-sans-aucun-droit-de-gouvernance-assure-le-ministre-de-l-economie_6654872_3234.html",
                "title": "Le Monde",
            },
        ],
        "timeline": [
            {"date": "2025", "event": "京东提出收购 Ceconomy"},
            {"date": "2025-11", "event": "法国经济部附条件批准间接持股路径"},
        ],
        "tags": ["零售", "京东", "附条件", "IEF"],
        "status": "closed",
    },
    {
        "id": "IT-2021-VERISEM",
        "country": "IT",
        "country_name": "意大利",
        "country_name_en": "Italy",
        "region": "EU",
        "target_company": "Verisem B.V.（含 Franchi Sementi 等意大利种子资产）",
        "target_sector": "农业 / 蔬菜与香草种子",
        "target_sector_en": "Agri-food / seeds",
        "investor": "Syngenta Group（先正达，中国化工/ChemChina 旗下）",
        "investor_origin": "CN",
        "deal_type": "收购",
        "deal_value_eur": None,
        "notification_date": "2021",
        "decision_date": "2021-10",
        "outcome": "禁止",
        "outcome_en": "Prohibited (Golden Power)",
        "mechanism": "意大利 Golden Power（第21/2012号法）",
        "mechanism_en": "Italian Golden Power",
        "eu_notified": True,
        "summary_zh": "德拉吉政府动用 Golden Power 否决先正达收购 Verisem；2022 年 TAR Lazio 维持否决，理由为战略蔬菜/香草种子控制权不宜外流。",
        "summary_en": "Italy vetoed Syngenta's Verisem acquisition; administrative court upheld veto in 2022.",
        "sources": [
            {
                "url": "https://portolano.it/en/newsletter/portolano-cavallo-inform-corporate/italian-government-vetoes-acquisition-of-italian-seeds-producer-by-chinese-multinational-group",
                "title": "Portolano Cavallo",
            },
        ],
        "timeline": [
            {"date": "2021-10", "event": "政府否决收购"},
            {"date": "2022", "event": "TAR Lazio 维持否决"},
        ],
        "tags": ["农业", "种子", "Golden Power"],
        "status": "closed",
    },
    {
        "id": "BE-2023-AAC-PSS",
        "country": "BE",
        "country_name": "比利时",
        "country_name_en": "Belgium",
        "region": "EU",
        "target_company": "Premium Sound Solutions（PSS）",
        "target_sector": "汽车声学 / 电子",
        "target_sector_en": "Automotive acoustics",
        "investor": "AAC Technologies Holdings（瑞声科技）",
        "investor_origin": "CN",
        "deal_type": "收购",
        "deal_value_eur": 500000000,
        "notification_date": "2023",
        "decision_date": "2023-2024",
        "outcome": "批准",
        "outcome_en": "Approved",
        "mechanism": "比利时外商投资审查（2023年7月生效）",
        "mechanism_en": "Belgian FDI screening",
        "eu_notified": True,
        "summary_zh": "瑞声科技约 €5 亿收购登德尔蒙德汽车声学企业 PSS；系比利时 FDI 机制下公开的最大宗中资并购之一，审查后批准（BTI 年报未公开点名个案）。",
        "summary_en": "AAC Technologies' ~€500m acquisition of PSS cleared under Belgium's FDI regime.",
        "sources": [
            {
                "url": "https://www.lincolninternational.com/transactions/ardent-equity-and-ve-partners-have-sold-premium-sound-solutions-to-aac-technologies/",
                "title": "Lincoln International",
            },
        ],
        "timeline": [{"date": "2023-2024", "event": "完成交易与审查"}],
        "tags": ["汽车", "声学", "批准"],
        "status": "closed",
    },
    {
        "id": "UK-2022-NWF",
        "country": "GB",
        "country_name": "英国",
        "country_name_en": "United Kingdom",
        "region": "Europe",
        "target_company": "Newport Wafer Fab（NWF）",
        "target_sector": "化合物半导体",
        "target_sector_en": "Compound semiconductors",
        "investor": "Nexperia B.V.（闻泰科技 / Wingtech 旗下）",
        "investor_origin": "CN",
        "deal_type": "收购",
        "deal_value_eur": 63000000,
        "notification_date": "2021",
        "decision_date": "2022-11-16",
        "outcome": "政府干预",
        "outcome_en": "Forced divestment (NSIA)",
        "mechanism": "英国 NSIA（国家安全与投资法）",
        "mechanism_en": "UK NSIA",
        "eu_notified": False,
        "summary_zh": "英 NSIA 要求 Nexperia 出售至少 86% Newport 股权，防范化合物半导体能力与南威尔士产业集群技术外泄；后出售给 Vishay。",
        "summary_en": "UK ordered Nexperia to divest majority stake in Newport Wafer Fab on national security grounds.",
        "sources": [
            {
                "url": "https://www.gov.uk/government/publications/acquisition-of-newport-wafer-fab-by-nexperia-bv-notice-of-final-order",
                "title": "GOV.UK final order",
            },
        ],
        "timeline": [
            {"date": "2021-07", "event": "Nexperia 完成收购"},
            {"date": "2022-11-16", "event": "NSIA 最终令要求剥离"},
        ],
        "tags": ["半导体", "强制剥离", "NSIA"],
        "status": "closed",
    },
    {
        "id": "UK-2024-FTDI",
        "country": "GB",
        "country_name": "英国",
        "country_name_en": "United Kingdom",
        "region": "Europe",
        "target_company": "Future Technology Devices International Ltd（FTDI）",
        "target_sector": "半导体（USB 接口芯片）",
        "target_sector_en": "Semiconductors",
        "investor": "FTDI Holding Ltd（北京建广等中资基金）",
        "investor_origin": "CN",
        "deal_type": "收购 80.2% 股权",
        "deal_value_eur": None,
        "notification_date": "2024",
        "decision_date": "2024-11",
        "outcome": "政府干预",
        "outcome_en": "Forced divestment (NSIA)",
        "mechanism": "英国 NSIA",
        "mechanism_en": "UK NSIA",
        "eu_notified": False,
        "summary_zh": "NSIA 最终令要求中资财团出售 FTDI 80.2% 股权，理由为半导体 IP 与关键基础设施风险。",
        "summary_en": "UK NSIA final order required Chinese consortium to divest 80.2% of FTDI.",
        "sources": [
            {
                "url": "https://www.gov.uk/government/publications/acquisition-of-802-of-shares-in-future-technology-devices-international-limited-by-ftdi-holding-limited-notice-of-final-order",
                "title": "GOV.UK FTDI order",
            },
        ],
        "timeline": [{"date": "2024-11", "event": "NSIA 发布最终剥离令"}],
        "tags": ["半导体", "USB芯片", "强制剥离"],
        "status": "closed",
    },
    {
        "id": "UK-2022-HILIGHT",
        "country": "GB",
        "country_name": "英国",
        "country_name_en": "United Kingdom",
        "region": "Europe",
        "target_company": "HiLight Research Ltd",
        "target_sector": "光电子 / 半导体",
        "target_sector_en": "Optoelectronics",
        "investor": "SiLight (Shanghai) Semiconductors Ltd",
        "investor_origin": "CN",
        "deal_type": "100% 收购",
        "deal_value_eur": None,
        "notification_date": "2022",
        "decision_date": "2022-12",
        "outcome": "禁止",
        "outcome_en": "Prohibited (NSIA)",
        "mechanism": "英国 NSIA",
        "mechanism_en": "UK NSIA",
        "eu_notified": False,
        "summary_zh": "NSIA 禁止上海 SiLight 全资收购 HiLight，防止光学/半导体技术用于英国安全敏感能力。",
        "summary_en": "UK blocked SiLight's 100% acquisition of HiLight on national security grounds.",
        "sources": [
            {
                "url": "https://www.gov.uk/government/publications/acquisition-of-hilight-research-limited-by-silight-shanghai-semiconductors-limited-notice-of-final-order",
                "title": "GOV.UK HiLight order",
            },
        ],
        "timeline": [{"date": "2022-12", "event": "NSIA 发布禁止令"}],
        "tags": ["光电子", "半导体", "禁止"],
        "status": "closed",
    },
    {
        "id": "UK-2022-GARDNER",
        "country": "GB",
        "country_name": "英国",
        "country_name_en": "United Kingdom",
        "region": "Europe",
        "target_company": "Gardner Aerospace（经 Ligeance Aerospace Technology）",
        "target_sector": "航空航天",
        "target_sector_en": "Aerospace",
        "investor": "Sichuan Development Holding Co. Ltd（四川发展）",
        "investor_origin": "CN",
        "deal_type": "增持",
        "deal_value_eur": None,
        "notification_date": "2022",
        "decision_date": "2022-10",
        "outcome": "附条件批准",
        "outcome_en": "Conditionally cleared (NSIA)",
        "mechanism": "英国 NSIA",
        "mechanism_en": "UK NSIA",
        "eu_notified": False,
        "summary_zh": "NSIA 允许四川发展增持 Ligeance，但对 Gardner 英国业务施加信息隔离、政府观察员入董事会、资产转移须通知等条件。",
        "summary_en": "UK cleared Sichuan Development's LAT stake increase with strict conditions on Gardner UK subsidiary.",
        "sources": [
            {
                "url": "https://assets.publishing.service.gov.uk/media/634439778fa8f52a5f8713ac/acquisition_of_ligeance_aerospace_technology_co_Ltd_notice_of_final_order.pdf",
                "title": "GOV.UK Ligeance order (PDF)",
            },
        ],
        "timeline": [{"date": "2022-10", "event": "NSIA 附条件批准"}],
        "tags": ["航空航天", "附条件", "NSIA"],
        "status": "closed",
    },
]

FIXES = {
    "CZ-2021-EMPOSAT": {
        "id": "CZ-2025-EMPOSAT",
        "notification_date": "2024",
        "decision_date": "2025-03",
        "summary_zh": "2025年3月捷克政府依2021年《外国投资审查法》首次禁止北京 Emposat 在捷运营卫星地面站，BIS 指间谍活动与国家安全风险（非2021年决定）。",
        "summary_en": "In March 2025 Czechia issued its first prohibition under the 2021 FDI Act against Emposat satellite ground station.",
        "timeline": [
            {"date": "2024", "event": "投资申报与审查程序"},
            {"date": "2025-03", "event": "政府首次依外资审查法禁止"},
        ],
    },
    "FR-MECH-NO-PUBLIC": {
        "summary_zh": "法国 IEF/Golden Power 机制活跃；2025年对京东间接持股 Fnac Darty 路径作出附条件批准（见 FR-2025-JDCOM-FNAC）。其他公开渠道少见明确禁止纯中资并购案。",
    },
    "BE-MECH-NO-PUBLIC": {
        "summary_zh": "2023年7月起 FDI 机制运行；公开最大宗涉华批准案例之一为瑞声科技收购 PSS（见 BE-2023-AAC-PSS）。BTI 年报显示涉华申报有附条件个案但多不公开名称。",
    },
}


def main() -> None:
    with open(CASES_FILE, encoding="utf-8") as f:
        db = json.load(f)

    by_id = {c["id"]: i for i, c in enumerate(db["cases"])}
    added = 0
    for case in NEW_CASES:
        if case["id"] in by_id:
            continue
        db["cases"].append(case)
        added += 1

    for case in db["cases"]:
        cid = case["id"]
        if cid in FIXES:
            case.update(FIXES[cid])
            if FIXES[cid].get("id"):
                by_id[case["id"]] = by_id.pop(cid, len(db["cases"]))

    concrete = [
        c for c in db["cases"]
        if c.get("deal_type") not in ("机制说明", "统计")
        and c.get("outcome") not in ("无公开否决", "机制运行")
    ]
    countries = sorted({c["country"] for c in db["cases"] if c["country"] != "EU"})

    db["meta"]["last_updated"] = datetime.now().astimezone().isoformat(timespec="seconds")
    db["meta"]["version"] = "2.1.0"
    db["meta"]["eu27_coverage"]["total_cases"] = len(db["cases"])
    db["meta"]["eu27_coverage"]["countries_with_entries"] = [
        c for c in countries if c in db["meta"]["eu27_coverage"]["member_states"] or c == "GB"
    ]
    db["meta"]["completeness_note"] = (
        "本库收录有公开来源的欧盟成员国及英国涉华 FDI/国家安全审查个案与机制说明，"
        "无法涵盖欧盟合作机制下未披露的全部历史案件；无公开否决的成员国以机制条目标注。"
    )

    with open(CASES_FILE, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)

    print(f"Added {added} new cases. Total cases: {len(db['cases'])}")
    print(f"Concrete deals: {len(concrete)}")

    try:
        import tag_review_points

        tag_review_points.main()
    except Exception as e:
        print(f"[WARN] review_points tagging skipped: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
