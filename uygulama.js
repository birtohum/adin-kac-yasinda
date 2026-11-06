"use strict";
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));
const sayi = (x) => x.toLocaleString("tr-TR");
const guzel = (s) => s.toLocaleLowerCase("tr").split(" ").map((w) => w.charAt(0).toLocaleUpperCase("tr") + w.slice(1)).join(" ");
const buyuk = (s) => s.trim().replace(/\s+/g, " ").toLocaleUpperCase("tr");
const BUGUN = 2026;

let V, cins = "2";

function seri(anahtar) {
  const s = V.n[anahtar];
  if (!s) return null;
  return s.map((r, i) => ({ yil: V.y0 + i, sira: r })).filter((x) => x.sira > 0);
}

function grafik(el, seriler, secenek = {}) {
  const G = 900, Y = secenek.yukseklik || 330, sol = 40, sag = 70, ust = 16, alt = 26;
  const enbSira = secenek.enbSira || 1000;
  const X = (y) => sol + ((y - V.y0) / (V.y1 - V.y0)) * (G - sol - sag);
  const Yp = (r) => ust + (Math.log10(r) / Math.log10(enbSira)) * (Y - ust - alt);
  let s = `<svg viewBox="0 0 ${G} ${Y}" role="img" aria-label="${secenek.etiket || "İsim sırası"}">`;
  for (const r of [1, 10, 100, 1000].filter((r) => r <= enbSira)) {
    s += `<line class="eksen" x1="${sol}" x2="${G - sag}" y1="${Yp(r)}" y2="${Yp(r)}"/><text x="${sol - 8}" y="${Yp(r) + 4}" text-anchor="end">${r}.</text>`;
  }
  for (let y = Math.ceil(V.y0 / 10) * 10; y <= V.y1; y += 10) s += `<text x="${X(y)}" y="${Y - 6}" text-anchor="middle">${y}</text>`;
  const yerler = [];
  seriler.forEach(({ ad, noktalar, renk }) => {
    // boşluklarda çizgiyi kes
    let d = "", onceki = null;
    for (const p of noktalar) {
      if (p.sira > enbSira) { onceki = null; continue; }
      d += `${onceki && p.yil - onceki === 1 ? "L" : "M"}${X(p.yil).toFixed(1)},${Yp(p.sira).toFixed(1)}`;
      onceki = p.yil;
    }
    s += `<path class="cizgi" d="${d}" stroke="${renk}"/>`;
    const tepe = noktalar.reduce((a, b) => (b.sira < a.sira ? b : a));
    if (secenek.adEtiketi) {
      let lx = X(tepe.yil), ly = Yp(tepe.sira) - 8;
      while (yerler.some(([x, y]) => Math.abs(x - lx) < 52 && Math.abs(y - ly) < 14)) ly += 16;
      yerler.push([lx, ly]);
      const anc = lx > G - sag - 30 ? "end" : "middle";
      s += `<text class="ad" x="${lx}" y="${ly}" text-anchor="${anc}" style="fill:${renk}">${ad}</text>`;
    } else {
      s += `<circle cx="${X(tepe.yil)}" cy="${Yp(tepe.sira)}" r="5" fill="${renk}"/><text class="tepe" x="${X(tepe.yil) + 8}" y="${Yp(tepe.sira) - 8}">${tepe.yil}: ${tepe.sira}.</text>`;
      const son = noktalar[noktalar.length - 1];
      s += `<text class="tepe" x="${X(son.yil) + 8}" y="${Yp(son.sira) + 4}">${son.sira}.</text>`;
    }
  });
  el.innerHTML = s + "</svg>";
}

