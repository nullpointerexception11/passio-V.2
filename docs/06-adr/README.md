# 06 - Architecture Decision Records (ADR)

> **PASSIO Mimari Karar Kayıtları ve Tarihsel Gerekçe Alanı**

---

## 🎯 Klasörün Amacı

Bu klasör, PASSIO mimarisinde alınan kritik mimari ve teknik kararların belgelendiği yerdir. Architecture Decision Record (ADR), bir mimari kararın **neden**, **hangi koşullar altında** ve **hangi alternatifler değerlendirilerek** alındığını tarihsel olarak kayıt altına alır.

---

## 🧠 Architecture Decision Record (ADR) Mantığı Nedir?

Yazılım projelerinde zamanla kod değişir, mimari evrilir ve yeni geliştiriciler ekibe katılır. ADR kullanımının temel amaçları şunlardır:

1. **"Neden Böyle Yapıldı?" Sorusunu Yanıtlamak:** Geçmişte alınan bir mimari kararın (Örn: *"Neden Redux yerine Context API kullanıldı?"* veya *"Neden WatermelonDB seçildi?"*) arkasındaki gerekçeyi açıklamak.
2. **Tekrarlayan Tartışmaları Önlemek:** Zaten değerlendirilmiş ve reddedilmiş alternatiflerin tekrar tekrar gündeme gelmesini engellemek.
3. **Teknik Borç ve Değişim Takibi:** Geçmişteki bir kararın geçerliliğini yitirmesi durumunda kararı "Deprecated" veya "Superseded" statüsüne çekerek mimari evrimi izlemek.

---

## 🔄 ADR Yaşam Döngüsü (Status Lifecycle)

Her ADR aşağıdaki durumlardan birine sahiptir:

- **Proposed (Önerildi):** Tartışılma aşamasındaki mimari öneri.
- **Accepted (Kabul Edildi):** Ekip ve mimar tarafından onaylanmış geçerli karar.
- **Rejected (Reddedildi):** Değerlendirilen ancak uygun bulunmayan öneri.
- **Deprecated (Kullanımdan Kaldırıldı):** Artık geçerli olmayan eski karar.
- **Superseded (Bununla Değiştirildi):** Başka bir ADR (Örn: ADR-005) tarafından geçersiz kılınıp yenisiyle değiştirilmiş karar.

---

## 📚 Burada Bulunacak Belgeler

Gelecekte eklenecek ADR örnekleri:
- `0001-local-first-data-architecture.md`
- `0002-feature-driven-folder-structure.md`
- `0003-pdf-rendering-engine-selection.md`

*(Not: Bu sprintte henüz karar eklenmemiştir; sadece altyapı ve standart tanımlanmıştır.)*

---

## 📋 ADR Doküman Formatı (Şablonu)

Yeni bir ADR kaydı oluştururken aşağıdaki standart şablon kullanılmalıdır:

```markdown
# ADR-XXXX: [MİMARİ KARAR BAŞLIĞI]

> **Durum:** Proposed / Accepted / Rejected / Deprecated / Superseded  
> **Tarih:** YYYY-MM-DD  
> **Karar Vericiler:** [Mimar / Tech Lead / Geliştirici İsimleri]  
> **İlişkili ADR:** [Varsa geçmiş ADR bağlantısı]  

---

## CONTEXT (BAĞLAM VE PROBLEM)
[Bu kararın alınmasını gerektiren teknik veya iş ihtiyacı nedir? Hangi kısıtlar var?]

---

## DECISION (ALINAN KARAR)
[Hangi mimari yaklaşım veya teknoloji seçildi? Karar net ve somut bir şekilde ifade edilmelidir.]

---

## ALTERNATIVES CONSIDERED (DEĞERLENDİRİLEN ALTERNATİFLER)
1. **Alternatif A:** [Neden seçilmedi?]
2. **Alternatif B:** [Neden seçilmedi?]

---

## CONSEQUENCES (SONUÇLAR VE ETKİLER)
### Olumlu Etkiler (Positive)
- ✅ [Avantaj 1]
- ✅ [Avantaj 2]

### Olumsuz Etkiler / Riskler (Negative / Trade-offs)
- ⚠️ [Dezavantaj veya üstlenilen teknik maliyet 1]
- ⚠️ [Dezavantaj veya üstlenilen teknik maliyet 2]

---

## COMPLIANCE & VERIFICATION (UYOMLULUK VE DOĞRULAMA)
[Bu karara uyulduğu kod gözden geçirme (PR) veya otomatik testlerle nasıl doğrulanacak?]
```

---

## ✍️ Belge Yazım Kuralları

- **Dosya Adlandırma:** `XXXX-kisa-aciklama.md` formatında 4 haneli sıralı numara (Örn: `0001-local-first-storage.md`).
- **Değiştirilemezlik (Immutability):** Kabul edilmiş bir ADR belgesi doğrudan değiştirilmez. Şayet bir karar değişirse yeni bir ADR yazılır ve eskisi "Superseded by ADR-XXXX" olarak işaretlenir.
