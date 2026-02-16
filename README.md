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

### Jelszó
`k1cs1nyfalumban`

### Lokális futtatás

```bash
cd frontend
npm run dev
```

Megnyílik: http://localhost:3000

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

### Következő lépések
- Galéria nézet
- Amplify Hosting deploy
- UI csinosítás

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
