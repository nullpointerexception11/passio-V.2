# PASSIO RELEASE PROCESS

---

## 🎯 Amaç

Passio Release Process, yeni sürümlerin güvenli, test edilmiş ve sorunsuz bir şekilde yayınlanması için izlenecek adımları tanımlar.

---

## 📐 Kapsam

Sürüm numaralandırma (Semantic Versioning), derleme çıktıları ve sürüm kontrol listesini kapsar.

---

## 📜 Kurallar

1. **Semantic Versioning (MAJOR.MINOR.PATCH):**
   - `MAJOR`: Kırıcı mimari değişiklikler veya devrimsel yenilikler.
   - `MINOR`: Yeni özellik eklemeleri ve büyük modül geliştirmeleri.
   - `PATCH`: Hata düzeltmeleri ve performans iyileştirmeleri.
2. **Release Checklist:**
   - [ ] Type Check (`tsc --noEmit`) sorunsuz.
   - [ ] Linter (`npm run lint`) hatasız.
   - [ ] Uygulama derlemesi (`npm run build`) başarılı.
   - [ ] Çevrimdışı veri bütünlüğü doğrulanmış.

---

## 💡 Örnekler

- Sürüm Adı: `v1.1.0 - Knowledge Bridge Release`

---

## ✅ Yapılacaklar

- Her yayınlama öncesi `CHANGELOG.md` dosyasını güncellemek.
- Üretim paket boyutlarını kontrol etmek.

---

## ❌ Yapılmayacaklar

- Test edilmemiş deneysel özellikleri canlı sürüme dahil etmek.
- Sürüm notlarını eksik bırakmak.

---

## 🌟 Best Practices

- Otomatik derleme betikleri (`scripts/`) kullanarak insan hatasını sıfıra indirmek.
