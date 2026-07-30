# 🤝 Contributing Guide — Katkı Rehberi

AI Producer Platform'a katkıda bulunmak istemen harika! Bu rehber süreci anlaşılır kılmak için hazırlanmıştır.

## 🚦 Başlamadan Önce

1. Mevcut **Issue**'ları kontrol et — belki birisi zaten aynı konuyu açmıştır.
2. Büyük değişiklikler için önce bir **Issue** aç ve tartışın.
3. Repoyu **Fork** et ve kendi branch'inden çalış.

## 🌿 Branch Stratejisi

```
feature/  → Yeni özellikler
fix/      → Hata düzeltmeleri
docs/     → Dokümantasyon güncellemeleri
refactor/ → Kod yeniden düzenleme
perf/     → Performans iyileştirme
ci/       → CI/CD değişiklikleri
```

## 📝 Commit Mesaj Standartları (Conventional Commits)

```
feat:     Yeni özellik
fix:      Hata düzeltme
docs:     Dokümantasyon değişikliği
style:    Kod stili (beyaz boşluk, biçim, noktalı virgül eksik vb.)
refactor: Hata düzeltme veya özellik ekleme olmayan yeniden yapılandırma
perf:     Performans iyileştirme
test:     Eksik test ekleme veya mevcut testleri düzeltme
chore:    Derleme süreci veya yardımcı araçlara değişiklikler
```

## 🔁 PR Süreci

1. `main` üzerinden güncel bir branch oluştur.
2. Değişikliklerini yap.
3. Tüm testlerin geçtiğinden emin ol: `pytest tests/ -v`
4. PR aç — PR şablonunu eksiksiz doldur.
5. CI/CD badge'leri yeşil olana kadar bekle.
6. En az **1 reviewer onayı** al.
7. `main`'e squash merge yap.

## 🧪 Testleri Çalıştırma

```bash
# Tüm testler
pytest tests/ -v

# Coverage raporu ile
pytest tests/ --cov=src --cov-report=term-missing

# Sadece belirli bir dosya
pytest tests/test_audio_engine.py -v
```

## 📦 Bağımlılık Kurulumu

```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Geliştirme araçları
```

## ❓ Yardım mı Lazım?

Issues bölümüne yaz veya Discussions'ı kullan.
