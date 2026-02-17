# PhotoVault - Memoria Bank

## Projekt Összefoglaló

Fotókezelő alkalmazás AWS Amplify Gen2 backenddel. Viber bot integrációval tervezett, webes galéria, album kezelés, megosztás.

---

## Tech Stack

| Réteg | Technológia |
|-------|-------------|
| Frontend | Vite 7.3 + React 19 + TypeScript 5.9 |
| Styling | Tailwind CSS v4, Framer Motion |
| Routing | React Router v7 |
| Backend | AWS Amplify Gen2 (CDK alapú) |
| Auth | Cognito User Pool (email) |
| API | AppSync GraphQL |
| DB | DynamoDB (Photo, Album, ShareLink modellek) |
| Storage | S3 (photos/, thumbnails/, public/) |
| Lambda | generateThumbnail (Sharp + Lambda Layer) |
| Hosting | Amplify Hosting (statikus SPA, WEB platform) |
| CI/CD | GitHub push -> Amplify auto-build |

---

## AWS Erőforrások (PROD - deployolva)

| Erőforrás | Azonosító |
|-----------|-----------|
| Amplify App | `d3rzgyt9cnfupy` |
| Region | `eu-central-1` |
| Domain | `d3rzgyt9cnfupy.amplifyapp.com` |
| Branch | `master` (PRODUCTION) |
| GitHub repo | `tliktor/hirado` |
| AppSync endpoint | `https://ie52akydlvffhcvxfykaiqw5ie.appsync-api.eu-central-1.amazonaws.com/graphql` |
| S3 bucket | `amplify-photovault-tibor--photovaultstoragebuckete-n8p4gnctcbya` |
| Cognito User Pool | `eu-central-1_UhHrJPH0W` |
| IAM Service Role | `AmplifyBackendDeployRole` (AdministratorAccess-Amplify) |

---

## Fájlstruktúra (tényleges)

```
hirado/
├── amplify/
│   ├── auth/resource.ts                    # Cognito email auth
│   ├── data/resource.ts                    # GraphQL schema (Photo, Album, ShareLink)
│   ├── storage/resource.ts                 # S3 bucket (photovaultStorage)
│   ├── functions/
│   │   └── generateThumbnail/
│   │       ├── handler.ts                  # S3 trigger -> Sharp resize -> thumbnail
│   │       ├── resource.ts                 # CDK provider pattern (NodejsFunction + Lambda Layer)
│   │       └── package.json
│   ├── layers/                             # .gitignore-ban, CI-ben buildel
│   │   └── sharp/nodejs/                   # Sharp Linux binaries Lambda Layer-hez
│   ├── backend.ts                          # defineBackend + S3 event notification
│   ├── package.json
│   └── tsconfig.json
├── src/
│   ├── pages/
│   │   ├── Gallery.tsx                     # Fő galéria (keresés, szűrés, stats)
│   │   ├── Upload.tsx                      # Drag & drop feltöltés
│   │   ├── Albums.tsx                      # Album lista
│   │   ├── AlbumDetail.tsx                 # Album részletek + share
│   │   └── SharedGallery.tsx               # Publikus megosztott galéria
│   ├── components/
│   │   ├── Header.tsx, Layout.tsx
│   │   ├── PhotoGrid.tsx, PhotoCard.tsx
│   │   ├── Lightbox.tsx                    # Fullscreen viewer + keyboard nav
│   │   ├── UploadZone.tsx
│   │   ├── AlbumCard.tsx, ShareModal.tsx
│   │   └── ThemeToggle.tsx
│   ├── hooks/
│   │   ├── usePhotos.ts                    # Amplify GraphQL CRUD + S3 URL resolve
│   │   ├── useUpload.ts                    # S3 upload + progress
│   │   └── useTheme.ts                     # Dark/light mode
│   ├── types/index.ts
│   ├── data/mockData.ts
│   ├── App.tsx                             # React Router
│   ├── main.tsx
│   └── index.css                           # Tailwind v4 + custom theme (vault purple)
├── amplify.yml                             # CI/CD build config
├── amplify_outputs.json                    # Auto-generált, .gitignore-ban
├── package.json
├── vite.config.ts
├── index.html
└── tsconfig.json / tsconfig.app.json / tsconfig.node.json
```

---

## Amplify Gen2 Backend Részletek

