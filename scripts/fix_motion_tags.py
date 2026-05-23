#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
p = Path(__file__).resolve().parent.parent / "web" / "index.html"
t = p.read_text(encoding="utf-8")
t = t.replace("<motion ", "<M ").replace("</motion>", "</M>")
t = t.replace("<M ", "<div ").replace("</M>", "</div>")
t = t.replace('id="trend-caption"></div>', 'id="trend-caption"></div>')
# fix duplicate if any
while "<M " in t:
    t = t.replace("<M ", "<motion ")
while "</M>" in t:
    t = t.replace("</M>", "</motion>")
t = t.replace("<motion ", "<div ").replace("</motion>", "</motion>")
t = t.replace("</motion>", "</motion>")
t = t.replace("<motion ", "<div ")
t = t.replace("</motion>", "</div>")
p.write_text(t, encoding="utf-8")
print("fixed", "motion" in t)
