# 05 - Sprints Documentation

> **PASSIO Sprint Planlama, Uygulama ve Teslimat Dokümantasyon Alanı**

---

## 🎯 Klasörün Amacı

Bu klasör, PASSIO projesindeki kısa dönemli çalışma paketlerini (Sprint), her sprintin hedeflerini, teknik görev dağılımlarını, risk analizini, yapılmayacaklar listesini ve sprint teslimat raporlarını barındırır.

---

## 📚 Burada Bulunacak Belgeler

- **Sprint Dokümanları:** `sprint-M0-build-recovery.md`, `sprint-D0-documentation-foundation.md`, `sprint-001-architecture.md` vb.
- **Sprint İncelemeleri & Raporlar:** Her sprint sonunda üretilen teknik doğrulama çıktılan.

---

## 🚀 Nasıl Kullanılacak?

1. **Sprint Başlangıcı:** İlgili sprint için bu klasör altında bir doküman oluşturulur. Rol, hedefler, görevler ve kesinlikle yapılmayacaklar tanımlanır.
2. **Geliştirme Süreci:** Geliştiriciler sprint dokümanındaki girmeleri sırasıyla takip eder.
3. **Sprint Kapanışı:** Başarı kriterleri (`npm run build`, `npm run lint`, `npm run typecheck`) kontrol edilerek teslim raporu dokümana eklenir.

---

## 📋 Sprint Doküman Formatı (Şablonu)

Yeni bir Sprint dokümanı açılırken aşağıdaki standart şablon kullanılmalıdır:

```markdown
# PASSIO - Sprint [KODU]: [SPRINT BAŞLIĞI]

> **İlişkili Epic:** [EPIC-XXX]  
> **Sprint Durumu:** [Planlandı / Devam Ediyor / Tamamlandı]  
> **Tarih:** [YYYY-MM-DD]  
> **Atanan Rol:** [Senior Software Engineer / Software Architect vb.]  

---

## 🎯 1. SPRINT HEDEFİ
[Sprint'in ana amacını ve tamamlandığında elde edilecek somut çıktıyı net bir şekilde tanımlayın.]

---

## 📋 2. GÖREV MADDELERİ (TASKS)
- [ ] **Görev 1:** [Açıklama ve ilgili dosyalar]
- [ ] **Görev 2:** [Açıklama ve ilgili dosyalar]
- [ ] **Görev 3:** [Açıklama ve ilgili dosyalar]

---

## ❌ 3. YAPILMAYACAKLAR (OUT OF SCOPE / STRICT BOUNDARIES)
- ❌ [Bu sprintte kesinlikle yapılmayacak işlemler veya eklenmeyecek özellikler]
- ❌ [Uzak durulacak refactor veya stil değişiklikleri]

---

## ⚠️ 4. RİSK VE ETKİ ANALİZİ
- **Olası Risk:** [Oluşabilecek hata veya uyumsuzluk]
- **Etki Seviyesi:** [Yüksek / Orta / Düşük]
- **Geri Dönüş Planı (Rollback):** [Risk gerçekleşirse uygulanacak adım]

---

## ✅ 5. BAŞARI VE TEKNİK KONTROL KRİTERLERİ
Sprint başarıyla tamamlanmış sayılması için aşağıdaki tüm komutların hatasız derlenmesi şarttır:
- [ ] `npm install`
- [ ] `npm run build`
- [ ] `npm run typecheck`
- [ ] `npm run lint`

---

## 📦 6. TESLİM VE TESLİMAT RAPORU
1. **Build Başarılı mı?:** [Evet / Hayır]
2. **TypeScript Başarılı mı?:** [Evet / Hayır]
3. **Lint Başarılı mı?:** [Evet / Hayır]
4. **Etkilenen / Düzeltilen Dosyalar:**
   - `path/to/file1.ts`
   - `path/to/file2.tsx`
5. **Kalan Problemler / Teknik Borç:** [Varsa notlar]
6. **Bir Sonraki Sprint İçin Öneriler:** [Notlar]
```

---

## ✍️ Belge Yazım Kuralları

- **Dosya Adlandırma:** `sprint-[KOD]-[kisa-ad].md` (Örn: `sprint-M0-build-recovery.md`, `sprint-D0-documentation.md`).
- **Kesin Sınırlar:** Her sprint dokümanı mutlaka "YAPILMAYACAKLAR" bölümü içermelidir.
