# 04 - Epics Documentation

> **PASSIO Büyük Ürün Özellikleri ve Epik Yönetim Alanı**

---

## 🎯 Klasörün Amacı

Bu klasör, PASSIO platformunun büyük ölçekli ürün hedeflerini, modüler yeniliklerini ve çoklu sprint gerektiren epik (Epic) dokümanlarını barındırır. Her Epic, yüksek seviyeli bir iş ihtiyacını veya kullanıcı deneyimi dönüşümünü temsil eder.

---

## 📚 Burada Bulunacak Belgeler

- **EPIC-000:** Architecture Migration & Structural Refactor
- **EPIC-101:** Library Experience & Material Management
- **EPIC-102:** Focus Reader & PDF Annotation Engine
- **EPIC-103:** Focus Writing Workspace & Knowledge Bridge

---

## 🚀 Nasıl Kullanılacak?

1. **Planlama:** Yeni bir büyük modül veya deneyim dönüşümü başlatılacağında bu klasör altında yeni bir `EPIC-XXX-name.md` belgesi açılır.
2. **Sprint Bölümleme:** Epic belgesi analiz edildikten sonra alt sprintlere (`docs/05-sprints/`) bölünür.
3. **Takip:** Epic içerisindeki tamamlama yüzdesi ve sprint teslimleri bu belgeden takip edilir.

---

## 📋 Epic Doküman Formatı (Şablonu)

Yeni bir Epic oluşturulurken aşağıdaki şablon birebir uygulanmalıdır:

```markdown
# EPIC-XXX: [EPİK ADI]

> **Durum:** [Taslak / Onaylandı / Devam Ediyor / Tamamlandı]  
> **Hedef Sürüm:** [v1.0.0 / v1.1.0 vb.]  
> **Sorumlu:** [Product Owner / Tech Lead]  

---

## 🎯 1. ÖZET VE HEDEF
[Epik'in ne olduğunu, amacını ve tamamlandığında kullanıcıya sunduğu değeri açıklayın.]

---

## 📋 2. KAPSAM VE BİLEŞENLER
### Kapsam Dahilinde Olanlar (In Scope)
- [ ] Özellik 1
- [ ] Özellik 2

### Kapsam Dışında Olanlar (Out of Scope)
- ❌ Açıkça yapılmayacak işler

---

## 🏗️ 3. MİMARİ VE TASARIM ETKİSİ
- **Etkilenen Katmanlar:** [UI / Domain / Infrastructure / Repository]
- **Tasarım Standartları:** [İlgili Passio Design Bible bağlantıları]

---

## 🏃 4. SPRINT BÖLÜMLERİ
- [ ] **Sprint X.1:** [Sprint başlığı ve hedefi]
- [ ] **Sprint X.2:** [Sprint başlığı ve hedefi]

---

## ⚠️ 5. RİSKLER VE BAĞIMLILIKLAR
| Risk | Etki Seviyesi | Önlem / Geri Dönüş Planı |
|---|---|---|
| [Risk açıklaması] | Yüksek / Orta / Düşük | [Alınacak tedbir] |

---

## ✅ 6. BAŞARI VE KABUL KRİTERLERİ
- [ ] Kabul kriteri 1
- [ ] Kabul kriteri 2
```

---

## ✍️ Belge Yazım Kuralları

- **Dosya Adlandırma:** `EPIC-XXX-kisa-ad.md` (Örn: `EPIC-101-library-experience.md`).
- **Kod ve Tasarım Bağlantıları:** Epic belgesi mutlaka ilgili ADR (`docs/06-adr/`) ve Tasarım İncili (`docs/01-design/`) dokümanlarına atıfta bulunmalıdır.