function goster(adYaz, c) {
  const A = buyuk(adYaz);
  let anahtar = `${A}|${c}`;
  const diger = `${A}|${c === "1" ? "2" : "1"}`;
  if (!V.n[anahtar] && V.n[diger]) { anahtar = diger; c = c === "1" ? "2" : "1"; cinsSec(c); }
  const s = seri(anahtar);
  const kutu = $("sonuc");
  if (!s || !s.length) {
    kutu.innerHTML = `<p class="yok"><b>${esc(guzel(A))}</b> bu sayfadaki ${sayi(Object.keys(V.n).length)} isim arasında yok. TÜİK'in portalı tarayıcıdan sorgulanamadığı için sayfa yalnız en yaygın isimleri içeriyor; tam sorgu için <a href="https://tuikcocuk.tuik.gov.tr/">TÜİK Çocuk</a> sitesine bakabilirsin.</p>`;
    return;
  }
  const tepe = s.reduce((a, b) => (b.sira < a.sira ? b : a));
  const ilk = s[0], son = s[s.length - 1];
  const yas = BUGUN - tepe.yil;
  let c1 = `<b>${guzel(A)}</b> en üst sıraya <b>${tepe.yil}</b> doğumlular arasında çıktı (${tepe.sira}.). O yıl doğanlar bugün <b>${yas} yaşında</b>.`;
  const yeni = s.filter((x) => x.yil >= V.y1 - 4);
  const eski = s.filter((x) => x.yil <= 1975);
  if (son.yil >= V.y1 - 1 && son.sira <= tepe.sira * 1.5) c1 += ` Hâlâ zirvesine yakın: ${son.yil}'te ${son.sira}.`;
  else if (son.yil >= V.y1 - 1) c1 += ` ${son.yil} doğumlular arasında ${son.sira}. sırada.`;
  else c1 += ` ${son.yil}'ten sonraki yıllarda ilk ${sayi(V.enb)} arasında görünmüyor.`;
  if (!eski.length && ilk.yil > 1975) c1 += ` ${ilk.yil}'den önceki yıllarda listede yok; yeni bir isim.`;
  kutu.innerHTML = `<p class="cumle">${c1}</p><div class="grafik" id="tekGrafik"></div>`;
  grafik($("tekGrafik"), [{ ad: guzel(A), noktalar: s, renk: "var(--vurgu)" }], { etiket: `${guzel(A)} isminin doğum yılına göre sırası`, yukseklik: 280 });
  history.replaceState(null, "", `?ad=${encodeURIComponent(guzel(A))}&c=${c}`);
}

function cinsSec(c) {
  cins = c;
  [...$("cins").children].forEach((b) => { b.classList.toggle("secili", b.dataset.c === c); b.setAttribute("aria-checked", b.dataset.c === c); });
}

function liste(el, satirlar, c) {
  const enb = satirlar[0][1];
  el.innerHTML = satirlar.slice(0, 10).map(([a, n]) => `<li><button data-ad="${guzel(a)}" data-c="${c}">${guzel(a)}</button><span class="cubuk" style="width:${(100 * n) / enb}%"></span><span class="deger">${sayi(n)}</span></li>`).join("");
}

async function baslat() {
  V = await (await fetch("veri/isimler.json")).json();
  $("isimSay").textContent = sayi(Object.keys(V.n).length);
  const renkler = ["var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)", "var(--c5)"];
  grafik($("dalga"), V.dalga.map((a, i) => ({ ad: guzel(a), noktalar: seri(`${a}|2`), renk: renkler[i] })).filter((x) => x.noktalar), { adEtiketi: true, enbSira: 300, etiket: "Kız isimlerinin doğum yılına göre sırası" });
  $("adlar").innerHTML = [...new Set(Object.keys(V.n).map((k) => guzel(k.split("|")[0])))].sort((a, b) => a.localeCompare(b, "tr")).map((a) => `<option value="${a}">`).join("");
  liste($("yeniKiz"), V.yeni["2"], "2");
  liste($("yeniErkek"), V.yeni["1"], "1");
  $("cins").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { cinsSec(b.dataset.c); if ($("ad").value) goster($("ad").value, cins); } });
  $("form").addEventListener("submit", (e) => { e.preventDefault(); goster($("ad").value, cins); });
  document.body.addEventListener("click", (e) => {
    const b = e.target.closest(".liste button"); if (!b) return;
    $("ad").value = b.dataset.ad; cinsSec(b.dataset.c); goster(b.dataset.ad, b.dataset.c);
    $("form").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  const p = new URLSearchParams(location.search);
  if (p.get("ad")) { $("ad").value = p.get("ad"); cinsSec(p.get("c") === "1" ? "1" : "2"); goster(p.get("ad"), cins); }
}
baslat();
