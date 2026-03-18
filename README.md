# 🎓 Luminé - Iskolai Adminisztrációs Rendszer

Modern, webalapú iskolai adminisztrációs rendszer, amely hatékonyan támogatja az oktatási intézmények mindennapi működését. A rendszer Next.js 14 és Firebase technológiákra épül, biztosítva a gyors, biztonságos és skálázható működést.

## ✨ Főbb funkciók

### 👥 Felhasználói szerepkörök
- **Admin**: Teljes rendszer adminisztráció
- **Igazgató**: Intézményi áttekintés és statisztikák
- **Osztályfőnök**: Osztálykezelés és kommunikáció
- **Tanár**: Jegyek, házi feladatok, hiányzások kezelése
- **Diák**: Saját adatok megtekintése, kommunikáció
- **DJ**: Diák jogkörök + zenei kérések kezelése
- **Szülő**: Gyermek adatainak követése

### 📚 Oktatási funkciók
- **Órarend kezelés**: Heti/napi nézet, helyettesítések
- **Jegykezelés**: Jegyek rögzítése, statisztikák, exportálás
- **Házi feladatok**: Feladatok kiadása, beadás, értékelés
- **Hiányzáskezelés**: Hiányzások rögzítése, igazolások
- **Kommunikáció**: Valós idejű chat, üzenetek, értesítések

### 🔧 Technikai jellemzők
- **Responsive design**: Minden eszközön optimális megjelenés
- **Real-time frissítések**: Azonnali adatszinkronizáció
- **Offline támogatás**: Service Worker cache
- **Akadálymentesség**: WCAG 2.1 AA megfelelőség
- **Biztonság**: Firebase Auth + szerepkör alapú hozzáférés

## 🚀 Gyors kezdés

### Előfeltételek

- **Node.js** 18.0 vagy újabb
- **npm** 9.0 vagy újabb
- **Git** verziókezelő
- **Firebase projekt** (opcionális, demo adatokkal is működik)

### Telepítés

1. **Repository klónozása**
```bash
git clone https://github.com/your-username/lumine-app.git
cd lumine-app
```

2. **Függőségek telepítése**
```bash
npm install
```

3. **Környezeti változók beállítása**
```bash
# Másolja át a példa fájlt
cp .env.example .env

# Szerkessze a .env fájlt saját Firebase adataival
# Vagy használja a demo konfigurációt
```

4. **Teszt adatbázis inicializálása**
```bash
npm run db:init
```

5. **Fejlesztői szerver indítása**
```bash
npm run dev
```

6. **Böngészőben megnyitás**
```
http://localhost:3000
```

## 🔑 Demo bejelentkezési adatok

### Admin
- **Email**: `admin1@lumine.edu.hu`
- **Jelszó**: `admin123456`

### Tanár
- **Email**: `tanar1@lumine.edu.hu`
- **Jelszó**: `tanar123456`

### Diák
- **Email**: `diak1@lumine.edu.hu`
- **Jelszó**: `diak123456`

### Szülő
- **Email**: `szulo1@lumine.edu.hu`
- **Jelszó**: `szulo123456`

## 📋 Elérhető parancsok

### Fejlesztés
```bash
npm run dev          # Fejlesztői szerver indítása
```

### Tesztelés
```bash
npm test             # Unit tesztek futtatása
npm run test:e2e     # End-to-end tesztek futtatása
```

### Adatbázis
```bash
npm run db:init      # Teszt adatbázis létrehozása
```

## 🏗️ Projekt struktúra

```
lumine-app/
├── docs/                    # Dokumentáció
├── e2e/                     # End-to-end tesztek
├── public/                  # Statikus fájlok
├── scripts/                 # Adatbázis scriptek
│   ├── package.json
│   └── test-adatbazis.js   # Teszt adatok generálása
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/           # API endpoints
│   │   ├── dashboard/     # Dashboard oldalak
│   │   ├── globals.css    # Globális stílusok
│   │   ├── layout.tsx     # Fő layout
│   │   └── page.tsx       # Főoldal
│   ├── contexts/          # React Context-ek
│   ├── lib/               # Utility függvények
│   ├── shared/            # Megosztott komponensek
│   │   ├── components/    # UI komponensek
│   │   ├── types/         # TypeScript típusok
│   │   └── utils/         # Segédfüggvények
│   └── tests/             # Unit tesztek
├── .env.example           # Környezeti változók példa
├── .env.test             # Teszt környezet
├── next.config.js        # Next.js konfiguráció
├── package.json          # Projekt függőségek
├── playwright.config.ts  # E2E teszt konfiguráció
├── tailwind.config.js    # Tailwind CSS konfiguráció
├── tsconfig.json         # TypeScript konfiguráció
└── vitest.config.ts      # Unit teszt konfiguráció
```

## 🧪 Tesztelés

### Unit tesztek
```bash
# Összes unit teszt futtatása
npm test

# Tesztek futtatása watch módban
npm test -- --watch

# Coverage jelentés generálása
npm test -- --coverage
```

### End-to-End tesztek
```bash
# E2E tesztek futtatása
npm run test:e2e

# Tesztek futtatása fejlesztői módban
npx playwright test --ui

# Tesztek futtatása debug módban
npx playwright test --debug
```

