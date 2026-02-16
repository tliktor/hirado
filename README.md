# Hiradó - Fotókezelő Webapp

## Működő rendszer! ✅

### Infrastruktúra (AWS)
- **S3 Bucket**: `hirado-photos-335716056515-eu-central-1`
- **API Gateway**: `https://68cu0kah0h.execute-api.eu-central-1.amazonaws.com/prod/`
- **Lambda funkciók**:
  - `hirado-auth` - Jelszó validálás
  - `hirado-upload` - Presigned URL generálás
  - `hirado-process` - EXIF feldolgozás + fájl rendezés
- **DynamoDB**: `hirado-metadata`
- **GitHub**: `https://github.com/tliktor/hirado`

### Jelszó
`k1cs1nyfalumban`

### Lokális futtatás

```bash
cd frontend
npm run dev
```

Megnyílik: http://localhost:3000

### Tesztelés

```bash
npm test              # Playwright tesztek futtatása
npm run test:headed   # Tesztek böngészővel
npm run test:ui       # Interaktív UI mód
```

**Teszt eredmények:** 4/7 sikeres
- ✅ Login oldal
- ✅ Jelszó validálás
- ✅ Sikeres belépés
- ✅ API endpoint
- ⏱️ Upload tesztek (timeout - Uppy betöltési idő)

### Működés
1. Jelszó megadása
2. Fájlok drag & drop vagy tallózás
3. Feltöltés gombra kattintás
4. Fájlok az S3-ba kerülnek (`uploads/temp/`)
5. Lambda automatikusan feldolgozza:
   - EXIF dátum kiolvasása
   - Ha nincs EXIF, fájlnévből próbálja
   - Átmozgatja: `photos/{év}/{hónap}/{fájlnév}`
   - Metadata mentése DynamoDB-be

### Amplify Hosting
1. AWS Amplify Console: https://console.aws.amazon.com/amplify
2. "New app" → "Host web app"
3. GitHub csatlakoztatás → `tliktor/hirado` repo kiválasztása
4. Build settings automatikusan felismeri az `amplify.yml`-t
5. Environment variables:
   - `NEXT_PUBLIC_API_URL`: `https://68cu0kah0h.execute-api.eu-central-1.amazonaws.com/prod`
   - `NEXT_PUBLIC_PASSWORD`: `k1cs1nyfalumban`
6. Deploy

### Deploy infra újra
```bash
cd infra
npm run deploy
```

### Törlés
```bash
cd infra
npm run destroy
```

