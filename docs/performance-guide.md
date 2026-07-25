# PASSIO PERFORMANCE GUIDE

---

## 🎯 Amaç

Passio Performance Guide, uygulamanın düşük bellek kullanımı, hızlı açılış süresi ve yüksek kare hızıyla (60 FPS) çalışmasını sağlayan optimizasyon tekniklerini içerir.

---

## 📐 Kapsam

PDF işleme, dikey sayfa render etme, bellek yönetimi ve React bileşen optimizasyonlarını kapsar.

---

## 📜 Kurallar

1. **Lazy Page Rendering:** 1000+ sayfalık PDF dosyalarında yalnızca ekranda veya yakınında görünen sayfalar render edilir.
2. **Memory Cleanup:** Ekrana uzaklaşan PDF sayfalarının canvas bellek alanı `pdfPage.cleanup()` ile serbest bırakılır.
3. **Debounced Search:** Bilgi Köprüsü aramalarında her tuş basımında değil, 250ms debounced arama çalıştırılır.
4. **Memoization:** Pahalı hesaplamalar `useMemo` ve `useCallback` ile koruma altına alınır.

---

## 💡 Örnekler

```typescript
// Doğru: PDF Canvas render alanını görünürlük kesildiğinde temizlemek
useEffect(() => {
  return () => {
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }
  };
}, []);
```

---

## ✅ Yapılacaklar

- Uzun listelerde sanallaştırma (Virtualization) kullanmak.
- Ağır işlemleri arka plan işçilerine (Web Workers) veya mikro görevlere devretmek.

---

## ❌ Yapılmayacaklar

- Her state değişiminde tüm PDF belgesini yeniden render etmek.
- Gereksiz yere devasa veri paketlerini hafızada saklamak.

---

## 🌟 Best Practices

- React DevTools Profiler ile sürekli kare hızı ve render sürelerini izlemek.
