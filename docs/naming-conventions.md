# PASSIO NAMING CONVENTIONS

---

## 🎯 Amaç

Passio Naming Conventions, değişkenler, fonksiyonlar, dosyalar, veritabanı alanları ve bileşenler için tutarlı isimlendirme standartları sunar.

---

## 📐 Kapsam

Tüm TypeScript, TSX, SQL/Drizzle ve CSS/Tailwind tanımlamalarını kapsar.

---

## 📜 Kurallar

1. **React Bileşenleri & Dosyaları:** `PascalCase` (ör. `PdfReaderEngine.tsx`, `KnowledgeBridgeService.ts`).
2. **Değişkenler & Fonksiyonlar:** `camelCase` (ör. `activePageNumber`, `searchKnowledgeItems`).
3. **Sabitler (Constants):** `UPPER_SNAKE_CASE` (ör. `DEFAULT_ZOOM_LEVEL`, `MAX_RECENT_ITEMS`).
4. **Veritabanı Tablo & Sütun İsimleri:** `snake_case` (ör. `reading_notes`, `highlight_color`).
5. **Arayüzler (Interfaces):** `PascalCase` baş harfi ile `I` ön eki kullanılmadan tanımlanır (ör. `HighlightItem`).

---

## 💡 Örnekler

```typescript
// Doğru isimlendirme örnekleri
const DEFAULT_PAGE_SCALE = 1.0;

interface HighlightItem {
  id: string;
  pageNumber: number;
}

export class HighlightRepository {
  async getByMaterialId(materialId: string): Promise<HighlightItem[]> {
    // ...
  }
}
```

---

## ✅ Yapılacaklar

- İsimlerde amacını açıkça ifade eden anlamlı kelimeler tercih etmek.
- Bütün boolean değişken isimlerinde `is`, `has`, `should` ön ekleri kullanmak (`isLoading`, `hasHighlights`).

---

## ❌ Yapılmayacaklar

- Tek harfli belirsiz değişken isimleri (`a`, `x`, `temp`) kullanmak (döngü indeksleri hariç).
- Türkçe-İngilizce karışık hibrit isimler yazmak.

---

## 🌟 Best Practices

- Kod okuma hızını artırmak için domain terminolojisine tam sadık kalmak (`Material`, `Highlight`, `Note`, `KnowledgeBridge`).
