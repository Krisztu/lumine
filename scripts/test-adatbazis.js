const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
const path = require('path');

// Environment változók betöltése
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Firebase Admin inicializálás
if (!admin.apps.length) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_ADMIN_PROJECT_ID || 'demo-project';
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || 'demo@demo.com';
  const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  
  console.log(`🔧 Firebase konfiguráció:`);
  console.log(`   Project ID: ${projectId}`);
  console.log(`   Client Email: ${clientEmail}`);
  console.log(`   Private Key: ${privateKey ? 'Beállítva' : 'Hiányzik'}`);
  
  if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Hiányzó Firebase Admin konfigurációs adatok!');
    console.error('Ellenőrizd a .env fájlban a következő változókat:');
    console.error('- NEXT_PUBLIC_FIREBASE_PROJECT_ID vagy FIREBASE_ADMIN_PROJECT_ID');
    console.error('- FIREBASE_ADMIN_CLIENT_EMAIL');
    console.error('- FIREBASE_ADMIN_PRIVATE_KEY');
    process.exit(1);
  }
  
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: projectId,
      clientEmail: clientEmail,
      privateKey: privateKey,
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
  
  console.log(`✅ Firebase Admin SDK inicializálva: ${projectId}`);
}

const db = admin.firestore();
const auth = admin.auth();

// Időpontok definiálása
const TIME_SLOTS = ['7:45', '8:45', '9:45', '10:45', '11:45', '12:45', '13:45', '14:45'];
const DAYS = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek'];
const SUBJECTS = [
    'Matematika',
    'Magyar nyelv és irodalom',
    'Történelem',
    'Angol nyelv',
    'Német nyelv',
    'Biológia',
    'Kémia',
    'Fizika',
    'Földrajz',
    'Informatika',
    'Testnevelés',
    'Rajz és vizuális kultúra',
    'Ének-zene',
    'Etika',
    'Filozófia',
    'Pszichológia',
    'Közgazdaságtan',
    'Jog',
    'Osztályfőnöki'
];

// Segédfüggvény API hívásokhoz retry logikával
async function apiCall(url, data, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin'
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.warn(`⚠️ API hívás sikertelen (${i + 1}/${retries}): ${error.message}`);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponenciális várakozás
    }
  }
}

