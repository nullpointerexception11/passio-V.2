# 03 - Architecture Documentation

> **PASSIO Sistem Mimari Standartları, Katman Yönetimi ve Veri Akışı**

---

## 🎯 Klasörün Amacı

Bu klasör, PASSIO'nun yazılım mimarisini, katmanlı yapısını (Feature-Driven / Clean Architecture), veri depolama stratejilerini (Local-First / IndexedDB), modüller arası bağımlılık kurallarını ve sistem diyagramlarını barındırır.

---

## 📚 Burada Bulunacak Belgeler

- **Mimari İncil (`architecture-bible.md`):** Yüksek seviyeli sistem mimarisi ve katman sorumlulukları.
- **Klasör Yapısı & Modül Sınırları (`folder-structure.md`):** `/src` altındaki katmanlar ve erişim kuralları.
- **Veri Kalıcılığı & Offline Engine (`data-persistence.md`):** Repositories, WatermelonDB/Dexie/IndexedDB entegrasyonu.
- **Süreç & Event Akışları (`data-flow.md`):** State yönetimi, event bus ve modüller arası iletişim.

---

## 🚀 Nasıl Kullanılacak?

1. **Yazılım Mimarları & Tech Lead'ler:** Katman sınırlarını korumak ve mimari borç birikimini önlemek için bu kuralları uygular.
2. **Geliştiriciler:** Yeni bir feature eklerken doğru klasör yapısını (Domain, Repository, Hook, Component) seçmek için yararlanır.
3. **Refactor Süreçleri:** Kod taşıma ve modülerleştirme operasyonlarında rehber olarak kullanılır.

---

## ✍️ Belge Yazım Kuralları

- **Katmanlı İzolasyon:** UI bileşenlerinin doğrudan veritabanı veya alt seviye altyapıya bağımlı olması kesinlikle yasaktır.
- **Diyagramlar:** Mimariler açıklamaların yanı sıra Mermaid.js veya ASCII diyagramları ile görselleştirilmelidir.
- **Format:** Standart Markdown (`.md`).
- **Dosya Adlandırma:** Kebab-case (Örn: `architecture-bible.md`, `folder-structure.md`).
