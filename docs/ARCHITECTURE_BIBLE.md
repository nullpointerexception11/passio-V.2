# PASSIO ARCHITECTURE BIBLE

---

## 🎯 Amaç

Passio Architecture Bible, uygulamanın uçtan uca yazılım mimarisini, bileşen haberleşme modellerini ve katman sınırlarını ayrıntılı şekilde dokümante eder.

---

## 📐 Kapsam

Clean Architecture, Domain-Driven Design (DDD) ve Component-Based UI mimarilerinin Passio projesindeki uygulamasını kapsar.

---

## 📜 Kurallar

1. **Domain Centric:** Sistem merkezinde `core/` altında tanımlı etki alanı modelleri (`Highlight`, `ReadingNote`, `Notebook`, `KnowledgeItem`) yer alır.
2. **Bağımlılık Yönü:** Bağımlılıklar dış katmanlardan iç katmanlara doğru akar. UI -> Core Services -> Data Repositories.
3. **Veri Soyutlama:** DB şeması değişse dahi Core modeller etkilenmez; bu dönüşüm Repository katmanında yapılır.

---

## 💡 Örnekler

```
[ UI Layer (React Components) ]
          │ (Calls)
          ▼
[ Domain/Core Services (HighlightService, KnowledgeBridgeService) ]
          │ (Uses Interfaces)
          ▼
[ Infrastructure / DB Layer (HighlightRepository, Schema, Storage) ]
```

---

## ✅ Yapılacaklar

- Servisleri saf TypeScript sınıfları veya fonksiyonları olarak tasarlamak.
- Repository kalıbını (Repository Pattern) kullanarak veri erişimini soyutlamak.
- Bileşenler arası durum paylaşımını React Context veya stabil state yöneticileri ile yapmak.

---

## ❌ Yapılmayacaklar

- UI bileşenlerinin alt bileşenlere doğrudan veritabanı sürücüsü nesneleri geçmesi.
- Dış kütüphaneleri doğrudan iş mantığı çekirdeğine sızdırmak.

---

## 🌟 Best Practices

- Modüller arası bağımlılıkları minimize etmek (Low Coupling, High Cohesion).
- Veri akışlarında tek yönlü veri akışı (Unidirectional Data Flow) ilkesini uygulamak.
