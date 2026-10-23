#!/usr/bin/env python3
"""Build data.json for Cyto Guide from data/*.json (one file per reporting system) plus the
catalogue below (systems not yet written show as 'Coming soon'). Bumps the sw.js cache version.
Usage: python3 build_data.py"""
import json, glob, os, hashlib, re, datetime
HERE = os.path.dirname(os.path.abspath(__file__))
GROUPS = ["Gynae / anal","Thyroid","Salivary","Urine","Serous fluid","Breast","Lymph node","Lung / respiratory",
 "Pancreaticobiliary","Soft tissue","Liver","Kidney","CSF","Scrape / imprint / Tzanck","Nipple discharge",
 "Squash / intraoperative","ROSE","GI brushings"]
CATALOGUE = [  # (id, short, full name, edition/year, group, legacy)
 ("bethesda-anal","Bethesda Anal","Bethesda terminology for anal cytology","TBS 2014 (anal chapter)","Gynae / anal",False),
 ("milan","Salivary (Milan)","The Milan System for Reporting Salivary Gland Cytopathology","2nd ed, 2023","Salivary",False),
 ("paris","Urine (Paris)","The Paris System for Reporting Urinary Cytology","2.0, 2022","Urine",False),
 ("who-breast","WHO Breast cytopathology","WHO Reporting System for Breast Cytopathology","IARC/IAC series (verify edition)","Breast",False),
 ("who-lnst","WHO Lymph node, spleen & thymus","WHO Reporting System for Lymph Node, Spleen and Thymus Cytopathology","IARC/IAC series (verify edition)","Lymph node",False),
 ("who-lung","WHO Lung cytopathology","WHO Reporting System for Lung Cytopathology","1st ed (IARC/IAC), 2022","Lung / respiratory",False),
 ("psc-resp","PSC respiratory (legacy)","Papanicolaou Society of Cytopathology guidelines for respiratory cytology","2016","Lung / respiratory",True),
 ("resp-descriptive","BAL / sputum / washings","Descriptive reporting of respiratory specimens","—","Lung / respiratory",False),
 ("who-pb","WHO Pancreaticobiliary","WHO Reporting System for Pancreaticobiliary Cytopathology","1st ed (IARC/IAC), 2022","Pancreaticobiliary",False),
 ("psc-pb","PSC pancreaticobiliary (legacy)","Papanicolaou Society of Cytopathology System for Pancreaticobiliary Cytology","2014/2015","Pancreaticobiliary",True),
 ("who-st","WHO Soft tissue","WHO Reporting System for Soft Tissue Cytopathology","1st ed (IARC/IAC), 2023","Soft tissue",False),
 ("who-liver","WHO Liver","WHO Reporting System for Liver Cytopathology","IARC/IAC series","Liver",False),
 ("who-kidney","Kidney (coming soon)","Kidney FNA – no WHO/IAC-IARC kidney cytopathology system published yet","Not published (checked Oct 2026)","Kidney",False),
 ("csf","CSF cytology","CSF tiered reporting (no official international system)","Proposed schemes","CSF",False),
 ("scrape","Scrape / imprint / Tzanck","Scrape, imprint and Tzanck smear reporting","Descriptive","Scrape / imprint / Tzanck",False),
 ("nipple","Nipple discharge","Nipple discharge cytology","Descriptive","Nipple discharge",False),
 ("squash","Squash (intraoperative)","Intraoperative squash/touch cytology (CNS and others)","Descriptive","Squash / intraoperative",False),
 ("rose","ROSE","Rapid on-site evaluation – adequacy and triage","—","ROSE",False),
 ("gi-brush","GI brushings","Gastrointestinal (oesophageal/gastric/biliary) brushing cytology","Descriptive","GI brushings",False)]
def main():
    systems = []
    for p in sorted(glob.glob(os.path.join(HERE, "data", "*.json"))):
        systems.append(json.load(open(p)))
    have = {s["id"] for s in systems}
    for i, sh, nm, ed, g, leg in CATALOGUE:
        if i not in have:
            systems.append({"id": i, "short": sh, "name": nm, "edition": ed, "group": g, "status": "soon", "legacy": leg})
    order = {g: k for k, g in enumerate(GROUPS)}
    systems.sort(key=lambda s: (order.get(s["group"], 99), s.get("legacy", False), s["status"] != "ready"))
    out = {"built": datetime.date.today().isoformat(), "groups": GROUPS, "systems": systems}
    txt = json.dumps(out, ensure_ascii=False, separators=(",", ":"))
    open(os.path.join(HERE, "data.json"), "w").write(txt)
    ver = hashlib.sha1(txt.encode() + open(os.path.join(HERE, "app.js"), "rb").read() + open(os.path.join(HERE, "style.css"), "rb").read()).hexdigest()[:10]
    sw = os.path.join(HERE, "sw.js"); s = open(sw).read()
    open(sw, "w").write(re.sub(r'const VERSION = "[^"]*";', f'const VERSION = "{ver}";', s))
    r = [s for s in systems if s["status"] == "ready"]
    print(f"{len(r)} ready systems, {sum(len(s['categories']) for s in r)} categories, "
          f"{sum(len(c['diagnoses']) for s in r for c in s['categories'])} diagnoses; version {ver}")
if __name__ == "__main__": main()
