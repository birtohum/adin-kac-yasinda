"""TÜİK Nüfus İstatistikleri Portalı'ndan isim listeleri + her isim için doğum yılına göre sıra.

1) nip.tuik.gov.tr: yeni doğan ilk 30 (Türkiye 2018–2025, iller 2025) ve en çok kullanılan ilk 30.
2) tuikcocuk.tuik.gov.tr/api/nip/cocuk-isim-siralama: her (isim, cinsiyet) için doğum yılı → sıra.
Ham yanıtlar ham/ altında saklanır; yeniden çalıştırınca var olan yanıtlar tekrar istenmez.
"""
import json, time, urllib.error, urllib.parse, urllib.request
from pathlib import Path

KOK = Path(__file__).resolve().parent.parent
HAM = KOK / "ham" / "tuik"
HAM.mkdir(parents=True, exist_ok=True)
UA = "adin-kac-yasinda (github.com/birtohum/adin-kac-yasinda)"
BEKLE = 1.5


def dt_param():
    p = {"draw": "1", "start": "0", "length": "300", "search[value]": "", "search[regex]": "false"}
    for i in range(6):
        for k, v in {"data": str(i), "name": "", "searchable": "true", "orderable": "true", "search][value": "", "search][regex": "false"}.items():
            p[f"columns[{i}][{k}]"] = v
    return p


def iste(url, veri=None, json_govde=None, dosya=None):
    if dosya and (HAM / dosya).exists():
        return json.loads((HAM / dosya).read_text(encoding="utf-8"))
    for deneme in range(4):
        try:
            if json_govde is not None:
                req = urllib.request.Request(url, data=json.dumps(json_govde).encode(), headers={"User-Agent": UA, "Content-Type": "application/json"})
            else:
                req = urllib.request.Request(url, data=urllib.parse.urlencode(veri).encode(), headers={"User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded"})
            with urllib.request.urlopen(req, timeout=40) as r:
                d = json.loads(r.read().decode("utf-8"))
            break
        except urllib.error.HTTPError as e:
            if e.code == 500 and deneme >= 1:  # seyrek isimde TÜİK veri yerine 500 döndürüyor
                print("  veri yok", json_govde or veri.get("ilAdi"), flush=True)
                (HAM / "yok.txt").open("a", encoding="utf-8").write(json.dumps(json_govde, ensure_ascii=False) + "\n")
                time.sleep(BEKLE)
                return None
            print("  hata", e, "yeniden", deneme, flush=True)
            time.sleep(3 if e.code == 500 else 10 * (deneme + 1))
        except Exception as e:
            print("  hata", e, "yeniden", deneme, flush=True)
            time.sleep(10 * (deneme + 1))
    else:
        print("  atlandı", url, json_govde, flush=True)
        return None
    time.sleep(BEKLE)
    if dosya:
        (HAM / dosya).write_text(json.dumps(d, ensure_ascii=False), encoding="utf-8")
    return d


IL = ["ADANA", "ADIYAMAN", "AFYONKARAHİSAR", "AĞRI", "AKSARAY", "AMASYA", "ANKARA", "ANTALYA", "ARDAHAN", "ARTVİN", "AYDIN", "BALIKESİR", "BARTIN", "BATMAN", "BAYBURT", "BİLECİK", "BİNGÖL", "BİTLİS", "BOLU", "BURDUR", "BURSA", "ÇANAKKALE", "ÇANKIRI", "ÇORUM", "DENİZLİ", "DİYARBAKIR", "DÜZCE", "EDİRNE", "ELAZIĞ", "ERZİNCAN", "ERZURUM", "ESKİŞEHİR", "GAZİANTEP", "GİRESUN", "GÜMÜŞHANE", "HAKKARİ", "HATAY", "IĞDIR", "ISPARTA", "İSTANBUL", "İZMİR", "KAHRAMANMARAŞ", "KARABÜK", "KARAMAN", "KARS", "KASTAMONU", "KAYSERİ", "KIRIKKALE", "KIRKLARELİ", "KIRŞEHİR", "KİLİS", "KOCAELİ", "KONYA", "KÜTAHYA", "MALATYA", "MANİSA", "MARDİN", "MERSİN", "MUĞLA", "MUŞ", "NEVŞEHİR", "NİĞDE", "ORDU", "OSMANİYE", "RİZE", "SAKARYA", "SAMSUN", "SİİRT", "SİNOP", "SİVAS", "ŞANLIURFA", "ŞIRNAK", "TEKİRDAĞ", "TOKAT", "TRABZON", "TUNCELİ", "UŞAK", "VAN", "YALOVA", "YOZGAT", "ZONGULDAK"]

yeni, toplam = [], []
for c in (1, 2):
    for y in range(2018, 2026):
        d = iste("https://nip.tuik.gov.tr/Home/IlYilBebekIsimForTable?", {"ilAdi": "", "cinsiyet": c, "yil": y, **dt_param()}, dosya=f"yeni-TR-{c}-{y}.json")
        yeni += d["data"]
    d = iste("https://nip.tuik.gov.tr/Home/IlYilToplamIsimForTable?", {"ilAdi": "", "cinsiyet": c, "yil": 2025, **dt_param()}, dosya=f"toplam-TR-{c}-2025.json")
    toplam += d["data"]
    for il in IL:
        d = iste("https://nip.tuik.gov.tr/Home/IlYilBebekIsimForTable?", {"ilAdi": il, "cinsiyet": c, "yil": 2025, **dt_param()}, dosya=f"yeni-{il}-{c}-2025.json")
        yeni += d["data"]
print("liste satırı", len(yeni), len(toplam))

isimler = sorted({(r["Isim"], r["Cinsiyet"]) for r in yeni + toplam})
print("benzersiz isim", len(isimler))
for i, (ad, c) in enumerate(isimler):
    iste("https://tuikcocuk.tuik.gov.tr/api/nip/cocuk-isim-siralama", json_govde={"isim": ad, "cinsiyet": c}, dosya=f"sira-{ad}-{c}.json")  # başarısızsa atlanır
    if i % 25 == 0:
        print(i, ad, c, flush=True)
print("bitti")
