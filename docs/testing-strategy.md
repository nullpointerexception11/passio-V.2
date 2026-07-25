# PASSIO TESTING STRATEGY

---

## 🎯 Amaç

Passio Testing Strategy, uygulamanın doğruluğunu, kararlılığını, tip güvenliğini ve performansını garanti altına alan test süreçlerini tanımlar.

---

## 📐 Kapsam

Birim testler (Unit Tests), Entegrasyon testleri (Integration Tests), Statik Tip Kontrolü ve Derleme testlerini kapsar.

---

## 📜 Kurallar

1. **Otomatik Kontroller:** Her sprint tesliminde `tsc --noEmit` ve `npm run lint` sorunsuz geçmelidir.
2. **Kritik Servis Testleri:** `KnowledgeBridgeService`, `HighlightEngine` ve `ReadingNoteService` gibi çekirdek servislerin iş mantığı test edilmelidir.
3. **Sıfır Hata Politikası:** Derleme hatası içeren hiçbir kod ana dala (main) birleştirilemez.

---

## 💡 Örnekler

- Birim Test Örneği: `KnowledgeSearchService.search("felsefe")` çağrısının doğru kategorideki vurguları döndürdüğünü doğrulamak.
- Derleme Testi: `npm run build` komutunun hatasız bir şekilde CJS/ESM paket çıktısı üretmesi.

---

## ✅ Yapılacaklar

- Core servisler için saf birim testleri yazmak.
- Sayfa ve bileşenlerin render aşamasında çökmediğini doğrulayan arayüz testleri koşturmak.

---

## ❌ Yapılmayacaklar

- Sadece test geçsin diye sahte assertion'lar koymak.
- Yalnızca mutlu yol (happy path) senaryolarını test edip hata senaryolarını göz ardı etmek.

---

## 🌟 Best Practices

- Test yazımını geliştirme sürecinin doğal bir parçası haline getirmek.
