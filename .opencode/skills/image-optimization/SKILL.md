---
name: image-optimization
description: Audit non distruttivo e ottimizzazione immagini/video/asset per siti già in produzione. Inventario pesi, formati moderni (AVIF/WebP), qualità, responsive (srcset/sizes), lazy loading, cache/CDN, bundle e metriche Lighthouse, con regole di sicurezza (preview in cartella dedicata, backup, diff approvati, rollback). Usare quando l'utente chiede "ottimizza le immagini", "audit performance", "peso pagina", "compressione", "Lighthouse", "formati moderni" o riduzione della banda.
---

# Skill: image-optimization

Ottimizzazione immagini e performance web su siti **già in produzione**.
Priorità assoluta: **non rompere nulla**. Ogni modifica è proposta, approvata,
applicata in batch piccoli, verificata e reversibile.

## Regole di sicurezza (non negoziabili)

1. Mai deploy, commit, push, cancellazione o sostituzione di file senza approvazione esplicita e diff mostrato.
2. Mai sovrascrivere un originale: si lavora su `.optimization-preview/` e solo dopo approvazione si sostituisce l'originale, previa copia di backup.
3. Prima di qualsiasi modifica: backup (`git stash list`/branch locale o copia `.bak`) e commit precedente noto (`git log -1`).
4. Batch incrementali: 5–10 immagini più pesanti **oppure** una sola pagina/template per volta.
5. Dopo ogni batch: report (originale, ottimizzato, risparmio %, formato, qualità, nota visiva) e diff completo per le modifiche a codice.
6. Nessuna migrazione di schema/DB: l'ottimizzazione immagini non deve toccare i dati.

## Fase 1 — Inventario (sola lettura)

```bash
# Peso per estensione (escludi build e dipendenze)
find . -path ./node_modules -prune -o -path ./dist -prune -o -path ./.git -prune -o \
  -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.gif" \
  -o -iname "*.webp" -o -iname "*.avif" -o -iname "*.svg" \) -printf "%s %p\n" | \
  awk '{n=split($2,a,".");e=tolower(a[n]);c[e]+=$1;k[e]++} END{for(e in c) printf "%-6s %3d file %8.2f MB\n",e,k[e],c[e]/1048576}'

# Top file pesanti
find . -path ./node_modules -prune -o -path ./dist -prune -o -type f \
  \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.webp" -o -iname "*.avif" -o -iname "*.mp4" \) \
  -printf "%s\t%p\n" | sort -nr | head -25

# Dimensioni intrinseche (serve sharp, già in devDependencies)
node -e "
const sharp=require('sharp'),fs=require('fs'),p=require('path');
(async()=>{for(const f of fs.readdirSync('public')){const q=p.join('public',f);
 if(!/\.(png|jpe?g|webp|avif|gif)$/i.test(f))continue;
 const s=fs.statSync(q).size; const m=await sharp(q).metadata();
 console.log((s/1024).toFixed(1).padStart(9)+' KB  '+(m.width+'x'+m.height).padEnd(14)+'  '+f)}})()"

# Formato supportato dal server/CDN (accetta il codice di stato con -H 'Accept-Encoding: avif,webp')
curl -sI -H 'Accept-Encoding: avif,webp' https://esempio.it/img.jpg | grep -i "vary\|content-encoding"
```

## Fase 2 — Verifiche HTTP/CDN (sola lettura)

```bash
B=https://www.esempio.it
curl -s -o /dev/null -D - --http2 -H "Accept-Encoding: gzip, br" "$B/" | grep -iE "^(HTTP|cache-control|content-encoding|cf-cache-status|age|alt-svc)"
# ripetere su: un asset /assets/*.js (hashato), un'immagine, un font, un video
```

Controlli attesi:
- `alt-svc: h3` o `HTTP/2` → protocollo OK.
- `content-encoding: br|gzip` su HTML/CSS/JS → compressione OK.
- `cache-control: public, max-age=0` su asset hashati/immagini/video → **problema**: nessuna cache browser/edge.
- `cf-cache-status: HIT` su immagini statiche → edge cache attiva.

## Fase 3 — Metriche di riferimento (prima del fix)

```bash
# PSI API (quota giornaliera limitata, può dare 429)
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://esempio.it/&strategy=mobile&category=performance" -o psi.json

# Lighthouse locale (Chrome richiesto; npx non tocca package.json)
npx --yes lighthouse@13 https://esempio.it/ \
  --chrome-flags="--headless=new --no-sandbox --disable-gpu" \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json --output-path=./lh-before.json

# Estrazione metriche chiave
node -e "
const a=require('./lh-before.json').audits;
for(const k of ['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index','total-byte-weight','unused-javascript','image-delivery-insight','modern-image-formats','uses-responsive-images','uses-long-cache-ttl'])
 if(a[k])console.log(k,'=',a[k].displayValue||'', 'score', a[k].score);"
```

