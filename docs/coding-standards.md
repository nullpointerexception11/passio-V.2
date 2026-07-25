# PASSIO CODING STANDARDS

---

## 🎯 Amaç

Passio Coding Standards, kod tabanının tutarlı, okunabilir, sürdürülebilir ve yüksek kalitede kalmasını sağlayan yazım standartlarını belirler.

---

## 📐 Kapsam

TypeScript, React, JSX/TSX ve CSS/Tailwind yazım kurallarının tamamını kapsar.

---

## 📜 Kurallar

1. **Tip Tanımları:** Tüm veri yapıları açık `interface` veya `type` tanımlarına sahip olmalıdır.
2. **Değişken İsimlendirme:** `camelCase` kullanılır. Class ve React component isimleri `PascalCase` olmalıdır.
3. **Magic Values:** Sihirli sayılar ve metinler sabit dosyalarına (`constants.ts`) taşınmalıdır.
4. **Erken Dönüş (Early Return):** Derin iç içe geçmiş (nested) `if` blokları yerine erken dönüş kalıbı kullanılmalıdır.

---

## 💡 Örnekler

```typescript
// Doğru: Erken dönüş ve açık tipler
function calculateProgress(currentPage: number, totalPages: number): number {
  if (totalPages <= 0) return 0;
  return Math.min(100, Math.round((currentPage / totalPages) * 100));
}
```

---

## ✅ Yapılacaklar

- Fonksiyonların tek bir iş yapmasını (Single Responsibility) sağlamak.
- Değişken isimlerinde açıklayıcı ve anlamlı kelimeler tercih etmek (`isReadingActive` vb.).
- React component props tiplerini açıkça belirtmek.

---

## ❌ Yapılmayacaklar

- `any` veya `unknown` tiplerini tip zorlaması yapmadan geçici çözüm olarak kullanmak.
- Tek bir dosyaya yüzlerce satırlık spagetti kod yazmak.
- Yorum satırlarına ihtiyaç duyacak kadar karmaşık anlaşılmaz kod yazmak.

---

## 🌟 Best Practices

- ESLint ve Prettier kurallarına tam uyum sağlamak.
- Saf fonksiyonlar (Pure Functions) yazmaya özen göstermek.
