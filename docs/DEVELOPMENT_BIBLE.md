# PASSIO GELİŞTİRME VE MİMARİ KILAVUZU (DEVELOPMENT BIBLE)

## 🏗️ Teknolojik Mimari

- **Frontend:** React 18+ (TypeScript), Vite
- **Styling:** Tailwind CSS (Atmosferik Gece / Krem Temalar)
- **Animasyonlar:** Motion (Framer Motion / Motion)
- **İkon Seti:** Lucide React
- **Veri Katmanı:** Drizzle ORM + LocalStorage / IndexedDB Fallback Store

## 📐 Modüler Katman Mimarisi (`/src`)

```
/src
 ├── core/                   # Etki Alanı Mantığı (Domain Logic & Models)
 │    ├── highlight/         # Vurgu Yönetimi
 │    ├── notes/             # Okuma Notları Yönetimi
 │    ├── notebooks/         # Yazıhane & Defter Yönetimi
 │    ├── knowledge/         # Bilgi Köprüsü (Knowledge Bridge) Services & Repositories
 │    └── logger/            # Merkezi Loglama Mekanizması
 ├── db/                     # Veritabanı ve Şema Yapısı
 ├── components/             # Atomic Design Yapısı
 │    ├── atoms/             # Düğmeler, Etiketler, Alanlar
 │    ├── molecules/         # Arama Barları, Önizleme Modalları, Yan Paneller
 │    └── organisms/         # Kütüphane, PDF Okuyucu, Yazıhane Editörü
 └── data/                   # Varsayılan Örnek Materyaller & PDF Yükleyiciler
```

## 📜 Kodlama İlkeleri

1. **Strict Type Safety:** `any` kullanımı kesinlikle yasaktır. Bütün veri yapıları arayüzler (`interface`) ile tanımlanır.
2. **Offline-First:** Tüm veritabanı işlemleri yerel depolama katmanı üzerinden anlık senkronizasyonla yürütülür.
3. **Temiz Ayrıştırma (Separation of Concerns):** Arayüz bileşenleri iş mantığını `core` servislerinden çağırır, kendisi veritabanı sorgusu çalıştırmaz.
