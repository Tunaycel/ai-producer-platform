# AI Producer Platform - Yasaklar Listesi (Forbidden Engineering Rules)

Bu doküman, **AI Producer Platform** projesinin geliştirilmesi, kod kalitesi, AI model çıktısı, güvenlik ve Git iş akışları için **kesinlikle uyulması gereken kuralları (Yasaklar Listesi)** içermektedir. Projeye katkıda bulunan tüm geliştiriciler ve AI ajanları bu kurallara %100 uymakla yükümlüdür.

---

## 🚫 1. Kalitesiz ve Jenerik AI Çıktısı Yasaktır
* **Ham/İşlenmemiş AI Audio Paylaşımı Yasak:** Modellerden (örneğin Suno, MusicGen) çıkan ham ses dosyaları doğrudan kullanıcıya sunulamaz.
* **DSP & Mastering Zorunlu:** Üretilen her beat ve vokal, Stem Separation (Demucs/UVR), EQ, Dynamic Range Compression ve Spectral Reference Matching (Matchering/Pedalboard) aşamalarından geçmek zorundadır.
* **Jenerik Prompt Üretimi Yasak:** Yapay zeka, kullanıcı istemlerini basit veya alakasız jenerik müzik kalıplarına dönüştüremez. Referans track analizinden çıkan BPM, Key, Scale ve Drum Pattern parametrelerine sadık kalmalıdır.

## 🚫 2. Doğrudan `main` / `master` Branch'ine Commit ve Push Yapmak Yasaktır
* **Doğrudan Commit Yasak:** `main` branch'i korumalıdır (Protected Branch). Hiçbir geliştirici veya AI ajanı doğrudan `main` branch'ine commit atamaz.
* **Branch Zorunluluğu:** Tüm yeni özellikler (`feature/feature-name`), hata düzeltmeleri (`fix/bug-name`) veya dokümantasyon güncellemeleri (`docs/doc-name`) ayrı bir branch açılarak yapılmalıdır.

## 🚫 3. PR ve CI/CD Denetimi Olmadan Merge Etmek Yasaktır
* **Yeşil Işık Zorunluluğu:** GitHub Actions üzerinde çalışan tüm Code Audit, Linter, Security Scan ve Unit Test adımları **YEŞİL (PASS)** olmadan hiçbir Pull Request (PR) `main` branch'ine merge edilemez.
* **Manuel Bypassing Yasak:** Testleri pas geçmek (bypass/force merge) kesinlikle yasaktır.

## 🚫 4. Hardcoded Secret / API Key Kaydetmek Yasaktır
* **Kod İçi Key Yasak:** API key'leri, veritabanı şifreleri veya secret token'lar asla kod dosyalarına yazılamaz.
* **Environment Variables Zorunlu:** Tüm hassas bilgiler `.env` veya GitHub Secrets / Cloud Secret Manager üzerinden okunmalıdır. `.env` dosyası `.gitignore` içinde yer almalıdır.

## 🚫 5. Hata Yutmak, Silmek veya Test Kapsamını Düşürmek Yasaktır
* **Boş Try/Catch Yasak:** Oluşan hatalar bastırılamaz, yutulamaz (`catch (e) {}` veya `except: pass` forbidden).
* **Test Silme Yasak:** Başarısız olan unit/integration testleri silinemez veya yorum satırına alınamaz. Hata kaynağı tespit edilip kod düzeltilmelidir.

## 🚫 6. Kullanıcı Vokal Verisinin İzinsiz Saklanması ve Eğitilmesi Yasaktır (KVKK / GDPR)
* **İzinsiz Ses Verisi Eğitimi Yasak:** Kullanıcının kaydettiği ham vokal verileri, kullanıcının açık rızası olmadan genel AI modellerini eğitmek için saklanamaz veya üçüncü taraflarla paylaşılamaz.
* **Şifreli Depolama:** Vokal kayıtları yalnızca oturum süresince işlenmeli ve geçici depolamada şifreli olarak tutulmalıdır.

## 🚫 7. Lisans ve Telif İhlali Yapan Birebir Ses/Beat Kopyalamak Yasaktır
* **Telif İhlali Yasak:** "Yapay Zekaya Aksiyon Aldır / Viral Trend önerme" sekmesinde viral şarkılar analiz edilirken doğrudan telifli ses dalgaları (audio wave) kopyalanamaz.
* **Parametrik Analiz:** Yalnızca müzikal parametreler (BPM, Ton/Key, Akor Dizilimi, Drum Groove, Enerji Eğrisi) analiz edilip sıfırdan özgün prodüksiyon önerilmelidir.

## 🚫 8. Modüler Yapıyı Bozacak Spagetti Kod ve Monolitik Tasarım Yasaktır
* **Spagetti Kod Yasak:** AI audio işleme, web scraping, backend API ve frontend UI katmanları birbirinden kesin sınırlarla ayrılmalıdır.
* **Modüler Mimari:** Vokal işleme servisi, beat jeneratörü ve viral analizör bağımsız microservice/modül olarak tasarlanmalıdır.
