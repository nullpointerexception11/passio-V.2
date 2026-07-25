# PASSIO DEVELOPMENT BIBLE

---

## 🎯 Amaç

Passio Development Bible, yazılım geliştirme sürecindeki mimari prensipleri, teknoloji yığınını ve kodlama standartlarını tanımlar.

---

## 📐 Kapsam

React, TypeScript, Vite, Drizzle ORM, Tailwind CSS ve yerel veri katmanını kapsayan tüm teknik standartları içerir.

---

## 📜 Kurallar

1. **Katmanlı Mimari:** Arayüz (UI), İş Mantığı (Domain/Core) ve Veri Katmanı (Data/DB) kesin çizgilerle ayrılmıştır.
2. **Tip Güvenliği:** Strict TypeScript aktif olmalı; `any` tipi kullanımı kesinlikle yasaktır.
3. **Modülerlik:** Her modül bağımsız olarak test edilebilir ve geliştirilebilir olmalıdır.
4. **Çevrimdışı Çalışma (Offline-First):** Ağ bağlantısı olmasa dahi tüm okuma, not alma ve yazma işlevleri eksiksiz çalışmalıdır.

---

## 💡 Örnekler

```typescript
// Doğru: İş mantığı servis katmanında soyutlanmıştır
export class ReadingNoteService {
  constructor(private repo: ReadingNoteRepository) {}

  async createNote(dto: CreateNoteDTO): Promise<ReadingNote> {
    return this.repo.save(dto);
  }
}
```

---

## ✅ Yapılacaklar

- Bağımlılıkları arayüzler (interface) üzerinden enjekte etmek (Dependency Injection).
- Hata durumlarını mantıksal Result/Either tipleri veya özel Exception sınıflarıyla ele almak.
- Bütün veri modellerini TypeScript arayüzleri ile açıkça tanımlamak.

---

## ❌ Yapılmayacaklar

- UI componentleri içerisinde Doğrudan SQL / LocalStorage sorguları yazmak.
- Global mutable durum değişkenleri oluşturmak.
- Asenkron işlemleri `unhandled promise rejection` bırakacak şekilde çağırmak.

---

## 🌟 Best Practices

- `async/await` kalıplarını tutarlı bir şekilde kullanmak.
- Bellek sızıntılarını önlemek için React custom hook'larında temizleme (cleanup) fonksiyonlarını eksiksiz yazmak.
