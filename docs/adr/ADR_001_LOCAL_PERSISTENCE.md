# ADR 001: Offline-First Yerel Depolama Yapısı

## Durum
Kabul Edildi (Accepted)

## Bağlam
Passio, kullanıcının veri gizliliğini ve internet bağlantısından bağımsız kesintisiz odaklanmasını hedefler.

## Karar
Tüm okuma vurguları, okuma notları ve yazıhane defterleri sunucu gereksinimi olmaksızın kullanıcının tarayıcısında LocalStorage ve IndexedDB üzerinde saklanacaktır.

## Sonuçlar
- Pozitif: Tamamen çevrimdışı çalışabilme, sıfır sunucu maliyeti, maksimum gizlilik.
- Negatif: Cihazlar arası otomatik bulut eşitlemesi bulunmaz (kullanıcı manuel dışa aktarım yapar).
