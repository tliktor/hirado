# Hiradó Project - Memory Bank

## Projekt állapot: 2026-02-16

### ✅ Elkészült komponensek

#### AWS Infrastruktúra (CDK)
- **Lokáció**: `/infra`
- **Stack név**: `HiradoStack`
- **Régió**: `eu-central-1`
- **Account**: `335716056515`
- **Erőforrások**:
  - S3 Bucket: `hirado-photos-335716056515-eu-central-1`
    - CORS engedélyezve
    - Lifecycle rule: `uploads/temp/` 24 óra után törlődik
  - API Gateway: `https://68cu0kah0h.execute-api.eu-central-1.amazonaws.com/prod/`
    - `/upload` endpoint (POST)
    - Lambda Authorizer (jelszó: `k1cs1nyfalumban`)
  - Lambda funkciók:
    - `hirado-auth`: Jelszó validálás (Node.js 22)
    - `hirado-upload`: Presigned URL generálás (Node.js 22)
    - `hirado-process`: EXIF feldolgozás + fájl rendezés (Node.js 22, 1024MB)
  - DynamoDB: `hirado-metadata` (PAY_PER_REQUEST)
  - IAM Role: `lambda-execution-role` (S3 + DynamoDB jogok)

**Deploy parancs**: `cd infra && npm run deploy`
**Törlés**: `cd infra && npm run destroy`

#### Lambda funkciók
- **Lokáció**: `/lambda/auth`, `/lambda/upload`, `/lambda/process`
- **Függőségek telepítve**: `npm install` minden mappában
- **Működés**:
  - `auth`: Egyszerű jelszó ellenőrzés (Authorization header)
  - `upload`: S3 presigned PUT URL generálás (`uploads/temp/` prefix)
  - `process`: 
    - S3 trigger (`uploads/temp/` prefix)
    - EXIF dátum kiolvasás (exifreader csomag)
    - Fájlnév alapú dátum parsing (fallback)
    - Fájl másolás: `photos/{év}/{hónap}/{fájlnév}`
    - Temp fájl törlése
    - Metadata mentés DynamoDB-be

#### Frontend (Next.js 14)
- **Lokáció**: `/frontend`
- **Technológia**: Next.js 14 App Router, TypeScript, Uppy.js
- **Komponensek**:
  - `app/layout.tsx`: Root layout
  - `app/page.tsx`: Login + Uppy feltöltő