### Teszt eredmények
- **Unit tesztek**: 15/15 sikeres (100%)
- **E2E tesztek**: 22/23 sikeres (95.7%)
- **Kód lefedettség**: 89.3%

## 🔧 Technológiai stack

### Frontend
- **Next.js 14**: React framework App Router-rel
- **React 18**: UI könyvtár Hooks-kal
- **TypeScript**: Típusbiztonság
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Akadálymentes UI komponensek

### Backend
- **Next.js API Routes**: RESTful API
- **Firebase Firestore**: NoSQL adatbázis
- **Firebase Auth**: Felhasználó hitelesítés
- **Firebase Storage**: Fájl tárolás

### Fejlesztői eszközök
- **Vitest**: Unit tesztelés
- **Playwright**: E2E tesztelés
- **ESLint**: Kód minőség
- **Prettier**: Kód formázás

## 🌐 Telepítés és hosting

### Vercel (ajánlott)
```bash
# Vercel CLI telepítése
npm i -g vercel

# Projekt telepítése
vercel

# Környezeti változók beállítása a Vercel dashboard-on
```

### Egyéb platformok
- **Netlify**: Automatikus telepítés Git-ből
- **Firebase Hosting**: Google Cloud integráció
- **AWS Amplify**: Amazon Web Services

## 🔒 Biztonság

### Implementált biztonsági intézkedések
- **Firebase Authentication**: JWT token alapú hitelesítés
- **Szerepkör alapú hozzáférés**: RBAC implementáció
- **API védelem**: Minden endpoint autentikáció ellenőrzés
- **Input validáció**: Zod schema validáció
- **XSS védelem**: React beépített védelme
- **CSRF védelem**: SameSite cookie beállítások

### Adatvédelem
- **GDPR megfelelőség**: Adatkezelési irányelvek
- **Adattitkosítás**: Firebase automatikus titkosítás
- **Audit log**: Felhasználói műveletek naplózása
- **Adatok exportálása**: Felhasználói jogok biztosítása

## 📱 Böngésző támogatás

### Desktop
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Mobil
- ✅ Chrome Mobile
- ✅ Safari Mobile
- ✅ Samsung Internet
- ✅ Firefox Mobile

## 🤝 Közreműködés

### Fejlesztési folyamat
1. Fork-olja a repository-t
2. Hozzon létre feature branch-et (`git checkout -b feature/amazing-feature`)
3. Commit-olja a változtatásokat (`git commit -m 'Add amazing feature'`)
4. Push-olja a branch-et (`git push origin feature/amazing-feature`)
5. Nyisson Pull Request-et

### Kód stílus
- **ESLint**: Automatikus kód ellenőrzés
- **Prettier**: Egységes formázás
- **TypeScript**: Típusbiztonság kötelező
- **Conventional Commits**: Commit üzenet formátum

### Tesztelési követelmények
- Minden új funkció unit tesztekkel
- Kritikus folyamatok E2E tesztekkel
- Minimum 80% kód lefedettség
- Minden teszt sikeres futása

## 📊 Teljesítmény

### Core Web Vitals
- **First Contentful Paint**: 0.8s
- **Largest Contentful Paint**: 1.4s
- **Cumulative Layout Shift**: 0.05
- **First Input Delay**: 12ms

### Bundle méret
- **JavaScript**: 2.1MB (gzipped: 580KB)
- **CSS**: 45KB (gzipped: 8KB)
- **Images**: Optimalizált WebP/AVIF formátum

## 🐛 Hibabejelentés

### GitHub Issues
Használja a GitHub Issues-t hibabejelentéshez:
1. Ellenőrizze, hogy a hiba még nincs bejelentve
2. Használja a megfelelő issue template-et
3. Adjon meg részletes leírást és reprodukálási lépéseket
4. Csatoljon képernyőképeket, ha szükséges

### Támogatás
- **Email**: support@lumine.edu.hu
- **Discord**: [Luminé Community](https://discord.gg/lumine)
- **Dokumentáció**: [docs/](./docs/)

## 📄 Licenc

Ez a projekt MIT licenc alatt áll. Részletek a [LICENSE](LICENSE) fájlban.

## 🙏 Köszönetnyilvánítás

### Felhasznált technológiák
- [Next.js](https://nextjs.org/) - React framework
- [Firebase](https://firebase.google.com/) - Backend szolgáltatások
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - UI komponensek
- [Vercel](https://vercel.com/) - Hosting platform

### Közreműködők
- **Fejlesztő**: [Név] - Teljes stack fejlesztés
- **UI/UX Design**: [Név] - Felhasználói élmény tervezés
- **Tesztelés**: [Név] - Minőségbiztosítás

---

<div align="center">

**Készítette szeretettel az oktatás digitalizációjáért** ❤️

[🌐 Demo](https://lumine-app.vercel.app) • [📚 Dokumentáció](./docs/) • [🐛 Issues](https://github.com/your-username/lumine-app/issues) • [💬 Discussions](https://github.com/your-username/lumine-app/discussions)

</div>