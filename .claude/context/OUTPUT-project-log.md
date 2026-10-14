# Orvenio Fitness — Proje Logu

Statik ebook mağazası (portfolyo/taslak). Fitness programı ebook'ları, Stripe Checkout ile ödeme, Netlify'da deploy.
Bu klasör Shopify projesi DEĞİL — üst klasördeki CLAUDE.md'nin Liquid kuralları burada geçerli değil.

## 2026-10-14 — Kickoff & plan

**Kararlar (kullanıcıyla netleştirildi):**
- Stripe: Netlify Function (`/api/checkout`) Stripe'ta Checkout Session açıp kullanıcıyı Stripe'a yönlendiriyor. Sepet yok, "Buy" → direkt Stripe.
  - Fiyat ve ürün adı sunucu tarafında `public/data/products.js`'den okunuyor; client sadece `slug` gönderiyor (fiyat manipülasyonu mümkün değil).
  - Stripe SDK yerine REST API `fetch` ile çağrılıyor → sıfır npm bağımlılığı, `package.json` yok.
  - `price_data` inline kullanılıyor → Stripe panelinde ürün oluşturmak gerekmiyor, sadece `STRIPE_SECRET_KEY`. İstenirse ürüne `stripePriceId` eklenince Price ID kullanılır.
- Tasarım: "Dark performance" — siyaha yakın zemin, lime vurgu, condensed display font (Big Shoulders Display) + Archivo + JetBrains Mono.
- Sayfalar: çok sayfalı. `index.html` (hero, katalog+filtre, how it works, FAQ), `product.html` (`/ebooks/:slug` rewrite ile), `success.html`, `404.html`.
- Stack: saf HTML/CSS/vanilla JS (ES modules), build aracı yok. Kartlar ve detay sayfası `products.js`'den JS ile render ediliyor.
- Kapaklar: görsel yok, CSS ile üretilen tipografik kapaklar (4 stil: lime / ink / grid / paper).
- Ürünler: 12 adet uydurma ebook, fiyatlar kullanıcının ekran görüntüsünden ($22.99 ×4, $34.99 ×6, $52.49 bundle, $68.97 bundle).

**Alternatifler (reddedildi):**
- Stripe Payment Links → kodsuz ama "API entegrasyonu" sayılmaz.
- Astro/11ty → gereksiz build adımı, taslak için fazla.
- Her ürün için ayrı statik HTML → tekrar eden markup; JS render seçildi (SEO taslak için önemsiz).

