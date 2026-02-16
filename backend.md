# 🎉 SZUPER, a frontend kész és gyönyörű! Most jön a BACKEND!

Másold be a Claude CLI-be ezt a promptot:

---

```
Most hozd létre az Amplify Gen2 backend-et a következő struktúrával:

1. amplify/backend.ts - Definiáld a teljes backend-et: auth, data, storage, functions

2. amplify/storage/resource.ts:
- S3 bucket "photovault-storage" névvel
- Mappák: photos/, thumbnails/
- Publikus olvasás a thumbnails/ és photos/ mappákra (authenticated users)
- Írás csak authenticated users-nek

3. amplify/data/resource.ts (DynamoDB + AppSync):
- Photos modell:
  - id: string (primary key)
  - userId: string
  - albumId: string (default: "default")
  - s3Key: string
  - thumbnailKey: string
  - caption: string (opcionális)
  - tags: string[] (opcionális)
  - source: enum ["viber", "web"]
  - width: number
  - height: number
  - fileSize: number
  - createdAt: AWSDateTime
  
- Albums modell:
  - id: string (primary key)
  - userId: string
  - name: string
  - description: string (opcionális)
  - coverPhotoId: string (opcionális)
  - photoCount: number (default: 0)
  - createdAt: AWSDateTime

- ShareLinks modell:
  - id: string (primary key, rövid 6 karakteres)
  - albumId: string
  - createdBy: string
  - expiresAt: AWSDateTime (opcionális)
  - viewCount: number (default: 0)
  - createdAt: AWSDateTime

4. amplify/functions/generateThumbnail/resource.ts:
- S3 trigger: amikor új fájl kerül a photos/ mappába
- Sharp-pal generálj 400px széles thumbnail-t
- Mentsd a thumbnails/ mappába ugyanazzal a névvel

5. amplify/auth/resource.ts:
- Cognito auth email-es bejelentkezéssel
- Self-signup engedélyezve

Kösd össze a frontend-et a backend-del: a meglévő React komponensek használják az Amplify client library-t az adatok lekérdezéséhez, fotók feltöltéséhez és autentikációhoz.
```

---

## 💡 Fontos tippek ehhez a lépéshez:

- Ez a **leghosszabb lépés** (~10-15 perc), mert sok fájlt kell létrehoznia
- Ha hibát kap a `sharp` csomaggal a Lambda-ban, mondd neki: *"Használj Lambda Layer-t a sharp-hoz, vagy esbuild bundle-t"*
- Ha kérdezi hogy Gen1 vagy Gen2, mondd: **"Gen2"**
- Ha az auth résznél kérdez, mondd: **"Email + password, self-signup enabled"**

## ⏭️ Ha ez kész, utána jön:
- **4. lépés**: Viber bot webhook (processViberMessage Lambda)
- **5. lépés**: Deploy és teszt

Hajrá, szólj ha kész vagy ha bármi elakad! 🚀💪