Salvare sempre `lh-before.json` e, dopo il fix, `lh-after.json` con lo stesso setup.

## Fase 4 — Conversione in preview (non tocca gli originali)

```bash
mkdir -p .optimization-preview
node - <<'JS'
const sharp = require('sharp'); const fs = require('fs'); const path = require('path');
const SRC = 'public', OUT = '.optimization-preview';
(async () => {
  for (const f of fs.readdirSync(SRC)) {
    if (!/\.(png|jpe?g|jpeg)$/i.test(f)) continue;
    const base = f.replace(/\.[^.]+$/, '');
    const input = path.join(SRC, f);
    const buf = fs.readFileSync(input);
    // Foto → AVIF (q60) + WebP (q78) ; grafica con trasparenza → PNG ottimizzato
    const hasAlpha = (await sharp(input).metadata()).hasAlpha;
    await sharp(input).avif({ quality: 60, effort: 4 }).toFile(path.join(OUT, base + '.avif'));
    await sharp(input).webp({ quality: hasAlpha ? 80 : 78, effort: 5 }).toFile(path.join(OUT, base + '.webp'));
    const out = path.join(OUT, base + '.png');
    await sharp(input).png({ compressionLevel: 9, palette: !hasAlpha, quality: 90 }).toFile(out);
    const sz = p => (fs.existsSync(p) ? fs.statSync(p).size : 0);
    console.log(`${f}: orig ${((sz(input))/1024).toFixed(1)}KB → avif ${(sz(path.join(OUT, base+'.avif'))/1024).toFixed(1)}KB, webp ${(sz(path.join(OUT, base+'.webp'))/1024).toFixed(1)}KB`);
  }
})();
JS
```

Qualità di partenza consigliata: foto AVIF 55–65 / WebP 75–82; PNG con `compressionLevel: 9`
e palette solo se senza alfa e senza gradiente. Mai qualità aggressive senza confronto visivo.

Anteprima visiva (confronto side-by-side):
```bash
# aprire le immagini generate in .optimization-preview/ e confrontarle con public/
# oppure, per differenza numerica (SSIM), se disponibile imagemagick:
compare -metric SSIM public/img.jpg .optimization-preview/img.webp null: 2>&1
```

## Fase 5 — Video (il solito colpevole dei MB)

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,bit_rate -show_entries format=size,duration -of default=noprint_wrappers=1 public/videos/*.mp4
# bitrate sano per un background 720p: 1.5–3 Mbps (CRF 20–24)
ffmpeg -y -i public/videos/clip.mp4 -an -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p \
  -movflags +faststart .optimization-preview/clip.mp4
ffmpeg -y -i public/videos/clip.mp4 -an -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 .optimization-preview/clip.webm
```
Confrontare i due output in anteprima; sostituire l'originale solo dopo approvazione.

## Fase 6 — Controlli di codice tipici

- `srcset`/`sizes` assenti → immagini non responsive: ogni viewport scarica la stessa risoluzione.
- `loading="lazy"` + `fetchpriority="low"` sulle below-the-fold; `eager` + `high` solo su LCP/hero.
- `width`/`height` (o `aspect-ratio`) su ogni `<img>` → altrimenti CLS.
- `<picture>` con AVIF → WebP → JPEG fallback; usare un solo helper centrale, non logiche duplicate.
- `/assets/*` hashati → `Cache-Control: public, max-age=31536000, immutable`; `index.html` → `no-cache`.
- Service worker: verificare che il precache non scarichi PNG/JPEG giganti inutilizzati.
- Font: self-hosted, `font-display: swap`, preload dei soli subset usati.

## Report di batch (formato obbligatorio)

| file | peso orig | peso nuovo | risparmio | formato | qualità | nota visiva |
|---|---|---|---|---|---|---|
| img.jpg | 490.6 KB | 68.6 KB | −86% | AVIF | q60 | nessuna differenza percepibile |

## Checklist di rollback

1. Ripristinare gli originali da backup (`cp .optimization-preview/*.orig public/` o `git checkout -- <file>`).
2. Ripristinare i riferimenti codice (`git diff` → `git checkout -- <file>`).
3. `npm run build` per rigenerare `dist/`.
4. Verificare con `curl -I` che gli URL rispondano 200 e con lo stesso `Content-Type` di prima.
5. Eseguire `npx lighthouse` post-rollback se le metriche sono peggiorate.
6. Mai lasciare metà batch: o il batch è completo e verificato, o si torna allo stato precedente.

## Output atteso di un audit

1. Stato della skill (trovata/mancante/creata).
2. Problemi ordinati per impatto: problema, file/pagina, peso attuale, risparmio stimato, rischio, azione.
3. Piano in batch dal rischio più basso al più alto.
4. Comandi esatti per preview (mai per sovrascrittura diretta).
5. Checklist di rollback.
6. Attesa dell'approvazione prima di applicare.
