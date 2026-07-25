# PASSIO

> **"Az ekran. Az renk. Az hareket. Çok düşünce."**

Passio; insanın okuma, düşünme, not alma ve yazma süreçlerini tek bir sessiz masaüstü çalışma ortamında birleştiren, **offline-first**, **minimal** ve **odak merkezli** bir bilgi yönetim ve üretim platformudur.

---

## 📌 Proje Tanıtımı

Passio, bilginin yalnızca depolandığı değil; derinlemesine okunduğu, sindirildiği, notlandırıldığı ve nihayetinde özgün bir içeriğe dönüştürüldüğü "Sessiz Bir Yazıhane" (Silent Sanctuary) sunar. 

Geleneksel, karmaşık ve dikkat dağıtıcı paneller yerine; Apple standartlarında estetik, yüksek kontrastlı tipografi ve pürüzsüz çalışma alanları sunarak kullanıcının tamamen okuma ve düşünme sürecine odaklanmasını sağlar.

---

## 🎯 Vizyon

Passio'nun temel amacı kullanıcıyı bildirim bombardımanından ve görsel gürültüden uzak tutmaktır. Ürün vizyonumuz üç temel ilkeye dayanır:

1. **Sessizlik (Silence):** Kullanıcı arayüzü içeriğin önüne geçemez. Sakin renkler, göz yormayan nötr tonlar ve yalın tipografi.
2. **Odak (Focus):** Tek amaçlı, derinleşmeyi sağlayan ekran tasarımları. Karmaşık dashboard'lar veya kalabalık araç çubukları yer almaz.
3. **Süreklilik (Continuity):** Yerel veritabanı ile kesintisiz offline çalışma, okunan PDF ile yazılan notlar arasında anlık "Knowledge Bridge" bağı.

---

## 🏗️ Mimari Genel Bakış

Passio, sürdürülebilir, ölçeklenebilir ve bağımsız bir **Feature-Driven & Local-First Architecture** üzerine kurulmuştur:

- **Frontend Core:** React 18, TypeScript (Strict Mode), Vite.
- **Styling & UI Engine:** Tailwind CSS, Lucide Icons, Motion.
- **Local-First Storage:** IndexedDB / Dexie / WatermelonDB repository katmanı ile tüm veriler kullanıcının kendi cihazında güvenle saklanır.
- **Domain Decoupling:** Business logic ve veri işleme süreçleri UI katmanından tamamen soyutlanmış, repository ve service pattern'leri ile sarmalanmıştır.
- **Document Engine:** PDF rendering, canvas manipülasyonu, continuous scroll ve metin katmanı overlay yönetimi.

---

## 📚 Dokümantasyon Yapısı

Projede tüm teknik, tasarım ve ürün kararları `/docs` klasörü altında standartlaştırılmıştır:

| Klasör | Açıklama |
|---|---|
| [`docs/00-product/`](./docs/00-product/README.md) | Ürün vizyonu, PRD'ler ve kullanıcı senaryoları |
| [`docs/01-design/`](./docs/01-design/README.md) | Passio Design Bible, renk paleti ve tipografi standartları |
| [`docs/02-development/`](./docs/02-development/README.md) | Kodlama standartları, Git workflow ve test stratejisi |
| [`docs/03-architecture/`](./docs/03-architecture/README.md) | Sistem mimarisi, katman yönetimi ve klasör yapısı |
| [`docs/04-epics/`](./docs/04-epics/README.md) | Büyük ürün epikleri (EPIC-000, EPIC-101 vb.) |
| [`docs/05-sprints/`](./docs/05-sprints/README.md) | Sprint planları, teknik hedefler ve teslimat raporları |
| [`docs/06-adr/`](./docs/06-adr/README.md) | Architecture Decision Records (Mimari Karar Kayıtları) |
| [`docs/07-reviews/`](./docs/07-reviews/README.md) | Kod gözden geçirme (Code Review) ve mimari denetimler |
| [`docs/08-decisions/`](./docs/08-decisions/README.md) | Ürün ve operasyonel karar kayıtları |

---

## 🔄 Geliştirme Süreci

Geliştirme süreci sıkı kalite kontrolleri ve sprint disiplini ile yürütülür:

1. **Sprint Planlama:** Her sprint için `docs/05-sprints/` altında kısıtlar, hedefler ve yapılmayacaklar tanımlanır.
2. **Kalite Geçitleri:** Kod geliştirmesi tamamlandıktan sonra derleme ve tip kontrolleri zorunludur.
3. **Sürekli Doğrulama:**
   - `npm run lint` (Tsc & Linter denetimi)
   - `npm run build` (Üretim derlemesi doğrulaması)

---

## 📁 Repository Yapısı

```
PASSIO/
├── docs/                      # Proje dokümantasyon altyapısı (00-08)
├── src/
│   ├── components/            # Paylaşılan atom, molekül ve layout bileşenleri
│   ├── core/                  # Çekirdek servisler, highlight ve PDF motoru
│   ├── entities/              # Veri modelleri ve domain tipleri
│   ├── features/              # Feature-Driven modüller (library, reader, writing, notes vb.)
│   ├── infrastructure/        # Dış servisler ve veritabanı sürücüleri
│   ├── layouts/               # Ana uygulama düzenleri
│   └── routes/                # Uygulama yönlendirme haritası (AppRoutes)
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🤝 Katkı Rehberi

Passio geliştirmelerine katkıda bulunurken şu kurallara dikkat edilmelidir:

1. Dokümantasyon standartlarına (`/docs`) ve Passio Design Bible'a tam uyum sağlayın.
2. UI bileşenleri içerisine doğrudan veritabanı erişimi veya ağır iş mantığı yerleştirmeyin.
3. TypeScript `strict` modunu koruyun ve `any` kullanımından kaçının.
4. Yeni bir mimari yaklaşım öneriliyorsa `docs/06-adr/` altında bir ADR taslağı açın.

---

## 📄 Lisans

Bu proje özel mülkiyete tabidir. Tüm hakları saklıdır.
