# CLAUDE.md

Bu dosya, Claude Code'un bu repoda nasıl çalışacağını tanımlar. Kesin kurallar için kaynak dokümanlar:
- [`yasaklar_listesi.md`](yasaklar_listesi.md) — 8 altın kural (kalite, secrets, branch/PR akışı, hata yutmama, KVKK/GDPR, telif, modülerlik). Bunlara **%100** uyulur, istisna yoktur.
- [`WORKFLOW_GUIDELINES.md`](WORKFLOW_GUIDELINES.md) — branch isimlendirme, commit formatı, PR ve CI adımları.

## Proje

AI Producer Platform: DAW/mix-master/autotune bilgisi olmayan sanatçıların yalnızca sesini kaydederek yapay zeka prodüktörle stüdyo kalitesinde parça üretmesini sağlayan SaaS. Üç ana modül: AI Prodüktör Sohbeti & Vokal Studio, Viral Trend Analizörü, DSP tabanlı Mastering Engine (Demucs + Matchering + Pedalboard).

## Stack

- **Backend:** Python 3.11, FastAPI (`src/backend/`). Servisler `src/backend/services/` altında modüler (audio_analyzer, producer_ai, viral_scanner) — her biri bağımsız, birbirine sıkı bağlı değil.
- **Frontend:** `src/frontend/` (React/Vite/Tailwind/shadcn/ui migrasyonu planlanıyor — bkz. proje backlog'u).
- **Test/Lint:** `pytest` (`tests/`), `ruff` + `black` + `isort` + `mypy` (ayarlar `pyproject.toml`'da), güvenlik için `bandit` + `pip-audit`.

## Zorunlu iş akışı

1. `main`'e **asla** doğrudan commit/push yok. Her değişiklik yeni bir branch'te: `feature/*`, `fix/*`, `docs/*`, `refactor/*`, `perf/*`, `ci/*` (isimlendirme: `WORKFLOW_GUIDELINES.md`).
2. Conventional Commits (`feat:`, `fix:`, `docs:`, ...).
3. `gh pr create` ile PR aç, GitHub Actions'daki **tüm** zorunlu check'ler (test matrix, lint/type-check, bandit, pip-audit, secret scan, frontend integrity) yeşil olmadan merge etme.
4. Test silme/yorum satırına alma yasak; başarısız test kaynağı bulunup kod düzeltilir.
5. Boş `except`/`catch` yasak — hata her zaman loglanır veya yeniden fırlatılır.

## Secrets

- Hiçbir API key, DB şifresi veya token kod içine yazılmaz. Yerel geliştirme için `.env` (gitignore'da), CI/prod için GitHub Actions Secrets kullanılır.
- Hangi değişkenlerin gerektiğini görmek için [`.env.example`](.env.example)'a bak — gerçek değer içermez, sadece isim + açıklama.

## Agent'lar

`.claude/agents/` altında bu projeye özel 3 subagent var (bu klasör `.gitignore`'da — makineden makineye taşınmaz, repo'yu klonlayan başka biri görmez, gerekirse yeniden oluşturulur):
- **`code-reviewer`** — PR öncesi kod incelemesi, `yasaklar_listesi.md`'ye karşı da kontrol eder.
- **`bug-hunter`** — audio pipeline / FastAPI endpoint hatalarında root-cause analizi.
- **`frontend-developer`** — frontend işlerinde zorunlu: `ui-ux-pro-max` skill'i + 21st.dev MCP component/template araçlarını kullanır, jenerik/yarım UI üretmez.

İlgili işte doğru agent'ı proaktif olarak kullan; genel amaçlı agent'a düşmeden önce bunları değerlendir.

## Yapma

- `main`'e direkt push/commit
- Kod içine hardcoded secret
- Testleri silmek veya bypass etmek (`--no-verify` vb.)
- Ham/işlenmemiş AI audio çıktısını kullanıcıya sunmak (DSP zorunlu — bkz. `yasaklar_listesi.md` #1)
- Kullanıcı vokal verisini izinsiz saklamak/eğitmek (bkz. `yasaklar_listesi.md` #6)
