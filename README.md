# Luminé - Iskolai Adminisztrációs Rendszer

Modern, webalapú iskolai adminisztrációs rendszer, amely hatékonyan támogatja az oktatási intézmények mindennapi működését. A rendszer Next.js 14 és Firebase technológiákra épül, biztosítva a gyors, biztonságos és skálázható működést.

## Főbb funkciók

### Felhasználói szerepkörök

- **Admin**: Teljes rendszer adminisztráció
- **Igazgató**: Intézményi áttekintés és statisztikák
- **Osztályfőnök**: Osztálykezelés és kommunikáció
- **Tanár**: Jegyek, házi feladatok, hiányzások kezelése
- **Diák**: Saját adatok megtekintése, kommunikáció
- **DJ**: Diák jogkörök + zenei kérések kezelése
- **Szülő**: Gyermek adatainak követése

### Oktatási funkciók

- **Órarend kezelés**: Heti/napi nézet, helyettesítések
- **Jegykezelés**: Jegyek rögzítése, statisztikák, exportálás
- **Házi feladatok**: Feladatok kiadása, beadás, értékelés
- **Hiányzáskezelés**: Hiányzások rögzítése, igazolások
- **Kommunikáció**: Valós idejű chat, üzenetek, értesítések


### Előfeltételek

- Node.js 18.0 vagy újabb
- npm 9.0 vagy újabb
- Git verziókezelő
- Firebase projekt (opcionális, demo adatokkal is működik)

### Telepítés

1. Repository klónozása

```bash
git clone https://git.gszi.edu.hu/vizsgaremek2526/vremek_13C_02.git
cd lumine
```

2. Függőségek telepítése

```bash
npm install
```

3. Környezeti változók beállítása

```bash
# Másolja át a példa fájlt
cp .env.example .env

# Szerkessze a .env fájlt saját Firebase adataival
# Vagy használja a demo konfigurációt mellekelt .env fájlt 
```

4. Teszt adatbázis inicializálása

```bash
npm run db:init
```

5. Fejlesztői szerver indítása

```bash
npm run dev
```

6. Böngészőben megnyitás

```
http://localhost:3000
```

## Demo bejelentkezési adatok

### Admin
- Email: admin1@lumine.edu.hu
- Jelszó: admin123456

### Tanár
- Email: tanar1@lumine.edu.hu
- Jelszó: tanar123456

### Diák
- Email: diak1@lumine.edu.hu
- Jelszó: diak123456

### Szülő
- Email: szulo1@lumine.edu.hu
- Jelszó: szulo123456

## Elérhető parancsok

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

## Tesztelés

### Unit tesztek

```bash
# Összes unit teszt futtatása
npm test
```

### End-to-End tesztek

```bash
# E2E tesztek futtatása
npm run test:e2e

```

## Technológiai stack

### Frontend

- Next.js 14: React framework App Router-rel
- React 18: UI könyvtár Hooks-kal
- TypeScript: Típusbiztonság
- Tailwind CSS: Utility-first CSS framework
- Radix UI: Akadálymentes UI komponensek

### Backend

- Next.js API Routes: RESTful API
- Firebase Firestore: NoSQL adatbázis
- Firebase Auth: Felhasználó hitelesítés
- Firebase Storage: Fájl tárolás

### Fejlesztői eszközök

- Vitest: Unit tesztelés
- Playwright: E2E tesztelés
- ESLint: Kód minőség
- Prettier: Kód formázás

### Implementált biztonsági intézkedések

- Firebase Authentication: JWT token alapú hitelesítés
- Szerepkör alapú hozzáférés: RBAC implementáció
- API védelem: Minden endpoint autentikáció ellenőrzés
- Input validáció: Zod schema validáció
- XSS védelem: React beépített védelme
- CSRF védelem: SameSite cookie beállítások

### Adatvédelem

- GDPR megfelelőség: Adatkezelési irányelvek
- Adattitkosítás: Firebase automatikus titkosítás
- Audit log: Felhasználói műveletek naplózása
- Adatok exportálása: Felhasználói jogok biztosítása

## Böngésző támogatás

### Desktop

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobil

- Chrome Mobile
- Safari Mobile
- Samsung Internet
- Firefox Mobile

### Kód stílus

- ESLint: Automatikus kód ellenőrzés
- Prettier: Egységes formázás
- TypeScript: Típusbiztonság kötelező
- Conventional Commits: Commit üzenet formátum

### Tesztelési követelmények

- Minden új funkció unit tesztekkel
- Kritikus folyamatok E2E tesztekkel
- Minimum 80% kód lefedettség
- Minden teszt sikeres futása


### Felhasznált technológiák

- Next.js - React framework
- Firebase - Backend szolgáltatások
- Tailwind CSS - CSS framework
- Radix UI - UI komponensek
- Vercel - Hosting platform

---

Készítette Gaál Levente, Kőszegi Bence, Kurtucz F. Krisztián

Demo: https://lumine-app.vercel.app