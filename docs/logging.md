# PASSIO LOGGING GUIDELINES

---

## 🎯 Amaç

Passio Logging Guidelines, uygulamanın iç durumunun izlenebilmesi, hata teşhisi ve performans takibi için loglama standartlarını tanımlar.

---

## 📐 Kapsam

Geliştirme (development) ve canlı (production) ortamlarındaki loglama düzeylerini ve `PassioLogger` kullanımını kapsar.

---

## 📜 Kurallar

1. **Merkezi Loglama:** `console.log` doğrudan kullanılmaz; `/src/core/logger/PassioLogger.ts` servisi kullanılır.
2. **Log Düzeyleri:**
   - `DEBUG`: Geliştirme detayları ve ara adımlar.
   - `INFO`: Önemli sistem olayları (Materyal açıldı, Not kaydedildi).
   - `WARN`: Beklenen ama ilgilenilmesi gereken durumlar.
   - `ERROR`: İşleyişi engelleyen kritik hatalar.
3. **Gizlilik:** Loglar içerisine kullanıcının özel notları ve kişisel verileri yazdırılmaz.

---

## 💡 Örnekler

```typescript
// Doğru kullanım
PassioLogger.info('PDFEngine', 'Materyal başarıyla yüklendi', { materialId: '123', totalPages: 45 });
PassioLogger.error('KnowledgeBridge', 'Atıf eklenirken hata oluştu', error);
```

---

## ✅ Yapılacaklar

- Canlı sürümde `DEBUG` seviyesindeki logları otomatik filtrelemek.
- Log mesajlarına hangi modülden kaynaklandığını belirten etiket eklemek.

---

## ❌ Yapılmayacaklar

- Döngüler içerisinde binlerce kez çalışacak performans düşürücü loglar yazmak.
- Hassas içerikleri log çıktılarına eklemek.

---

## 🌟 Best Practices

- Log formatını yapılandırılmış JSON nesnesi şeklinde tutarak kolay filtrelenebilir kılmak.
