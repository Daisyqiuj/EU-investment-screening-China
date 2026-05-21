#!/usr/bin/env python3
"""从 Natural Earth 提取欧洲各国 GeoJSON 边界。"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "web" / "data"
SRC = DATA / "world-countries-temp.geojson"
OUT = DATA / "europe.geojson"

EUROPE_SUBREGIONS = {
    "Northern Europe",
    "Southern Europe",
    "Western Europe",
    "Eastern Europe",
}


def norm_iso(props: dict) -> str | None:
    for key in ("ISO_A2_EH", "ISO_A2", "WB_A2", "POSTAL"):
        v = props.get(key)
        if v and str(v) not in ("-99", "-1", "NA", ""):
            return str(v).upper()
    a3 = props.get("ADM0_A3") or props.get("ISO_A3")
    if a3 == "GBR":
        return "GB"
    return None


def main() -> None:
    src = json.loads(SRC.read_text(encoding="utf-8"))
    features = []
    for f in src["features"]:
        p = f["properties"]
        if (
            p.get("CONTINENT") != "Europe"
            and p.get("REGION_UN") != "Europe"
            and p.get("SUBREGION") not in EUROPE_SUBREGIONS
        ):
            continue
        iso = norm_iso(p)
        if not iso:
            continue
        features.append(
            {
                "type": "Feature",
                "id": iso,
                "properties": {
                    "iso_a2": iso,
                    "name": p.get("NAME") or p.get("NAME_EN"),
                    "name_zh": p.get("NAME_ZH") or p.get("NAME"),
                    "name_en": p.get("NAME_EN") or p.get("NAME"),
                },
                "geometry": f["geometry"],
            }
        )
    out = {"type": "FeatureCollection", "features": features}
    OUT.write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")
    print(f"Exported {len(features)} features -> {OUT}")


if __name__ == "__main__":
    main()