**Dikkat / riskler:**
- ES module kullanıldığı için `index.html` çift tıklayınca (file://) katalog boş görünür. Lokal önizleme için `npx serve public` veya `npx netlify-cli dev`.
- Ödeme sonrası teslimat (webhook, PDF gönderimi) KAPSAM DIŞI — success sayfası "e-posta ile link geldi" diyor ama gerçek gönderim yok.
- `public/` yayınlanıyor; `netlify/` yayınlanmıyor (fonksiyon kaynağı public değil).

## 2026-10-14 — İlk sürüm tamamlandı (lokal QA geçti)

**Yapılan:** Tüm sayfalar + CSS + JS + Netlify fonksiyonu yazıldı, Chrome'da 1440 / 760 / 390 px'te görsel QA yapıldı.

**QA'de bulunup düzeltilenler:**
- `serve.json`'da `cleanUrls: false` → serve'in index.html'i bulmasını engelliyor (dizin listesi gösteriyordu). Kaldırıldı.
- Hero başlığı 1440'ta fold'u aşıyordu → `.h-xl` 11vw'den 9.2vw'ye.
- Mobilde hero kitap yığını görünmüyordu: `margin: auto` + absolute çocuklar → genişlik 0. `.hero__stack`'e `width: 100%` eklendi.
- `/?category=x#programs` linklerinde tarayıcının fragment scroll'u JS render yüzünden 0'da kalıyordu → `catalog.js` render sonrası (ve fontlar yüklenince) `scrollIntoView` ile kendisi atlıyor.

**Doğrulananlar:**
- Checkout fonksiyonu Node'da gerçek `Request` ile test edildi: GET→405, key yok→503, bozuk JSON→400, bilinmeyen slug→404, geçersiz key→Stripe'tan 502 + mesaj. Gerçek bir Stripe test key ile uçtan uca test HENÜZ yapılmadı (kullanıcının key'i gerekli).
- Buy butonu: statik önizlemede 404 → "Checkout isn't available in this static preview" toast'u. Netlify'da fonksiyon devreye girer.

**Kalan / sonraki adımlar:**
- Kullanıcı: Stripe test key alıp Netlify'da `STRIPE_SECRET_KEY` env var olarak ekleyecek; Git'e push + Netlify import.
- Ödeme sonrası teslimat (webhook + PDF e-postası) kapsam dışı — ileride istenirse `netlify/functions/stripe-webhook.mjs` + e-posta servisi gerekir.
- Git henüz init edilmedi (kullanıcı kendisi yükleyeceğini söyledi).

## 2026-10-14 — Git'e yüklendi

- Repo: https://github.com/borakuzey212-ai/ebook (public, `main`). Commit yazarı `Bora Kuzey <borakuzey212@gmail.com>` (repo-local git config).
- Bu makinedeki gh girişi `boratsd` → repoya collaborator olarak eklendi, push öyle yapıldı. Kullanıcı isterse collaborator'ı kaldırabilir; sonraki push'lar için yeniden yetki gerekir.
- Netlify deploy: kullanıcı web arayüzünden yapacak (Import from Git, publish `public`, env var `STRIPE_SECRET_KEY` = sk_test).
- Güvenlik notu: kullanıcı sohbete bir `sk_live_` key yapıştırdı → iptal edip (Roll key) test key kullanması söylendi. Key hiçbir dosyaya yazılmadı.

## 2026-10-14 — Palet: Ember · Layout: "Editorial raf"

**Palet.** Üç alternatif (Ember / Ice / Paper) `?theme=` ile render edilip kullanıcıya gösterildi; **Ember** seçildi (zemin `#0c0b0a`, vurgu `#ff4d1f`). CSS'te `--lime` → `--accent` olarak yeniden adlandırıldı; kapak renkleri `--cover-*` token'larına çıkarıldı; `.cover--lime` → `.cover--accent` (products.js `cover: "accent"`). Geçici tema anahtarı ve diğer paletler koddan silindi — tek palet var, tema altyapısı tutulmadı (gereksiz karmaşıklık).

**Layout (ana sayfa).** Kullanıcı "biraz değiştir" dedi; 3 mockup'tan "Editorial raf" seçildi:
- Hero: tam genişlik dev başlık (2 satır), altında lead + CTA satırı, altında yatay kaydırılabilir "raf" (12 kapak, sağa taşar, `scroll-snap`).
- "Start here": 3 büyük kart (`.catalog--featured`).
- "All programs": kart grid yerine numaralı içindekiler listesi (`.index-row`, grid-areas ile ≤960px'te yeniden diziliyor).
- "How it works": 3 sütun yerine dikey zaman çizgisi (`.timeline`).
- Ürün sayfası değişmedi. Ölü CSS (`.hero__stack`, `.rows`, `.steps`) silindi.

**QA'de bulunan:** `scroll-snap` raftaki sol padding'i yutuyordu → `scroll-padding-inline` eklendi. 1440 / 760 / 390 kontrol edildi, konsol temiz.

## 2026-10-14 — Stripe hesap doğrulaması için şirket/yasal bilgiler

Kullanıcı Stripe hesabındaki işletme bilgilerini paylaştı (IEM GLOBAL LTD, Londra kayıtlı adres, destek telefonu, statement descriptor `HTTPS://WWW.ORVENIO.CO`, site `www.orvenio.com`). Stripe'ın web sitesinde aradığı öğeler eklendi:
- `public/contact.html` — destek e-posta/telefon, tüzel ad, kayıtlı ofis, ekstre açıklaması, ödeme/teslimat açıklaması.
- `public/legal.html` — Terms of service, Privacy policy (UK GDPR), Refunds & delivery (14 gün iade, e-posta ile anında teslim). Footer'daki `#` linkleri bu sayfalara bağlandı.
- Footer'a şirket künyesi + destek + descriptor; "Portfolio demo · test mode" satırı kaldırıldı (gerçek hesap için yanlış sinyal).
- SSS'ye "What will appear on my card statement?" eklendi; success sayfasına destek satırı.

**Bilerek eklenmeyenler:** hesap temsilcisinin doğum tarihi ve ev adresi (KYC verisi, sitede olmamalı). **Eksik:** Company Registration Number — UK şirketleri için sitede zorunlu, kullanıcıdan istendi.
**Öneri:** statement descriptor'ı `ORVENIO FITNESS` yapmak (okunabilir, chargeback'i azaltır); yapılırsa sitedeki 4 yerde metin güncellenmeli (grep `ORVENIO.CO`).
