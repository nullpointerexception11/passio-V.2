# PASSIO UI GUIDELINES

---

## 🎯 Amaç

Passio UI Guidelines, kullanıcı arayüzü bileşenlerinin tasarımı, düzeni, erişilebilirliği ve etkileşim standartları için rehberlik sağlar.

---

## 📐 Kapsam

Atoms, Molecules, Organisms bileşen katmanlarını ve Tailwind CSS kullanım biçimlerini kapsar.

---

## 📜 Kurallar

1. **Atomic Design:** Arayüz bileşenleri `atoms/`, `molecules/`, `organisms/` ve `layouts/` hiyerarşisinde yapılandırılır.
2. **Apple Seviyesinde Sadelik:** Gereksiz süslemelerden, parıltılı efektlerden kaçınılır.
3. **Hassas Dokunma ve Odak:** Tüm tıklanabilir alanlar masaüstü ve dokunmatik kullanım için uygun boyutlandırılır (minimum 36px-44px).
4. **Koyu / Açık Tema Uyumluğu:** Bileşenler hem Gece (`dark:`) hem Krem/Aydınlık temada kusursuz görünmelidir.

---

## 💡 Örnekler

```tsx
// Doğru: Tailwind ile tutarlı ve temaya duyarlı sınıf kullanımı
export const PrimaryButton: React.FC<ButtonProps> = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 rounded-md bg-neutral-900 text-neutral-100 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 text-xs font-medium transition-colors"
  >
    {label}
  </button>
);
```

---

## ✅ Yapılacaklar

- Bileşenlerin responsive (esnek) davranış göstermesini sağlamak.
- Ekran okuyucular ve klavye gezintisi için `aria-label` ve odak belirteçleri eklemek.

---

## ❌ Yapılmayacaklar

- Satır içi (`style={{ ... }}`) stiller yazmak.
- Farklı bileşenlerde tutarsız kenar boşlukları (margin/padding) kullanmak.

---

## 🌟 Best Practices

- Görsel hiyerarşiyi renk yerine tipografik ağırlık ve boşluklarla kurmak.
