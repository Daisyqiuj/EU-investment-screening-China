#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""为 cases.json 各案例标注 review_points（审查点）。"""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CASES_FILE = ROOT / "data" / "cases.json"

# 案例 ID -> 审查点 ID 列表（可多选）
CASE_REVIEW_POINTS: dict[str, list[str]] = {
    "DE-2016-KUKA": ["rp_robotics_automation"],
    "DE-2018-LEIFELD": ["rp_aerospace_metal_forming", "rp_dual_use_military"],
    "DE-2018-50HERTZ": ["rp_power_grid"],
    "ES-2016-ARITEX": ["rp_automotive_oem_supply"],
    "IT-2018-ESAOTE": ["rp_medical_imaging"],
    "IT-2020-FASTWEB-HUAWEI": ["rp_telecom_5g_core"],
    "DE-2020-IMST": ["rp_radar_satcom_5g", "rp_dual_use_military"],
    "IT-2021-LPE": ["rp_semiconductor_equipment"],
    "IT-2021-VERISEM": ["rp_agri_seeds"],
    "LT-2021-RAILBRIDGE": ["rp_rail_crossborder_infra"],
    "RO-2020-CGN": ["rp_nuclear_power"],
    "RO-2021-INFRA-MEMO": ["rp_public_procurement_exclusion"],
    "UK-2022-MANCHESTER": ["rp_university_ip"],
    "UK-2022-PULSIC": ["rp_eda_chip_design"],
    "IT-2022-ROBOX": ["rp_robotics_automation", "rp_ip_licensing_joint"],
    "DE-2022-COSCO": ["rp_port_terminal"],
    "DE-2022-HEYER": ["rp_medical_critical_care", "rp_distressed_mna"],
    "IT-2023-PIRELLI": ["rp_tire_connected_data", "rp_governance_shareholder"],
    "DE-2022-ELMOS": ["rp_semiconductor_fab"],
    "DE-2022-SEMICON2": ["rp_semiconductor_fab"],
    "DE-2022-ERS": ["rp_semiconductor_equipment"],
    "UK-2022-SEMICON3": ["rp_semiconductor_fab", "rp_dual_use_military"],
    "UK-2022-NWF": ["rp_compound_semiconductor", "rp_forced_divestment"],
    "UK-2022-HILIGHT": ["rp_optoelectronics"],
    "UK-2022-GARDNER": ["rp_aerospace_metal_forming", "rp_governance_shareholder"],
    "NL-2022-NOWI": ["rp_rf_semiconductor"],
    "IT-2024-MANTA": ["rp_civil_aircraft_evtol", "rp_ip_licensing_joint"],
    "SE-2024-PUTAILAI": ["rp_battery_greenfield", "rp_greenfield_fdi"],
    "CZ-2025-EMPOSAT": ["rp_satellite_ground_station", "rp_greenfield_fdi"],
    "NL-2025-NEXPERIA": ["rp_semiconductor_fab", "rp_supply_chain_special_act", "rp_forced_divestment"],
    "AT-2025-JDCOM": ["rp_consumer_retail_chain", "rp_retail_consumer_data"],
    "PT-2018-EDP-CTG": ["rp_utility_full_takeover"],
    "DE-2023-KLEO": ["rp_satellite_leo_network", "rp_majority_stake_increase"],
    "DE-2024-MAN": ["rp_gas_turbine_dual_use", "rp_dual_use_military"],
    "DE-2023-VISIBLE": ["rp_b2b_digital_platform"],
    "DE-2024-CORNING-LASER": ["rp_laser_precision", "rp_semiconductor_equipment"],
    "FR-2025-JDCOM-FNAC": ["rp_indirect_retail_stake", "rp_cultural_media_retail", "rp_retail_consumer_data"],
    "BE-2023-AAC-PSS": ["rp_automotive_acoustics"],
    "UK-2024-FTDI": ["rp_usb_interface_chip", "rp_forced_divestment"],
}


def main() -> None:
    with open(CASES_FILE, encoding="utf-8") as f:
        db = json.load(f)

    tagged = 0
    for case in db["cases"]:
        cid = case["id"]
        if cid in CASE_REVIEW_POINTS:
            case["review_points"] = CASE_REVIEW_POINTS[cid]
            tagged += 1
        elif case.get("deal_type") in ("机制说明", "统计", "机制统计"):
            case.pop("review_points", None)
        elif "review_points" not in case:
            case["review_points"] = []

    with open(CASES_FILE, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)

    print(f"Tagged {tagged} cases with review_points.")


if __name__ == "__main__":
    main()
