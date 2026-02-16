# 🎯 Profi Prompt – Fotókezelő Webapp Fejlesztéséhez

Az alábbi promptot egy az egyben beillesztheted bármely fejlesztő AI-nak (Claude, GPT-4, Cursor, stb.):

---

## A PROMPT:

```markdown
Te egy senior full-stack developer vagy, aki AWS-ben és modern webes technológiákban jártas. 
Építs nekem egy komplett, production-ready fotó- és videókezelő webappot az alábbi specifikáció alapján.

## PROJEKT ÖSSZEFOGLALÓ
Egy egyszerű, de hatékony fotó/videó feltöltő és rendszerező webapp, ahol a barátaim 
feltölthetik a képeiket és videóikat. A rendszer automatikusan rendezi a fájlokat 
év/hónap mappákba a képek metaadatai vagy fájlnevei alapján. Az egész AWS S3-ra épül.

neve "hirado" törölj minden S3 bucketet "hirado" névvel. Más bkucetet ne bánts.
hazsnáld az "nntech-developer" aws accountotß

## TECHNOLÓGIAI STACK (kötelező)
- **Frontend**: Next.js 14+ (App Router, TypeScript)
- **Feltöltő komponens**: Uppy.js (`@uppy/aws-s3-multipart`) – drag & drop, progress bar, 
  párhuzamos chunk upload támogatással
- **Backend**: AWS Lambda (Node.js 20, serverless)
- **API**: API Gateway (REST) – presigned URL generáláshoz
- **Tárolás**: AWS S3 (presigned URL-ekkel közvetlen kliens→S3 upload)
- **EXIF feldolgozás**: `exifreader` npm csomag (Lambda-ban)
- **Hitelesítés**: Egyszerű megosztott jelszó (environment variable-ből), 
  API Gateway Lambda Authorizer-rel validálva
- **Infrastruktúra**: AWS CDK (TypeScript) VAGY AWS SAM template (YAML)
- **Frontend hosting**: AWS Amplify Hosting VAGY Vercel

## FUNKCIONÁLIS KÖVETELMÉNYEK

### 1. Feltöltés
- A felhasználó a webes felületen kiválaszt egy vagy több fájlt (kép: jpg, png, heic, webp; 
  videó: mp4, mov, avi)
- Maximum fájlméret: 5GB (videókhoz multipart upload kötelező)
- A frontend egy API Gateway endpoint-ot hív, ami Lambda-n keresztül S3 presigned PUT URL-t 
  generál
- A feltöltés KÖZVETLENÜL a kliensből megy az S3-ba (nem a szerveren keresztül!) 
  a `/uploads/temp/` prefix alá
- Uppy.js multipart upload-ot használ 100MB feletti fájloknál
- Jelenjen meg progress bar minden fájlhoz
- Párhuzamosan max 3 fájl töltődjön egyszerre
- S3 Transfer Acceleration legyen bekapcsolva a gyorsabb feltöltéshez

### 2. Automatikus rendezés (Lambda feldolgozó)
- S3 Event Notification triggereli a Lambda-t, amikor új fájl érkezik a `/uploads/temp/`-be
- A Lambda a következő prioritással határozza meg a fájl készítésének dátumát:
  1. **EXIF metaadat**: `DateTimeOriginal` vagy `CreateDate` mező (képeknél)
  2. **Fájlnév minta**: regex-szel keres dátumot a fájlnévben 
     (pl. `IMG_20240315_143000.jpg`, `2024-03-15_photo.jpg`, `VID_20240315.mp4`)
  3. **Fallback**: a feltöltés aktuális dátuma
- Videóknál: fájlnév alapú dátum kinyerés (EXIF nem releváns)
- A Lambda a fájlt átmásolja a végleges helyére: `photos/{year}/{month}/{eredeti_fájlnév}`
  Példa: `photos/2024/03/IMG_20240315_143000.jpg`
- Az eredeti fájlt törli a `/uploads/temp/`-ből
- Ha a célfájl már létezik (azonos név), fűzzön hozzá egy UUID suffixet

### 3. Galéria nézet (egyszerű)
- Egy oldal, ahol év/hónap bontásban listázza a feltöltött fájlokat
- S3 ListObjects-szel kérdezi le a tartalmakat
- Thumbnail-ek megjelenítése (opcionálisan S3 presigned GET URL-ekkel)
- Kattintásra teljes méretű kép/videó megnyitása

### 4. Hitelesítés
- Egyszerű jelszavas védelem: egy közös jelszó, amit environment variable-ben tárolunk
- A felhasználó a főoldalon megadja a jelszót
- A jelszó egy API Gateway Lambda Authorizer-en megy keresztül
- Sikeres auth után a session localStorage-ban tárolódik (egyszerű token/flag)

## S3 BUCKET KONFIGURÁCIÓ
- Bucket neve: konfigurálható (env var)
- CORS beállítás: engedélyezze a PUT és GET kéréseket a frontend domain-ről
- Lifecycle rule: `/uploads/temp/` mappában 24 óra után törölje a fájlokat 
  (ha a Lambda nem dolgozta volna fel)
- S3 Transfer Acceleration: bekapcsolva
- Versioning: kikapcsolva (nem kell)
- Storage class: S3 Intelligent-Tiering (automatikus költségoptimalizálás)

## PROJEKT STRUKTÚRA
```
photo-app/
├── frontend/                       # Next.js 14 app
│   ├── app/
│   │   ├── layout.tsx              # Alap layout
│   │   ├── page.tsx                # Főoldal – jelszó bekérés + feltöltő
│   │   ├── gallery/
│   │   │   └── page.tsx            # Galéria nézet
│   │   └── api/                    # Next.js API routes (ha kell proxy)
│   ├── components/
│   │   ├── LoginForm.tsx           # Jelszó bekérő
│   │   ├── Uploader.tsx            # Uppy.js feltöltő komponens
│   │   ├── Gallery.tsx             # Galéria grid
│   │   └── YearMonthNav.tsx        # Év/hónap navigáció
│   ├── lib/
│   │   ├── s3.ts                   # S3 client config
│   │   └── auth.ts                 # Auth helper
│   ├── .env.local.example          # Environment változók minta
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── package.json
├── lambda/
│   ├── processUpload/              # S3 trigger – EXIF feldolgozó & rendező
│   │   ├── index.ts
│   │   └── package.json
│   ├── generatePresignedUrl/       # Presigned URL generáló
│   │   ├── index.ts
│   │   └── package.json
│   └── authorizer/                 # Jelszó validáló Lambda Authorizer
│       ├── index.ts
│       └── package.json
├── infra/
│   ├── lib/
│   │   └── photo-app-stack.ts      # AWS CDK stack (VAGY sam template.yaml)
│   ├── bin/
│   │   └── photo-app.ts
│   └── cdk.json
├── README.md                       # Telepítési és használati útmutató
└── .gitignore
```

## KÓDOLÁSI ELVÁRÁSOK
- TypeScript mindenhol (frontend + Lambda)
- Tiszta, kommentezett kód
- Error handling minden async műveletnél
- Environment változók használata minden konfigurálható értékhez
- A README.md tartalmazza:
  - Előfeltételek (Node.js, AWS CLI, CDK CLI)
  - Telepítési lépések (1-2-3)
  - Environment változók listája
  - Deployment parancsok

## KIMENET
Kérlek, add meg az ÖSSZES fájl TELJES tartalmát, fájlonként, a fenti struktúra szerint.
Kezdd az infrastruktúra kóddal (CDK/SAM), majd a Lambda funkciókkal, végül a frontend-del.
Minden fájlnál jelöld a fájl elérési útját kommentben.

## FONTOS MEGKÖTÉSEK
- NE használj Amplify SDK-t a backend-hez (csak hosting-hoz opcionálisan)
- A feltöltés MINDIG presigned URL-en keresztül, közvetlenül S3-ba menjen
- A Lambda-k MINDIG serverless-ek legyenek (ne EC2, ne ECS)
- A frontend legyen reszponzív (mobil-barát) – Tailwind CSS-sel
- Magyar nyelvű UI feliratok
```

---

## 📝 Használati tippek

| Tipp | Részlet |
|---|---|
| **Hova illeszd be?** | Claude.ai, ChatGPT (GPT-4), Cursor IDE, Windsurf, Bolt.new |
| **Ha túl hosszú a válasz** | Kérd részletekben: *"Először csak az infra kódot és a Lambda-kat add meg"* |
| **Ha módosítani akarod** | Cseréld ki a jelszavas auth-ot Cognito-ra, vagy add hozzá a Rekognition-t |
| **Iteráláshoz** | *"A Gallery komponensben adj hozzá lazy loading-ot és lightbox-ot"* |

> **Pro tipp**: Ha Cursor IDE-t vagy Windsurf-öt használsz, a promptot tedd a projekt gyökerébe egy `INSTRUCTIONS.md` fájlba – így az AI kontextusként mindig látja a specifikációt.