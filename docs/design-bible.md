# PASSIO DESIGN BIBLE

---

## 🎯 Amaç

Passio Design Bible, uygulamanın görsel ve hissi (look & feel) dünyasını tanımlar. Apple seviyesinde sadelik, sessizlik ve estetik bir çalışma ortamı sunmayı amaçlar.

---

## 📐 Kapsam

Arayüz renk paletleri, tipografi hiyerarşisi, boşluk (spacing) standartları, mikro animasyonlar ve okuma/yazma ekranı UI prensiplerini kapsar.

---

## 📜 Kurallar

1. **Renk Kullanımı:** Asli renkler nötr tonlardır (Krem, Gece Siyahı, Sıcak Gri). Vurgu renkleri yalnızca işlevsel kodlamalarda kullanılır.
2. **Tipografi:** Okuma ve yazma konforu için yüksek okunabilirlikte fontlar ve matematiksel adımlı tipografi ölçeği (Line-height: 1.5 - 1.7) uygulanır.
3. **Sessiz Animasyon:** Mikro-animasyonlar maksimum 200-300ms sürmeli, dikkat dağıtmamalıdır.
4. **Boşluk Düzeneği:** Ekranlarda nefes alan geniş boşluklar (negative space) bırakılmalıdır.

---

## 💡 Örnekler

- Okuma Modu: Açık Krem arka plan (`#FAF8F5`) üzerinde `#1C1917` koyu füme metin rengi.
- Vurgu Rengi: Yumuşak şeffaf sarı (`rgba(254, 240, 138, 0.4)`) metin altı vurgulaması.

---

## ✅ Yapılacaklar

- Tipografide 1.25+ adım oranlı matematiksel ölçek kullanmak.
- Kenar yuvarlatmalarını tutarlı tutmak (Kartlar için 8px - 12px).
- Odak ekranlarında tüm yan panelleri gizlenebilir kılmak.

---

## ❌ Yapılmayacaklar

- Parlak doygun renkler veya karmaşık degrade (gradient) efektleri kullanmak.
- İki kattan fazla iç içe geçmiş (nested) kart tasarımları yapmak.
- Yavaş ve abartılı sayfa geçiş animasyonları koymak.

---

## 🌟 Best Practices

- WCAG AA (en az 4.5:1) kontrast standartlarına tam uyum sağlamak.
- Bütün durumları (Loading, Empty, Error) aynı estetik dille ele almak.
