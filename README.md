# 🎙️ AI Producer Platform - Yapay Zeka Destekli Stüdyo & Prodüktör Platformu

> **"DAW (FL Studio/Ableton), Mix & Master ve Autotune Bilmeye Gerek Kalmadan Profesyonel Rap ve Müzik Prodüksiyonu"**

AI Producer Platform, müzik prodüksiyon bilgisi (DAW kullanımı, frekans düzenleme, autotune, miks/mastering) olmayan sanatçıların ve rapçilerin yalnızca seslerini kaydederek ve yapay zeka prodüktörle doğal dilde konuşarak stüdyo kalitesinde bitmiş parçalar üretmelerini sağlayan yeni nesil SaaS platformudur.

---

## 🌟 Öne Çıkan Modüller

### 1. 🎧 İnteraktif AI Prodüktör Sekmesi (AI Producer Chat & Vocal Studio)
* **Doğal Dil İle İletişim:** "Bana Travis Scott tarzında, koyu/dark bir synth bası olan, 140 BPM trap beat yap" gibi talepleri anlar.
* **Vokal Kayıt & İletim:** Kullanıcı vokalini kaydeder veya yükler.
* **Referans Beat Analizi:** Kullanıcının beğendiği referans şarkı/beat'leri analiz eder; ton (key), akor dizilimi, BPM ve davul vuruşlarını extract eder ancak bağımsız/alakasız çıktılar üretmez.
* **Akıllı Vokal İşleme:** RVC/Kits.ai ve ototon/pitch correction algoritmaları ile sanatçının vokalini mükemmel tona oturtur.

### 2. 🔥 "Yapay Zekaya Aksiyon Aldır" / Viral Trend Analizörü (AI Action Tab)
* **Trend Taraması:** Tüm web'i (TikTok, Spotify Viral 50, YouTube Shorts) sürekli tarayarak popüler ve viral olmuş beat/şarkı tarzlarını analiz eder.
* **Akıllı Öneri Sistemi:** Kullanıcının ses rengine ve tarzına en uygun 2-3 adet viral ilhamlı beat kopyası/özgün yorumu önerir.
* **Tek Tıkla Prodüksiyon:** Önerilen viral beat'lerden biri seçildiğinde AI otomatik olarak vokalle beat'i miksler.

### 3. 🎚️ Üst Seviye Prodüktör Kalitesi & AI Fine-Tuning Pipeline
* **Jenerik AI Gürültüsüne Son:** Suno veya MusicGen gibi modellerden çıkan raw sesler doğrudan kullanılmaz.
* **Mastering Engine:** Demucs (stem separation) + Matchering (spektral referans miksi) + Pedalboard (EQ/compression/limiter) zinciriyle stüdyo mastering'i yapılır.
* **Pro Producer Datasets:** En iyi prodüktörlerin miks zincirleri, EQ eğrileri ve stem yapısı yapay zekaya öğretilmiştir.

---

## 💰 Abonellik & Monetizasyon Modeli (SaaS)

| Paket | Özellikler | Hedef Kitle |
| :--- | :--- | :--- |
| **Starter (Ücretsiz / Deneme)** | 2 Beat Üretimi, Standart Vokal Miksi, MP3 İndirme | Yeni Başlayanlar |
| **Pro Artist (Aylık Abonelik)** | Sınırsız AI Prodüktör Sohbeti, Viral Trend Önerileri, Autotune + Stüdyo Miksi, WAV İndirme | Aktif Rapçiler & Sanatçılar |
| **Studio Unlimited (Pro + Stems)** | Tüm İşlenmiş Stem'leri (Drums, Vocal, Bass, Melody Separated WAV) İndirme, Özel Vokal Eğitimi | Profesyonel Sanatçılar |

---

## 🔒 Mühendislik Standartları ve Yasaklar

Tüm geliştirme süreci [yasaklar_listesi.md](file:///C:/Users/Tunay/.gemini/antigravity-ide/scratch/ai-producer-platform/yasaklar_listesi.md) dokümanındaki 8 altın kurala tabidir:
1. Kalitesiz ve jenerik AI çıktısı verilemez.
2. `main` branch'ine doğrudan commit/push yapılamaz.
3. PR ve GitHub Actions denetimi yeşil olmadan merge edilemez.
4. Hardcoded secret / API key kullanılamaz.
5. Hata yutulamaz ve testler silinemez.
6. Vokal verileri izinsiz kullanılamaz.
7. Telifli sesler birebir kopyalanamaz (yalnızca müzikal parametre analizi).
8. Spagetti kod yazılamaz.

Detaylı Git iş akışı için [WORKFLOW_GUIDELINES.md](file:///C:/Users/Tunay/.gemini/antigravity-ide/scratch/ai-producer-platform/WORKFLOW_GUIDELINES.md) dokümanını inceleyiniz.
