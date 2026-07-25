# PASSIO FOLDER STRUCTURE

---

## 🎯 Amaç

Passio Folder Structure, projenin klasör hiyerarşisini, dosya yerleşim mantığını ve modüler organizasyonunu standartlaştırır.

---

## 📐 Kapsam

Kök dizin, `app/`, `src/`, `docs/`, `scripts/` ve alt dizinlerin organizasyonunu kapsar.

---

## 📜 Kurallar

```
passio/
├── app/                      # Uygulama çalışma kılavuzları
├── docs/                     # Proje teknik dokümantasyonu
│   ├── constitution.md
│   ├── design-bible.md
│   ├── development-bible.md
│   ├── architecture-bible.md
│   ├── product-bible.md
│   ├── coding-standards.md
│   ├── folder-structure.md
│   ├── naming-conventions.md
│   ├── ui-guidelines.md
│   ├── testing-strategy.md
│   ├── performance-guide.md
│   ├── error-handling.md
│   ├── logging.md
│   ├── git-workflow.md
│   ├── release-process.md
│   └── roadmap.md
├── src/                      # Kaynak kodlar
│   ├── components/           # Atomic UI bileşenleri (atoms, molecules, organisms)
│   ├── core/                 # Etki alanı servisleri (pdf, highlight, notes, knowledge)
│   ├── db/                   # Veritabanı şeması ve sürücüler
│   ├── data/                 # Statik materyal ve yükleyiciler
│   ├── layouts/              # Sayfa yerleşim kalıpları
│   └── routes/               # Yönlendirme tanımları
├── assets/                   # Görsel varlıklar ve medya
├── prototypes/               # Tasarım ve Arayüz taslakları
├── scripts/                  # Derleme ve yardımcı betikler
└── README.md                 # Proje genel bakış
```

---

## 💡 Örnekler

- Yeni bir UI atom bileşeni ekleneceğinde: `/src/components/atoms/Button.tsx`
- Yeni bir etki alanı servisi ekleneceğinde: `/src/core/knowledge/KnowledgeBridgeService.ts`

---

## ✅ Yapılacaklar

- Her dosyanı ait olduğu katmanın klasörüne koymak.
- İlgili yardımcı tipleri bileşen dosyasının yanına veya `/src/types.ts` içerisine tanımlamak.

---

## ❌ Yapılmayacaklar

- Kök dizine rastgele geçici dosyalar bırakmak.
- Core servis kodlarını `components/` dizini altına koymak.

---

## 🌟 Best Practices

- Klasör derinliğini maksimum 4-5 seviyede tutarak erişilebilirliği korumak.
