# PASSIO ERROR HANDLING

---

## 🎯 Amaç

Passio Error Handling, uygulamada meydana gelebilecek hataların kullanıcı deneyimini bozmadan zarif (graceful) bir şekilde yakalanmasını ve yönetilmesini sağlar.

---

## 📐 Kapsam

Arayüz çökme sınırları (Error Boundaries), servis seviyesi hata fırlatma ve veritabanı hata yönetimini kapsar.

---

## 📜 Kurallar

1. **Sessiz Yakalama:** Kullanıcıya uygulama çöktü hissi verilmez; hata mesajı sakin ve yönlendirici bir dille sunulur.
2. **Error Boundary:** Ana arayüz alanları React `ErrorBoundary` bileşenleri ile sarmalanır.
3. **Anlaşılır Exception Sınıfları:** Servis katmanında özel hata tipleri tanımlanır (`MaterialNotFoundError`, `CorruptedPdfError`).

---

## 💡 Örnekler

```typescript
export class MaterialNotFoundError extends Error {
  constructor(materialId: string) {
    super(`Materyal bulunamadı: ${materialId}`);
    this.name = 'MaterialNotFoundError';
  }
}
```

---

## ✅ Yapılacaklar

- Tüm asenkron veritabanı ve dosya okuma işlemlerini `try/catch` blokları ile korumak.
- Kullanıcıya hatadan kurtulma (Retry/Kurtar) seçeneği sunmak.

---

## ❌ Yapılmayacaklar

- Hataları `catch (e) {}` şeklinde boş bırakarak yutmak (swallowing errors).
- Kullanıcıya anlaşılmaz ham teknik hata yığınları (stack trace) göstermek.

---

## 🌟 Best Practices

- Hata loglarını merkezi logger servisine ileterek analiz edilebilir kılmak.
