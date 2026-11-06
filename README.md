# Adın kaç yaşında?

**Canlı:** https://birtohum.github.io/adin-kac-yasinda/

Bir isim yaz. Sayfa, o ismin 1930'dan 2025'e kadar her doğum yılında kaçıncı sırada olduğunu çizer. En popüler olduğu yılı ve o yıl doğanların bugünkü yaşını da gösterir. İlk ekranda Fatma, Merve, Zeynep, Defne ve Alya'nın sıralarındaki değişim var.

## Veri

- **Doğum yılına göre sıra:** TÜİK Çocuk sitesindeki isim grafiğinin veri ucundan (`tuikcocuk.tuik.gov.tr/api/nip/cocuk-isim-siralama`) alındı. Bu uç tarayıcıdan doğrudan çağrılamıyor (CORS izni yok). Bu yüzden 1.209 isim/cinsiyet çifti `araclar/topla.py` ile bir kez, istekler arasında bekleyerek çekildi.
  - 1.205 isimde veri geldi.
  - Seyrek 4 isimde TÜİK veri yerine hata döndürdü.
- **Hangi isimler var:** 2018–2025'te Türkiye'de en çok konulan ilk 30 isim, 2025'te her ilde en çok konulan ilk 30 isim ve bugün en çok kullanılan 30 isim (TÜİK Nüfus İstatistikleri Portalı).

## Sonuçlar

- **Kızlar:** Fatma 1991'e kadar doğan her kuşakta birinci. 1992'de Merve, 2000'de Zeynep öne geçiyor. 2023'te Asel, 2024'te Defne, 2025'te Alya birinci.
- **Erkekler:** Mehmet 2002'ye kadar birinci. 2003'te Yusuf öne geçiyor, 2022'den bu yana Alparslan birinci.

## Sınırlar

- **Yalnız sıra:** TÜİK yeni doğan listeleri dışında kişi sayısını vermiyor.
- **Bugünkü kayıtlar:** Sıra, o yıl doğmuş ve bugün kayıtlı yaşayan kişiler arasındadır.
- **Eksik isimler:** Listede olmayan isimler sayfada "yok" diye belirtilir.

Kod Apache-2.0 lisanslı.