// Felhasználók adatai
const USERS_DATA = {
  // 1 Admin
  admin: {
    name: 'Admin1',
    email: 'admin1@lumine.edu.hu',
    password: 'admin123456',
    role: 'admin',
    phone: '+36 30 123 4567',
    address: '5600 Békéscsaba, Andrássy út 15.'
  },
  
  // 1 Igazgató
  principal: {
    name: 'Igazgato1',
    email: 'igazgato1@lumine.edu.hu',
    password: 'igazgato123456',
    role: 'principal',
    phone: '+36 30 234 5678',
    address: '5600 Békéscsaba, Szent István tér 10.'
  },
  
  // 2 Osztályfőnök
  homeroom_teachers: [
    {
      name: 'Osztalyfonok1',
      email: 'osztalyfonok1@lumine.edu.hu',
      password: 'osztalyfonok123456',
      role: 'homeroom_teacher',
      class: '9.A',
      subjects: ['Matematika', 'Fizika'],
      phone: '+36 30 345 6789',
      address: '5600 Békéscsaba, Kossuth Lajos utca 25.'
    },
    {
      name: 'Osztalyfonok2',
      email: 'osztalyfonok2@lumine.edu.hu',
      password: 'osztalyfonok123456',
      role: 'homeroom_teacher',
      class: '9.B',
      subjects: ['Magyar nyelv és irodalom', 'Történelem'],
      phone: '+36 30 456 7890',
      address: '5600 Békéscsaba, Szabadság tér 8.'
    }
  ],
  
  // 6 Tanár (hogy minden tantárgyat le tudjunk fedni)
  teachers: [
    {
      name: 'Tanar1',
      email: 'tanar1@lumine.edu.hu',
      password: 'tanar123456',
      role: 'teacher',
      subjects: ['Angol nyelv', 'Informatika'],
      phone: '+36 30 567 8901',
      address: '5600 Békéscsaba, Jókai utca 12.'
    },
    {
      name: 'Tanar2',
      email: 'tanar2@lumine.edu.hu',
      password: 'tanar123456',
      role: 'teacher',
      subjects: ['Kémia', 'Biológia'],
      phone: '+36 30 678 9012',
      address: '5540 Szarvas, Kossuth Lajos utca 18.'
    },
    {
      name: 'Tanar3',
      email: 'tanar3@lumine.edu.hu',
      password: 'tanar123456',
      role: 'teacher',
      subjects: ['Földrajz', 'Testnevelés'],
      phone: '+36 30 789 0123',
      address: '5700 Gyula, Várkert utca 5.'
    },
    {
      name: 'Tanar4',
      email: 'tanar4@lumine.edu.hu',
      password: 'tanar123456',
      role: 'teacher',
      subjects: ['Rajz és vizuális kultúra', 'Ének-zene'],
      phone: '+36 30 890 1234',
      address: '5650 Mezőberény, Petőfi Sándor utca 22.'
    },
    {
      name: 'Tanar5',
      email: 'tanar5@lumine.edu.hu',
      password: 'tanar123456',
      role: 'teacher',
      subjects: ['Magyar nyelv és irodalom'],
      phone: '+36 30 901 2345',
      address: '5630 Békés, Széchenyi István utca 14.'
    }
  ],
  
  // 2 Osztály diákjai (8-8 diák = 16 diák)
  students: {
    '9.A': [
      { name: 'Diak1', email: 'diak1@lumine.edu.hu', password: 'diak123456', studentId: '70123456789', phone: '+36 70 123 4567', address: '5600 Békéscsaba, Arany János utca 30.' },
      { name: 'Diak2', email: 'diak2@lumine.edu.hu', password: 'diak123456', studentId: '70123456790', phone: '+36 70 234 5678', address: '5600 Békéscsaba, Munkácsy Mihály utca 16.' },
      { name: 'Diak3', email: 'diak3@lumine.edu.hu', password: 'diak123456', studentId: '70123456791', phone: '+36 70 345 6789', address: '5600 Békéscsaba, Dózsa György út 45.' },
      { name: 'Diak4', email: 'diak4@lumine.edu.hu', password: 'diak123456', studentId: '70123456792', phone: '+36 70 456 7890', address: '5540 Szarvas, Arany János utca 8.' },
      { name: 'Diak5', email: 'diak5@lumine.edu.hu', password: 'diak123456', studentId: '70123456793', phone: '+36 70 567 8901', address: '5540 Szarvas, Vajda Péter utca 12.' },
      { name: 'Diak6', email: 'diak6@lumine.edu.hu', password: 'diak123456', studentId: '70123456794', phone: '+36 70 678 9012', address: '5700 Gyula, Béke sugárút 20.' },
      { name: 'Diak7', email: 'diak7@lumine.edu.hu', password: 'diak123456', studentId: '70123456795', phone: '+36 70 789 0123', address: '5700 Gyula, Erkel Ferenc utca 7.' },
      { name: 'DJ1', email: 'dj1@lumine.edu.hu', password: 'dj123456', studentId: '70123456796', role: 'dj', phone: '+36 70 890 1234', address: '5650 Mezőberény, Rákóczi utca 33.' }
    ],
    '9.B': [
      { name: 'Diak8', email: 'diak8@lumine.edu.hu', password: 'diak123456', studentId: '70123456797', phone: '+36 70 901 2345', address: '5630 Békés, Dankó Pista utca 11.' },
      { name: 'Diak9', email: 'diak9@lumine.edu.hu', password: 'diak123456', studentId: '70123456798', phone: '+36 70 012 3456', address: '5630 Békés, Tisza utca 25.' },
      { name: 'Diak10', email: 'diak10@lumine.edu.hu', password: 'diak123456', studentId: '70123456799', phone: '+36 70 123 4567', address: '5561 Békésszentandrás, Fő utca 18.' },
      { name: 'Diak11', email: 'diak11@lumine.edu.hu', password: 'diak123456', studentId: '70123456800', phone: '+36 70 234 5678', address: '5742 Elek, Ady Endre utca 9.' },
      { name: 'Diak12', email: 'diak12@lumine.edu.hu', password: 'diak123456', studentId: '70123456801', phone: '+36 70 345 6789', address: '5555 Kondoros, Kossuth Lajos utca 40.' },
      { name: 'Diak13', email: 'diak13@lumine.edu.hu', password: 'diak123456', studentId: '70123456802', phone: '+36 70 456 7890', address: '5744 Körösnagyharsány, Petőfi utca 6.' },
      { name: 'Diak14', email: 'diak14@lumine.edu.hu', password: 'diak123456', studentId: '70123456803', phone: '+36 70 567 8901', address: '5720 Sarkad, Szabadság tér 15.' },
      { name: 'Diak15', email: 'diak15@lumine.edu.hu', password: 'diak123456', studentId: '70123456804', phone: '+36 70 678 9012', address: '5502 Gyomaendrőd, Selyem utca 28.' }
    ]
  },
  
  // Szülők (minden diákhoz 1 szülő - OM azonosító alapján kapcsolódnak)
  parents: [
    { name: 'Szulo1', email: 'szulo1@lumine.edu.hu', password: 'szulo123456', childStudentId: '70123456789', phone: '+36 20 123 4567', address: '5600 Békéscsaba, Arany János utca 30.' },
    { name: 'Szulo2', email: 'szulo2@lumine.edu.hu', password: 'szulo123456', childStudentId: '70123456790', phone: '+36 20 234 5678', address: '5600 Békéscsaba, Munkácsy Mihály utca 16.' },
    { name: 'Szulo3', email: 'szulo3@lumine.edu.hu', password: 'szulo123456', childStudentId: '70123456791', phone: '+36 20 345 6789', address: '5600 Békéscsaba, Dózsa György út 45.' },
    { name: 'Szulo4', email: 'szulo4@lumine.edu.hu', password: 'szulo123456', childStudentId: '70123456792', phone: '+36 20 456 7890', address: '5540 Szarvas, Arany János utca 8.' },
    { name: 'Szulo5', email: 'szulo5@lumine.edu.hu', password: 'szulo123456', childStudentId: '70123456793', phone: '+36 20 567 8901', address: '5540 Szarvas, Vajda Péter utca 12.' },
    { name: 'Szulo6', email: 'szulo6@lumine.edu.hu', password: 'szulo123456', childStudentId: '70123456794', phone: '+36 20 678 9012', address: '5700 Gyula, Béke sugárút 20.' },
    { name: 'Szulo7', email: 'szulo7@lumine.edu.hu', password: 'szulo123456', childStudentId: '70123456795', phone: '+36 20 789 0123', address: '5700 Gyula, Erkel Ferenc utca 7.' },
    { name: 'Szulo8', email: 'szulo8@lumine.edu.hu', password: 'szulo123456', childStudentId: '70123456796', phone: '+36 20 890 1234', address: '5650 Mezőberény, Rákóczi utca 33.' },
    { name: 'Szulo9', email: 'szulo9@lumine.edu.hu', password: 'szulo123456', childStudentId: '70123456797', phone: '+36 20 901 2345', address: '5630 Békés, Dankó Pista utca 11.' },
    { name: 'Szulo10', email: 'szulo10@lumine.edu.hu', password: 'szulo123456', childStudentId: '70123456798', phone: '+36 20 012 3456', address: '5630 Békés, Tisza utca 25.' },
    { name: 'Szulo11', email: 'szulo11@lumine.edu.hu', password: 'szulo123456', childStudentId: '70123456799', phone: '+36 20 123 4567', address: '5561 Békésszentandrás, Fő utca 18.' },
    { name: 'Szulo12', email: 'szulo12@lumine.edu.hu', password: 'szulo123456', childStudentId: '70123456800', phone: '+36 20 234 5678', address: '5742 Elek, Ady Endre utca 9.' },
    { name: 'Szulo13', email: 'szulo13@lumine.edu.hu', password: 'szulo123456', childStudentId: '70123456801', phone: '+36 20 345 6789', address: '5555 Kondoros, Kossuth Lajos utca 40.' },
    { name: 'Szulo14', email: 'szulo14@lumine.edu.hu', password: 'szulo123456', childStudentId: '70123456802', phone: '+36 20 456 7890', address: '5744 Körösnagyharsány, Petőfi utca 6.' },
    { name: 'Szulo15', email: 'szulo15@lumine.edu.hu', password: 'szulo123456', childStudentId: '70123456803', phone: '+36 20 567 8901', address: '5720 Sarkad, Szabadság tér 15.' },
    { name: 'Szulo16', email: 'szulo16@lumine.edu.hu', password: 'szulo123456', childStudentId: '70123456804', phone: '+36 20 678 9012', address: '5502 Gyomaendrőd, Selyem utca 28.' }
  ]
};