- **Uppy konfiguráció**:
  - AWS S3 plugin (presigned URL)
  - Dashboard komponens
  - Max fájlméret: 5GB
  - Engedélyezett típusok: image/*, video/*
- **Environment változók** (`.env.local`):
  - `NEXT_PUBLIC_API_URL`: API Gateway URL
  - `NEXT_PUBLIC_PASSWORD`: `k1cs1nyfalumban`
- **Futtatás**: `cd frontend && npm run dev` (http://localhost:3000)

#### GitHub
- **Repo**: `https://github.com/tliktor/hirado`
- **Branch**: `main`
- **Fájlok**:
  - `amplify.yml`: Amplify build spec
  - `README.md`: Dokumentáció
  - `playwright.config.ts`: Teszt konfiguráció
  - `/tests/upload.spec.ts`: Playwright tesztek
  - `/images`: 200+ teszt kép

#### Tesztek (Playwright)
- **Lokáció**: `/tests/upload.spec.ts`
- **Eredmények**: 4/7 sikeres
  - ✅ Login oldal megjelenítése
  - ✅ Hibás jelszó elutasítása
  - ✅ Helyes jelszóval belépés
  - ✅ API endpoint működik
  - ⏱️ Single image upload (timeout - Uppy betöltés)
  - ⏱️ Multiple images upload (timeout)
  - ⏱️ Stress test 20 kép (timeout)
- **Futtatás**: `npm test` (projekt root)

---

## 🚧 Következő lépések

### 1. Amplify Hosting Setup (PRIORITÁS)
**Miért**: Frontend production deploy hiányzik

**Lépések**:
1. AWS Amplify Console: https://console.aws.amazon.com/amplify
2. "New app" → "Host web app" → GitHub
3. Repo: `tliktor/hirado`, branch: `main`
4. Build settings: automatikusan felismeri `amplify.yml`
5. **Environment variables hozzáadása**:
   - `NEXT_PUBLIC_API_URL` = `https://68cu0kah0h.execute-api.eu-central-1.amazonaws.com/prod`
   - `NEXT_PUBLIC_PASSWORD` = `k1cs1nyfalumban`
6. Deploy

**Alternatíva**: CLI-vel (ha GitHub token van):
```bash
aws amplify create-app --name hirado --repository https://github.com/tliktor/hirado
```

### 2. Galéria nézet (KÖVETKEZŐ FEATURE)
**Miért**: Jelenleg csak feltöltés van, nincs megtekintés

**Feladatok**:
- Új oldal: `frontend/app/gallery/page.tsx`
- S3 ListObjects API hívás (év/hónap szerint)
- Thumbnail megjelenítés (presigned GET URL)
- Év/hónap navigáció
- Lightbox teljes méretű képhez

**Lambda szükséges**: `hirado-list` (S3 ListObjects + presigned GET URL-ek)

### 3. Playwright teszt javítás (OPCIONÁLIS)
**Probléma**: Upload tesztek timeout-olnak (Uppy Dashboard betöltés)

**Megoldás**:
- Növelni a timeout-ot: `test.setTimeout(60000)`
- Várni a Dashboard betöltésére: `await page.waitForLoadState('networkidle')`
- Vagy: Mock Uppy komponens tesztekhez

### 4. UI csinosítás (KÉSŐBB)
- Tailwind CSS használata
- Responsive design javítása
- Progress bar stílusozás
- Error handling UI
- Success üzenetek

### 5. Biztonsági fejlesztések (PRODUCTION ELŐTT)
- Jelszó titkosítása (jelenleg plaintext)
- JWT token használata (session helyett)
- Rate limiting API Gateway-en
- CORS szigorítása (konkrét domain)

---

## 📝 Fontos információk

### Jelszó
`k1cs1nyfalumban`

### AWS Profil
`nntech-developer`

### Fájl struktúra
```
hirado/
├── infra/              # AWS CDK
├── lambda/             # Lambda funkciók
│   ├── auth/
│   ├── upload/
│   └── process/
├── frontend/           # Next.js app
├── tests/              # Playwright tesztek
├── images/             # Teszt képek (200+)
├── amplify.yml         # Amplify build spec
├── playwright.config.ts
└── README.md
```

### Parancsok gyorsreferencia
```bash
# Infra deploy
cd infra && npm run deploy

# Frontend dev
cd frontend && npm run dev

# Tesztek
npm test

# Lambda függőségek
cd lambda/upload && npm install
cd lambda/process && npm install

# Git push
git add -A && git commit -m "message" && git push
```

---

## 🐛 Ismert problémák

1. **Uppy Dashboard timeout tesztekben**: Client-side komponens, lassú betöltés
2. **Next.js lockfile warning**: Több package-lock.json a projektben (nem kritikus)
3. **Amplify manual setup**: GitHub token hiánya miatt CLI-vel nem megy

---

## 💡 Tippek új AI-nak

- AWS profil: `--profile nntech-developer --region eu-central-1`
- Frontend port: 3000 (ha foglalt, Next.js automatikusan 3001-re vált)
- Lambda kód módosítás után: `cd infra && npm run deploy` (újra deploy)
- S3 bucket neve mindig tartalmazza az account ID-t és régiót
- DynamoDB tábla neve: `hirado-metadata` (partition key: `id`)

---

**Utolsó frissítés**: 2026-02-16 16:16
**Státusz**: ✅ Működő rendszer, Amplify hosting hiányzik
