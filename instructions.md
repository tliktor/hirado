

# 🎨 Lenyűgöző Fotókezelő App – Teljes Terv

## A koncepció

Egy **gyönyörű, modern fotókezelő alkalmazás**, ahova Viber-en keresztül is tudsz fotókat küldeni, és egy elegáns webes galériában böngészni/megosztani őket. A barátaid le fognak esni a székükről! 😎

---

## 🏗️ Architektúra Áttekintés

```
┌─────────────────────────────────────────────────────────────────┐
│                        FELHASZNÁLÓK                              │
│                                                                  │
│   📱 Viber Bot              🌐 Web Galéria           🔗 Share   │
│   (fotó küldés)            (böngészés)              (link)      │
└──────┬──────────────────────────┬────────────────────────┬──────┘
       │                          │                        │
       ▼                          ▼                        ▼
┌──────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (REST)                          │
│   /viber-webhook    /photos    /albums    /share/{id}            │
└──────┬──────────────────────────┬────────────────────────────────┘
       │                          │
       ▼                          ▼
┌──────────────────┐   ┌──────────────────────────────────────────┐
│ Lambda:           │   │ Lambda Functions:                        │
│ processViber      │   │  • getPhotos (listázás, szűrés)         │
│ Message           │   │  • processUpload (webes feltöltés)      │
│                   │   │  • generateThumbnail (S3 trigger)       │
│ - letölti a fotót │   │  • createShareLink (megosztás)          │
│ - menti S3-ba     │   │  • getSharedAlbum (publikus galéria)    │
│ - ír DynamoDB-be  │   └──────────────────────────────────────────┘
│ - visszajelez     │              │
└──────┬────────────┘              │
       │                           │
       ▼                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                         ADATRÉTEG                                │
│                                                                  │
│   🪣 S3 Bucket                    📊 DynamoDB                   │
│   ├── photos/                     ├── Photos tábla              │
│   │   └── {userId}/{photoId}.jpg  │   (id, userId, url,         │
│   ├── thumbnails/                 │    caption, tags,            │
│   │   └── {userId}/{photoId}.jpg  │    createdAt, albumId)      │
│   └── public/                     ├── Albums tábla              │
│       └── share/{shareId}/        │   (id, name, coverPhoto)    │
│                                   └── ShareLinks tábla          │
│                                       (id, albumId, expiresAt)  │
│                                                                  │
│   🖼️ CloudFront CDN (gyors képbetöltés, HTTPS)                 │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📱 Viber Bot Flow

```
┌──────────┐    fotó     ┌──────────┐   webhook   ┌───────────┐
│  Viber   │ ──────────► │  Viber   │ ──────────► │    API    │
│  User    │             │  Server  │             │  Gateway  │
└──────────┘             └──────────┘             └─────┬─────┘
                                                        │
                                                        ▼
                                                  ┌───────────┐
                                                  │  Lambda    │
                                                  │  process   │
                                                  │  Viber     │
                                                  └──┬──┬──┬──┘
                                                     │  │  │
                              ┌───────────────────────┘  │  └──────────────┐
                              ▼                          ▼                 ▼
                         ┌─────────┐            ┌──────────────┐   ┌──────────┐
                         │   S3    │            │   DynamoDB   │   │  Viber   │
                         │  fotó   │            │   metaadat   │   │  válasz: │
                         │ mentés  │            │    mentés    │   │  "✅ Kész!│
                         └─────────┘            └──────────────┘   │  Galéria:│
                                                                   │  [link]" │
                                                                   └──────────┘
```

---

## 🌐 Frontend – A "WOW" faktor

### Fő oldalak:

| Oldal | Leírás | Lenyűgöző elem |
|-------|--------|-----------------|
| **Galéria** | Masonry grid layout | Smooth animációk, lazy loading, lightbox |
| **Album nézet** | Fotók csoportosítva | Drag & drop rendezés, cover photo választás |
| **Feltöltés** | Drag & drop zóna | Előnézet, progress bar, többszörös feltöltés |
| **Megosztás** | Publikus galéria link | Gyönyörű, jelszó nélküli galéria oldal |
| **Viber QR** | Bot hozzáadás | QR kód a Viber bot-hoz |

### Design koncepció:

```
┌─────────────────────────────────────────────────────────┐
│  🌙/☀️   📸 PhotoVault          [Upload] [Albums] [⚙️]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────┐ ┌──────────────┐ ┌─────────┐              │
│  │         │ │              │ │         │              │
│  │  fotó1  │ │    fotó2     │ │  fotó3  │              │
│  │         │ │   (nagy)     │ │         │              │
│  └─────────┘ │              │ └─────────┘              │
│  ┌──────────┐│              │ ┌──────────────────┐     │
│  │          │└──────────────┘ │                  │     │
│  │  fotó4   │ ┌─────────┐    │     fotó6         │     │
│  │          │ │  fotó5  │    │    (széles)       │     │
│  └──────────┘ │         │    │                  │     │
│               └─────────┘    └──────────────────┘     │
│                                                         │
│  ──── Viber-ről érkezett (ma) ────                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                  │
│  │ 📱 v1   │ │ 📱 v2   │ │ 📱 v3   │                  │
│  └─────────┘ └─────────┘ └─────────┘                  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Made with ❤️ │ Viber Bot: [QR]  │ Share Album [🔗]    │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Projekt Fájlstruktúra