### Data Model (amplify/data/resource.ts)
- **Photo**: s3Key (required), albumId, thumbnailKey, caption, tags[], source (viber|web), width, height, fileSize
- **Album**: name (required), description, coverPhotoId, photoCount
- **ShareLink**: albumId (required), createdBy, expiresAt, viewCount
- Auth: owner + publicApiKey(read)

### Storage (amplify/storage/resource.ts)
- `photos/{entity_id}/*` - owner RWD, guest read
- `thumbnails/{entity_id}/*` - owner RWD, auth+guest read
- `public/*` - guest read, auth RW

### generateThumbnail Lambda
- **CDK provider pattern** (nem sima defineFunction, mert sharp-hoz Lambda Layer kell)
- `NodejsFunction` + `externalModules: ['sharp']` + `LayerVersion`
- `resourceGroupName: 'storage'` - a cirkuláris dep elkerüléséhez
- S3 event trigger: `photos/` prefix -> resize 400px JPEG -> `thumbnails/`

---

## amplify.yml - CI/CD Build Config

```yaml
version: 1
backend:
  phases:
    preBuild:
      commands:
        - nvm install 22
        - npm ci
        - mkdir -p amplify/layers/sharp/nodejs
        - (cd amplify/layers/sharp/nodejs && npm init -y && npm install --platform=linux --arch=x64 sharp@0.33.0)
    build:
      commands:
        - npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID
frontend:
  phases:
    preBuild:
      commands:
        - nvm install 22
        - rm -rf node_modules package-lock.json
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - .npm/**/*
```

### Build trükkök / tanulságok:
1. **Sharp Lambda Layer**: `npm install --platform=linux --arch=x64` cross-compile macOS-ről
2. **Subshell `(cd ...)`**: a `cd` ne változtassa meg a working directory-t az ampx előtt
3. **`rm -rf node_modules package-lock.json`**: a rollup native module (`@rollup/rollup-linux-x64-gnu`) nem települ `npm ci`-vel ha a lockfile macOS-en készült
4. **Node 22 LTS**: a deps (aws-sdk, vite, react-router) mind >=20-t kérnek, Node 22 LTS 2027 áprilisig él
5. **Platform `WEB`** (nem `WEB_COMPUTE`!): statikus Vite SPA, nincs SSR, nincs `deploy-manifest.json`
6. **`npm ci` a backend preBuild-ben**: az `ampx` CLI elérhető legyen a build phase-ben

---

## Ami kész ✅

- Frontend: teljes galéria UI (masonry grid, lightbox, upload, albumok, dark/light theme)
- Backend: Auth (Cognito), Data (AppSync+DynamoDB), Storage (S3), Lambda (thumbnail)
- CI/CD: GitHub -> Amplify auto-build (backend + frontend)
- IAM: AmplifyBackendDeployRole service role
- SPA routing: `public/_redirects` file az Amplify-nak
- Album létrehozás: CreateAlbumModal komponens + működő form
- **Privát app**: Public sharing eltávolítva, csak authenticated access
- **Production deploy**: Build #15 SUCCESS, élesben működik
- **E2E teszt**: Playwright, upload + album creation tesztelve

## Production Status (2026-02-17)

| Funkció | Status | Megjegyzés |
|---------|--------|------------|
| Login/Auth | ✅ OK | Cognito email/password |
| Fotó feltöltés | ✅ OK | S3 + thumbnail generation |
| Album CRUD | ✅ OK | Létrehozás, listázás működik |
| Gallery | ✅ OK | Masonry grid, 8+ fotó tesztelve |
| Private access | ✅ OK | Public sharing disabled |
| SPA routing | ✅ OK | /upload, /albums elérhető |

**⚠️ Ismert apró bug**: Upload UI counter nem frissül ("Feltöltés (0 fotó)"), de funkcionalitás OK

## Ami hiányzik / TODO

- [ ] **Viber bot webhook** (processViberMessage Lambda) - **NEM IMPLEMENTÁLT**
- [ ] Share link - **TÖRÖLVE** (app privát lett, public sharing disabled)
- [ ] Upload counter bug fix (P3 - kozmetikai)
- [ ] CloudFront CDN képekhez (opcionális optimalizáció)
- [ ] PWA support (opcionális)
- [ ] Lightbox keyboard nav tesztelés
- [ ] Search/filter funkcionalitás tesztelése
