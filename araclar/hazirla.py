"""ham/tuik → veri/isimler.json"""
import json, glob
from pathlib import Path

KOK = Path(__file__).resolve().parent.parent
HAM = KOK / "ham" / "tuik"
Y0, Y1 = 1930, 2025

n = {}
enb = 0
for f in sorted(HAM.glob("sira-*.json")):
    ad, c = f.stem[5:].rsplit("-", 1)
    d = json.loads(f.read_text(encoding="utf-8"))
    s = [0] * (Y1 - Y0 + 1)
    for x in d.get("yilSiraList") or []:
        if Y0 <= x["dogumYil"] <= Y1 and x["sira"]:
            s[x["dogumYil"] - Y0] = x["sira"]
            enb = max(enb, x["sira"])
    if any(s):
        n[f"{ad}|{c}"] = s

def liste(dosya):
    return [[r["Isim"], r["Sayi"]] for r in sorted(json.loads((HAM / dosya).read_text(encoding="utf-8"))["data"], key=lambda r: r["Sira"])]

cikti = {
    "y0": Y0, "y1": Y1, "enb": enb, "n": n,
    "yeni": {"1": liste("yeni-TR-1-2025.json"), "2": liste("yeni-TR-2-2025.json")},
    "toplam": {"1": liste("toplam-TR-1-2025.json"), "2": liste("toplam-TR-2-2025.json")},
    "dalga": [a for a in ["FATMA", "MERVE", "ZEYNEP", "DEFNE", "ALYA"] if f"{a}|2" in n],
}
(KOK / "veri").mkdir(exist_ok=True)
(KOK / "veri/isimler.json").write_text(json.dumps(cikti, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(len(n), "isim, en büyük sıra", enb)
# hikâye kontrolü: her yılın birincisi (kız)
bir = {}
for k, s in n.items():
    if k.endswith("|2"):
        for i, r in enumerate(s):
            if r == 1:
                bir[Y0 + i] = k
print({y: bir.get(y) for y in range(1930, 2026, 3)})
