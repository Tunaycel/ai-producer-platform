# AI Producer Platform - Git & GitHub Actions İş Akışı Rehberi (Workflow Guidelines)

Bu doküman, projedeki kod geliştirme, branch yönetimi, Pull Request (PR) süreçleri ve GitHub Actions ile sürekli kod denetimi (Continuous Integration & Code Audit) standartlarını belirler.

---

## 📌 1. Branch İsimlendirme Standartları

Projede `main` branch'i doğrudan geliştirmeye kapalıdır. Yapılacak her işlem için aşağıdaki standartlara uygun yeni bir branch açılmalıdır:

* **Yeni Özellikler (Features):** `feature/feature-name` (Örnek: `feature/vocal-autotune-pipeline`, `feature/viral-trend-scraper`)
* **Hata Düzeltmeleri (Fixes):** `fix/bug-name` (Örnek: `fix/audio-stem-sync-delay`, `fix/beat-bpm-detection`)
* **Dokümantasyon (Docs):** `docs/doc-name` (Örnek: `docs/api-specifications`)
* **Refaktör & Performans:** `refactor/component-name` veya `perf/audio-processing`
* **CI/CD İş Akışları:** `ci/workflow-name`

---

## 🔄 2. Adım Adım Geliştirme İş Akışı

1. **Branch Oluşturma:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/yeni-ozellik-adi
   ```

2. **Değişikliklerin Yapılması ve Commit:**
   Commit mesajları açık ve standart olmalıdır (Conventional Commits):
   * `feat: add spectral matching mastering engine`
   * `fix: correct stem separation offset calculation`
   * `docs: update forbidden rules list`

3. **Branch Push:**
   ```bash
   git push origin feature/yeni-ozellik-adi
   ```

4. **Pull Request (PR) Açma:**
   * GitHub üzerinde `main` branch'ine doğru bir PR oluşturulur.
   * PR şablonunda yapılan değişiklikler, test sonuçları ve kontrolden geçen maddeler açıklanır.

5. **Otomatik GitHub Actions Denetimi:**
   * PR açıldığı an GitHub Actions iş akışı (`code-audit.yml`) tetiklenir.
   * Linter (ESLint / Flake8 / Ruff), Type Checker (TypeScript / MyPy), Security Audit ve Unit Testler çalışır.

6. **Merge Şartı:**
   * Tüm GitHub Actions adımları **YEŞİL (PASS)** olmadan ve kod incelemesi onaylanmadan PR `main` branch'ine merge edilemez!

---

## ⚙️ 3. Sürekli Kod Denetimi (Code Audit Pipeline)

GitHub Actions tarafında çalışacak kontroller:

1. **Static Code Analysis & Linting:** Kod standartlarına ve temiz kod kurallarına uygunluk.
2. **Security & Dependency Audit:** API key sızıntıları ve güvenlik zafiyeti barındıran paketlerin tespiti.
3. **Audio Processing Unit Tests:** Audio işleme modüllerinin doğruluğu (BPM hesabı, frekans aralıkları, format dönüşümleri).
4. **Forbidden Rules Compliance Check:** `yasaklar_listesi.md` kurallarına uygunluk doğrulaması.