// Fix órarend definiálása
const FIXED_SCHEDULE = {
  '9.A': {
    'Hétfő': [
      { time: '7:45', subject: 'Matematika', teacher: 'Osztalyfonok1', room: '101' },
      { time: '8:45', subject: 'Magyar nyelv és irodalom', teacher: 'Tanar5', room: '102' },
      { time: '9:45', subject: 'Angol nyelv', teacher: 'Tanar1', room: '103' },
      { time: '10:45', subject: 'Fizika', teacher: 'Osztalyfonok1', room: '104' },
      { time: '11:45', subject: 'Testnevelés', teacher: 'Tanar3', room: 'Tornaterem' },
      { time: '12:45', subject: 'Történelem', teacher: 'Osztalyfonok2', room: '105' }
    ],
    'Kedd': [
      { time: '7:45', subject: 'Magyar nyelv és irodalom', teacher: 'Tanar5', room: '102' },
      { time: '8:45', subject: 'Matematika', teacher: 'Osztalyfonok1', room: '101' },
      { time: '9:45', subject: 'Kémia', teacher: 'Tanar2', room: '106' },
      { time: '10:45', subject: 'Informatika', teacher: 'Tanar1', room: '107' },
      { time: '11:45', subject: 'Földrajz', teacher: 'Tanar3', room: '108' },
      { time: '12:45', subject: 'Rajz és vizuális kultúra', teacher: 'Tanar4', room: '109' }
    ],
    'Szerda': [
      { time: '7:45', subject: 'Fizika', teacher: 'Osztalyfonok1', room: '104' },
      { time: '8:45', subject: 'Angol nyelv', teacher: 'Tanar1', room: '103' },
      { time: '9:45', subject: 'Magyar nyelv és irodalom', teacher: 'Tanar5', room: '102' },
      { time: '10:45', subject: 'Biológia', teacher: 'Tanar2', room: '110' },
      { time: '11:45', subject: 'Történelem', teacher: 'Osztalyfonok2', room: '105' },
      { time: '12:45', subject: 'Ének-zene', teacher: 'Tanar4', room: '111' }
    ],
    'Csütörtök': [
      { time: '7:45', subject: 'Matematika', teacher: 'Osztalyfonok1', room: '101' },
      { time: '8:45', subject: 'Testnevelés', teacher: 'Tanar3', room: 'Tornaterem' },
      { time: '9:45', subject: 'Kémia', teacher: 'Tanar2', room: '106' },
      { time: '10:45', subject: 'Magyar nyelv és irodalom', teacher: 'Tanar5', room: '102' },
      { time: '11:45', subject: 'Informatika', teacher: 'Tanar1', room: '107' },
      { time: '12:45', subject: 'Földrajz', teacher: 'Tanar3', room: '108' }
    ],
    'Péntek': [
      { time: '7:45', subject: 'Magyar nyelv és irodalom', teacher: 'Tanar5', room: '102' },
      { time: '8:45', subject: 'Fizika', teacher: 'Osztalyfonok1', room: '104' },
      { time: '9:45', subject: 'Angol nyelv', teacher: 'Tanar1', room: '103' },
      { time: '10:45', subject: 'Biológia', teacher: 'Tanar2', room: '110' },
      { time: '11:45', subject: 'Rajz és vizuális kultúra', teacher: 'Tanar4', room: '109' }
    ]
  },
  '9.B': {
    'Hétfő': [
      { time: '7:45', subject: 'Magyar nyelv és irodalom', teacher: 'Osztalyfonok2', room: '201' },
      { time: '8:45', subject: 'Matematika', teacher: 'Osztalyfonok1', room: '101' },
      { time: '9:45', subject: 'Angol nyelv', teacher: 'Tanar1', room: '103' },
      { time: '10:45', subject: 'Történelem', teacher: 'Osztalyfonok2', room: '105' },
      { time: '11:45', subject: 'Kémia', teacher: 'Tanar2', room: '106' },
      { time: '12:45', subject: 'Testnevelés', teacher: 'Tanar3', room: 'Tornaterem' }
    ],
    'Kedd': [
      { time: '7:45', subject: 'Matematika', teacher: 'Osztalyfonok1', room: '101' },
      { time: '8:45', subject: 'Történelem', teacher: 'Osztalyfonok2', room: '105' },
      { time: '9:45', subject: 'Fizika', teacher: 'Osztalyfonok1', room: '104' },
      { time: '10:45', subject: 'Magyar nyelv és irodalom', teacher: 'Tanar5', room: '102' },
      { time: '11:45', subject: 'Informatika', teacher: 'Tanar1', room: '107' },
      { time: '12:45', subject: 'Ének-zene', teacher: 'Tanar4', room: '111' }
    ],
    'Szerda': [
      { time: '7:45', subject: 'Angol nyelv', teacher: 'Tanar1', room: '103' },
      { time: '8:45', subject: 'Magyar nyelv és irodalom', teacher: 'Osztalyfonok2', room: '201' },
      { time: '9:45', subject: 'Biológia', teacher: 'Tanar2', room: '110' },
      { time: '10:45', subject: 'Földrajz', teacher: 'Tanar3', room: '108' },
      { time: '11:45', subject: 'Matematika', teacher: 'Osztalyfonok1', room: '101' },
      { time: '12:45', subject: 'Rajz és vizuális kultúra', teacher: 'Tanar4', room: '109' }
    ],
    'Csütörtök': [
      { time: '7:45', subject: 'Fizika', teacher: 'Osztalyfonok1', room: '104' },
      { time: '8:45', subject: 'Kémia', teacher: 'Tanar2', room: '106' },
      { time: '9:45', subject: 'Történelem', teacher: 'Osztalyfonok2', room: '105' },
      { time: '10:45', subject: 'Testnevelés', teacher: 'Tanar3', room: 'Tornaterem' },
      { time: '11:45', subject: 'Magyar nyelv és irodalom', teacher: 'Tanar5', room: '102' },
      { time: '12:45', subject: 'Informatika', teacher: 'Tanar1', room: '107' }
    ],
    'Péntek': [
      { time: '7:45', subject: 'Matematika', teacher: 'Osztalyfonok1', room: '101' },
      { time: '8:45', subject: 'Angol nyelv', teacher: 'Tanar1', room: '103' },
      { time: '9:45', subject: 'Magyar nyelv és irodalom', teacher: 'Osztalyfonok2', room: '201' },
      { time: '10:45', subject: 'Biológia', teacher: 'Tanar2', room: '110' },
      { time: '11:45', subject: 'Földrajz', teacher: 'Tanar3', room: '108' }
    ]
  }
};