```
photovault/
├── amplify/
│   ├── auth/
│   │   └── resource.ts              # Cognito auth (opcionális)
│   ├── data/
│   │   └── resource.ts              # DynamoDB táblák
│   ├── storage/
│   │   └── resource.ts              # S3 bucket konfig
│   ├── functions/
│   │   ├── processViberMessage/
│   │   │   ├── handler.ts           # Viber webhook feldolgozó
│   │   │   └── resource.ts
│   │   ├── getPhotos/
│   │   │   ├── handler.ts           # Fotók listázása
│   │   │   └── resource.ts
│   │   ├── processUpload/
│   │   │   ├── handler.ts           # Webes feltöltés kezelő
│   │   │   └── resource.ts
│   │   ├── generateThumbnail/
│   │   │   ├── handler.ts           # Automatikus thumbnail generálás
│   │   │   └── resource.ts
│   │   └── createShareLink/
│   │       ├── handler.ts           # Megosztó link generálás
│   │       └── resource.ts
│   └── backend.ts                   # Fő backend konfiguráció
│
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Fő layout (dark/light theme)
│   │   ├── page.tsx                 # Galéria főoldal
│   │   ├── upload/
│   │   │   └── page.tsx             # Feltöltő oldal
│   │   ├── albums/
│   │   │   ├── page.tsx             # Album lista
│   │   │   └── [id]/
│   │   │       └── page.tsx         # Egy album nézete
│   │   └── share/
│   │       └── [id]/
│   │           └── page.tsx         # Publikus megosztott galéria
│   │
│   ├── components/
│   │   ├── PhotoGrid.tsx            # Masonry grid galéria
│   │   ├── PhotoCard.tsx            # Egy fotó kártya (hover effekt)
│   │   ├── Lightbox.tsx             # Teljes képernyős fotó nézet
│   │   ├── UploadZone.tsx           # Drag & drop feltöltő
│   │   ├── AlbumCard.tsx            # Album kártya
│   │   ├── ShareModal.tsx           # Megosztás modal
│   │   ├── ViberQR.tsx              # Viber bot QR kód
│   │   ├── ThemeToggle.tsx          # Sötét/világos váltó
│   │   └── Header.tsx               # Navigáció
│   │
│   ├── hooks/
│   │   ├── usePhotos.ts             # Fotók lekérése
│   │   └── useUpload.ts             # Feltöltés kezelése
│   │
│   └── styles/
│       └── globals.css              # Tailwind + egyedi stílusok
│
├── public/
│   └── icons/                       # PWA ikonok
│
├── amplify.yml                      # Amplify build konfig
├── package.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

---

## 🗄️ DynamoDB Adatmodell

### Photos tábla
```
{
  "id": "photo_abc123",              // Partition Key
  "userId": "user_xyz",              // GSI - felhasználónként lekérdezés
  "albumId": "album_default",        // GSI - albumnként lekérdezés
  "s3Key": "photos/user_xyz/photo_abc123.jpg",
  "thumbnailKey": "thumbnails/user_xyz/photo_abc123.jpg",
  "originalFilename": "IMG_2024.jpg",
  "caption": "Nyári buli 🎉",
  "tags": ["nyár", "buli", "barátok"],
  "source": "viber",                 // "viber" | "web"
  "width": 1920,
  "height": 1080,
  "fileSize": 2456789,
  "createdAt": "2025-07-14T10:30:00Z",
  "sortKey": "2025-07-14T10:30:00Z"  // Sort Key (időrend)
}
```

### Albums tábla
```
{
  "id": "album_summer2025",
  "userId": "user_xyz",
  "name": "Nyár 2025 🌞",
  "description": "A legjobb nyári pillanatok",
  "coverPhotoId": "photo_abc123",
  "photoCount": 42,
  "createdAt": "2025-07-01T00:00:00Z"
}
```

### ShareLinks tábla
```
{
  "id": "share_k8f2m",               // Rövid, megosztható ID
  "albumId": "album_summer2025",
  "createdBy": "user_xyz",
  "expiresAt": "2025-08-14T00:00:00Z",  // Opcionális lejárat
  "password": null,                      // Opcionális jelszó
  "viewCount": 0,
  "createdAt": "2025-07-14T10:30:00Z"
}
```

---

## 🎨 "WOW" Funkciók – Amitől le fognak esni a barátaid

### 1. **Masonry Grid + Smooth Animációk**
- Fotók különböző méretben, Pinterest-szerű elrendezés
- Framer Motion animációk betöltéskor
- Hover-re enyhe zoom + caption megjelenés

### 2. **Viber Bot Integráció**
- Küldj fotót a botnak → azonnal megjelenik a galériában
- A bot visszaküld egy linket a galériához
- "Melyik albumba tegyem?" – interaktív gombok

### 3. **Instant Megosztás**
- Egy kattintás → megosztható link generálás
- Gyönyörű publikus galéria oldal (nem kell bejelentkezés)
- QR kód generálás a linkhez

### 4. **Sötét/Világos Téma**
- Elegáns dark mode (alapértelmezett)
- Smooth átmenet a két téma között

### 5. **Drag & Drop Upload**
- Húzd rá a fotókat → azonnali előnézet
- Progress bar animáció
- Többszörös feltöltés egyszerre

### 6. **CloudFront CDN**
- Villámgyors képbetöltés bárhonnan a világon
- Automatikus thumbnail generálás

---

## 🚀 Deploy Pipeline

```
GitHub Push → Amplify Auto-Build → Live Site
    │
    ├── Frontend: Next.js build → Amplify Hosting
    ├── Backend: Lambda deploy
    ├── Storage: S3 bucket
    └── Database: DynamoDB táblák
```

---

## 📋 Claude CLI-nek adandó prompt

Amikor feltelepítetted a Claude CLI-t, ezt a promptot add neki:

```
Hozz létre egy "PhotoVault" nevű fotókezelő webalkalmaz