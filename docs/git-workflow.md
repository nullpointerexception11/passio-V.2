# PASSIO GIT WORKFLOW

---

## 🎯 Amaç

Passio Git Workflow, kod kaynak yönetiminde düzeni, izlenebilirliği ve güvenli sürüm birleştirmelerini sağlayan Git dallanma (branching) stratejisini tanımlar.

---

## 📐 Kapsam

Dal isimleri, commit mesajı formatları ve Pull Request (PR) onay süreçlerini kapsar.

---

## 📜 Kurallar

1. **Ana Dalları Koru:** `main` dalı her zaman üretime hazır ve kararlı durumdadır.
2. **Feature Branching:** Her yeni özellik veya düzeltme ayrı bir dalda geliştirilir:
   - `feature/epic-01-material-library`
   - `fix/pdf-page-gap-issue`
   - `docs/add-git-workflow`
3. **Conventional Commits:** Commit mesajları standart formatta yazılır (`feat:`, `fix:`, `docs:`, `refactor:`).

---

## 💡 Örnekler

- Commit Mesajı: `feat(reading-engine): add continuous scroll mode support`
- Commit Mesajı: `fix(knowledge-bridge): resolve citation markdown formatting bug`

---

## ✅ Yapılacaklar

- Küçük, atomik ve anlaşılır commit'ler atmak.
- Değişiklikleri ana dala birleştirmeden önce lint ve tip kontrollerini yerelde çalıştırmak.

---

## ❌ Yapılmayacaklar

- Doğrudan `main` dalına commit atmak.
- Yüzlerce dosyanın tek bir devasa commit ile gönderilmesi.

---

## 🌟 Best Practices

- Kod incelemelerinde (Code Review) Anayasa ve Tasarım İncisi kurallarına uyumu kontrol etmek.
