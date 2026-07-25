# PASSIO MİMARİSİ (ARCHITECTURE)

## System Overview
Passio, tamamen istemci tarafında (offline-first) çalışan, yüksek performanslı bir okuma, düşünme ve yazma platformudur.

## Katmanlar
- **UI Katmanı:** Atomic Design ilkelerine sadık kalınarak oluşturulmuş React bileşenleri (`/src/components`).
- **Etki Alanı (Domain Logic):** İş mantığı ve veri yönetimini üstlenen çekirdek servisler (`/src/core`).
- **Veri Depolama (Data Storage):** Drizzle ORM ile şemalandırılmış ve LocalStorage/IndexedDB üzerinde tutulan çevrimdışı veritabanı (`/src/db`).
