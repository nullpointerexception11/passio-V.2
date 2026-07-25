# 07 - Reviews & Quality Assurance

> **PASSIO Kod Gözden Geçirme, Kalite Güvence ve Mimari Denetim Alanı**

---

## 🎯 Klasörün Amacı

Bu klasör; kod gözden geçirme (Code Review) kontrol listelerini, mimari denetim (Architectural Audit) raporlarını, refactoring öncesi/sonrası incelemelerini ve sprint sonu kalite değerlendirme belgelerini barındırır.

---

## 📚 Burada Bulunacak Belgeler

- **Code Review Checklist (`code-review-checklist.md`):** Pull Request onaylanmadan önce kontrol edilecek kriterler.
- **Mimari Audit Raporları (`architecture-audit-2026-Q3.md`):** Katman ihlalleri, dairesel bağımlılıklar ve kod kokularının (code smells) tespiti.
- **Refactor İnceleme Raporları (`refactor-reviews.md`):** Modül dönüşümlerinin teknik değerlendirmeleri.

---

## 🚀 Nasıl Kullanılacak?

1. **Pull Request Süreçleri:** Reviewer'lar buradaki kontrol listelerini baz alarak kod değişikliklerini inceler.
2. **Sprint Sonu Değerlendirmeleri:** Her sprint sonunda yapılan teknik borç ve kalite denetimlerinin çıktıları bu klasöre kaydedilir.
3. **Sürekli İyileştirme:** Projedeki kalite trendi ve geliştirilmesi gereken alanlar bu belgeler üzerinden takip edilir.

---

## ✍️ Belge Yazım Kuralları

- **Objektiflik:** İnceleme raporları somut metrikler (lint sonuçları, typecheck, build süreleri, bundle boyutu vb.) ve kod örnekleri içermelidir.
- **Format:** Standart Markdown (`.md`).
- **Dosya Adlandırma:** Kebab-case ve tarih bazlı adlandırma (Örn: `2026-07-architecture-review.md`).