// Órarend generálás logika - fix órarend használata
function generateSchedule() {
  const schedule = [];
  
  // Fix órarend feldolgozása
  Object.entries(FIXED_SCHEDULE).forEach(([className, weekSchedule]) => {
    Object.entries(weekSchedule).forEach(([day, daySchedule]) => {
      daySchedule.forEach(lesson => {
        schedule.push({
          Day: day,
          StartTime: lesson.time,
          Subject: lesson.subject,
          Teacher: lesson.teacher,
          Class: className,
          Room: lesson.room,
          status: 'normal'
        });
      });
    });
  });
  
  return schedule;
}

// Felhasználók létrehozása az admin API-n keresztül
async function createUsers() {
  console.log('Felhasználók létrehozása az admin API-n keresztül...');
  const createdUsers = [];
  
  try {
    // Admin létrehozása Firebase Auth-ban
    const adminUser = await auth.createUser({
      email: USERS_DATA.admin.email,
      password: USERS_DATA.admin.password,
      displayName: USERS_DATA.admin.name
    });
    
    await db.collection('users').doc(adminUser.uid).set({
      name: USERS_DATA.admin.name,
      fullName: USERS_DATA.admin.name,
      email: USERS_DATA.admin.email,
      role: USERS_DATA.admin.role,
      phone: USERS_DATA.admin.phone,
      address: USERS_DATA.admin.address,
      createdAt: new Date().toISOString()
    });
    
    createdUsers.push({ uid: adminUser.uid, ...USERS_DATA.admin });
    console.log(`✓ Admin létrehozva: ${USERS_DATA.admin.name}`);
    
    // Admin API használata a többi felhasználóhoz
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    console.log(`🌐 API URL: ${baseUrl}`);
    
    // Kis várakozás, hogy a szerver biztosan elinduljon
    console.log('⏳ Várakozás a szerver indítására...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Igazgató regisztrálása
    try {
      await apiCall(`${baseUrl}/api/auth/register`, {
        email: USERS_DATA.principal.email,
        password: USERS_DATA.principal.password,
        fullName: USERS_DATA.principal.name,
        role: 'principal',
        phone: USERS_DATA.principal.phone,
        address: USERS_DATA.principal.address
      });
      console.log(`✓ Igazgató regisztrálva: ${USERS_DATA.principal.name}`);
    } catch (error) {
      console.error(`✗ Igazgató regisztrálása sikertelen: ${error.message}`);
    }
    
    // Osztályfőnökök regisztrálása
    for (const teacher of USERS_DATA.homeroom_teachers) {
      try {
        await apiCall(`${baseUrl}/api/auth/register`, {
          email: teacher.email,
          password: teacher.password,
          fullName: teacher.name,
          role: 'homeroom_teacher',
          subject: teacher.subjects.join(', '),
          class: teacher.class,
          phone: teacher.phone,
          address: teacher.address
        });
        console.log(`✓ Osztályfőnök regisztrálva: ${teacher.name} (${teacher.class})`);
      } catch (error) {
        console.error(`✗ Osztályfőnök regisztrálása sikertelen (${teacher.name}): ${error.message}`);
      }
    }
    
    // Tanárok regisztrálása
    for (const teacher of USERS_DATA.teachers) {
      try {
        await apiCall(`${baseUrl}/api/auth/register`, {
          email: teacher.email,
          password: teacher.password,
          fullName: teacher.name,
          role: 'teacher',
          subject: teacher.subjects.join(', '),
          phone: teacher.phone,
          address: teacher.address
        });
        console.log(`✓ Tanár regisztrálva: ${teacher.name}`);
      } catch (error) {
        console.error(`✗ Tanár regisztrálása sikertelen (${teacher.name}): ${error.message}`);
      }
    }
    
    // Diákok regisztrálása
    for (const [className, students] of Object.entries(USERS_DATA.students)) {
      for (const student of students) {
        try {
          await apiCall(`${baseUrl}/api/auth/register`, {
            email: student.email,
            password: student.password,
            fullName: student.name,
            role: student.role || 'student',
            studentId: student.studentId,
            class: className,
            phone: student.phone,
            address: student.address
          });
          console.log(`✓ ${student.role === 'dj' ? 'DJ' : 'Diák'} regisztrálva: ${student.name} (${className})`);
        } catch (error) {
          console.error(`✗ ${student.role === 'dj' ? 'DJ' : 'Diák'} regisztrálása sikertelen (${student.name}): ${error.message}`);
        }
      }
    }
    
    // Szülők regisztrálása
    for (const parent of USERS_DATA.parents) {
      try {
        await apiCall(`${baseUrl}/api/auth/register`, {
          email: parent.email,
          password: parent.password,
          fullName: parent.name,
          role: 'parent',
          childStudentId: parent.childStudentId,
          phone: parent.phone,
          address: parent.address
        });
        console.log(`✓ Szülő regisztrálva: ${parent.name}`);
      } catch (error) {
        console.error(`✗ Szülő regisztrálása sikertelen (${parent.name}): ${error.message}`);
      }
    }
    
    return createdUsers;
    
  } catch (error) {
    console.error('Hiba a felhasználók létrehozásakor:', error);
    throw error;
  }
}

// Osztályok létrehozása
async function createClasses() {
  console.log('Osztályok létrehozása...');
  
  try {
    const classes = ['9.A', '9.B'];
    
    for (const className of classes) {
      await db.collection('classes').add({
        name: className,
        createdAt: new Date().toISOString()
      });
      
      console.log(`✓ Osztály létrehozva: ${className}`);
    }
    
  } catch (error) {
    console.error('Hiba az osztályok létrehozásakor:', error);
    throw error;
  }
}
async function createParentChildRelations(users) {
  console.log('Szülő-gyermek kapcsolatok létrehozása...');
  
  try {
    for (const parent of USERS_DATA.parents) {
      const parentUser = users.find(u => u.email === parent.email);
      const childUser = users.find(u => u.email === parent.childEmail);
      
      if (parentUser && childUser) {
        await db.collection('parent-child').add({
          parentId: parentUser.uid,
          childId: childUser.uid,
          childName: childUser.name,
          childClass: childUser.class,
          childStudentId: childUser.studentId,
          relationship: 'szulo',
          linkedAt: new Date().toISOString(),
          verified: true
        });
        
        console.log(`✓ Kapcsolat létrehozva: ${parent.name} -> ${childUser.name}`);
      }
    }
  } catch (error) {
    console.error('Hiba a szülő-gyermek kapcsolatok létrehozásakor:', error);
    throw error;
  }
}

// Órarend létrehozása közvetlenül Firestore-ba
async function createSchedule() {
  console.log('Órarend létrehozása közvetlenül Firestore-ba...');
  
  try {
    const schedule = generateSchedule();
    
    // Felhasználók lekérése
    const usersSnapshot = await db.collection('users').get();
    const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    for (const lesson of schedule) {
      try {
        // Tanár megkeresése
        const teacher = allUsers.find(user => (user.fullName || user.name) === lesson.Teacher);
        
        // Osztály diákjainak megkeresése
        const classStudents = allUsers.filter(user => 
          (user.role === 'student' || user.role === 'dj') && user.class === lesson.Class
        );
        
        // Érintett felhasználók (tanár + diákok)
        const affectedUsers = [];
        if (teacher) affectedUsers.push(teacher);
        affectedUsers.push(...classStudents);
        
        // Minden érintett felhasználóhoz létrehozzuk az órát
        for (const user of affectedUsers) {
          await db.collection('lessons').add({
            day: lesson.Day,
            startTime: lesson.StartTime,
            subject: lesson.Subject,
            teacherName: lesson.Teacher,
            className: lesson.Class,
            room: lesson.Room,
            status: lesson.status || 'normal',
            userId: user.id || user.email,
            createdAt: new Date().toISOString()
          });
        }
        
        console.log(`✓ Óra létrehozva: ${lesson.Class} - ${lesson.Day} ${lesson.StartTime} ${lesson.Subject} (${affectedUsers.length} felhasználónak)`);
      } catch (lessonError) {
        console.error(`Hiba az óra létrehozásakor: ${lesson.Class} - ${lesson.Day} ${lesson.StartTime} - ${lessonError.message}`);
      }
    }
    
    console.log(`✓ ${schedule.length} óra feldolgozva az órarendben (minden érintett felhasználónak)`);
    
    // Órarend összesítő
    const classSummary = {};
    schedule.forEach(lesson => {
      if (!classSummary[lesson.Class]) {
        classSummary[lesson.Class] = {};
      }
      if (!classSummary[lesson.Class][lesson.Day]) {
        classSummary[lesson.Class][lesson.Day] = 0;
      }
      classSummary[lesson.Class][lesson.Day]++;
    });
    
    console.log('Fix órarend összesítő:');
    Object.entries(classSummary).forEach(([className, days]) => {
      console.log(`  ${className}:`);
      Object.entries(days).forEach(([day, count]) => {
        console.log(`    ${day}: ${count} óra`);
      });
    });
    
    // Tantárgyak összesítése
    const subjectCount = {};
    schedule.forEach(lesson => {
      if (!subjectCount[lesson.Subject]) {
        subjectCount[lesson.Subject] = 0;
      }
      subjectCount[lesson.Subject]++;
    });
    
    console.log('\nTantárgyak heti óraszáma:');
    Object.entries(subjectCount).sort((a, b) => b[1] - a[1]).forEach(([subject, count]) => {
      console.log(`  ${subject}: ${count} óra`);
    });
    
  } catch (error) {
    console.error('Hiba az órarend létrehozásakor:', error);
    throw error;
  }
}

// Adatbázis tisztítása
async function clearDatabase() {
  console.log('Adatbázis tisztítása...');
  
  try {
    // Firebase Auth felhasználók törlése
    try {
      const listUsersResult = await auth.listUsers();
      if (listUsersResult.users.length > 0) {
        const deletePromises = listUsersResult.users.map(user => auth.deleteUser(user.uid));
        await Promise.all(deletePromises);
        console.log(`✓ ${listUsersResult.users.length} Auth felhasználó törölve`);
      } else {
        console.log('✓ Nincsenek Auth felhasználók törölni való');
      }
    } catch (authError) {
      console.log('⚠️ Auth felhasználók törlése hiba (ez normális lehet új adatbázisnál):', authError.message);
    }
    
    // Firestore kollekciók törlése
    const collections = [
      'users', 'classes', 'lessons', 'parent-child', 'grades', 'homework', 'attendance', 'behavior_records', 'chat_messages',
      'absences', 'access', 'chatMessages', 'excuses', 'homework-submissions', 'musicRequests', 'parent_children', 'schedule-changes'
    ];
    
    for (const collectionName of collections) {
      try {
        const snapshot = await db.collection(collectionName).get();
        const batch = db.batch();
        
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        if (snapshot.docs.length > 0) {
          await batch.commit();
          console.log(`✓ ${snapshot.docs.length} dokumentum törölve a ${collectionName} kollekcióból`);
        } else {
          console.log(`✓ Nincs dokumentum a ${collectionName} kollekcióban`);
        }
      } catch (collectionError) {
        console.log(`⚠️ Hiba a ${collectionName} kollekció törlésekor:`, collectionError.message);
      }
    }
    
  } catch (error) {
    console.error('Hiba az adatbázis tisztításakor:', error);
    // Ne dobjunk hibát, folytassuk az inicializálást
  }
}

// Fő függvény
async function main() {
  try {
    console.log('🚀 Teszt adatbázis inicializálása kezdődik...\n');
    
    // Adatbázis tisztítása
    await clearDatabase();
    console.log('');
    
    // Osztályok létrehozása
    await createClasses();
    console.log('');
    
    // Felhasználók létrehozása
    const users = await createUsers();
    console.log('');
    
    // Szülő-gyermek kapcsolatok
    await createParentChildRelations(users);
    console.log('');
    
    // Órarend létrehozása
    await createSchedule();
    console.log('');
    
    console.log('✅ Teszt adatbázis sikeresen inicializálva!');
    console.log('\n📊 Létrehozott adatok összesítése:');
    console.log(`   • 2 Osztály (9.A, 9.B)`);
    console.log(`   • 1 Admin`);
    console.log(`   • 1 Igazgató`);
    console.log(`   • 2 Osztályfőnök (9.A, 9.B)`);
    console.log(`   • 5 Tanár`);
    console.log(`   • 15 Diák + 1 DJ`);
    console.log(`   • 16 Szülő`);
    console.log(`   • 2 Osztály fix órarendje (5-6 óra/nap, 5 nap)`);
    console.log(`   • Minden felhasználónak van telefonszáma és Békés megyei címe`);
    console.log('\n🔑 Bejelentkezési adatok:');
    console.log('   Email: [szerepkor][szam]@lumine.edu.hu');
    console.log('   Jelszó: [szerepkor]123456');
    console.log('   Példa: admin1@lumine.edu.hu / admin123456');
    
  } catch (error) {
    console.error('❌ Hiba történt:', error);
    process.exit(1);
  }
}

// Script futtatása
if (require.main === module) {
  main().then(() => {
    console.log('\n🎉 Script befejezve!');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Script hiba:', error);
    process.exit(1);
  });
}

module.exports = { main, clearDatabase };