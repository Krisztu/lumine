const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
const path = require('path');

// be kell tolteni a .env fajlt hogy mukodjon
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// firebase admin inicializalas, csak egyszer fusson le
if (!admin.apps.length) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_ADMIN_PROJECT_ID || 'demo-project';
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || 'demo@demo.com';
  const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  
  console.log(`Firebase konfig amit hasznalunk:`);
  console.log(`   Project ID: ${projectId}`);
  console.log(`   Client Email: ${clientEmail}`);
  console.log(`   Private Key: ${privateKey ? 'Beallitva' : 'Hianzik'}`);
  
  if (!projectId || !clientEmail || !privateKey) {
    console.error('Hianyzo Firebase Admin konfiguracios adatok!');
    console.error('Ellenorizd a .env fajlban a kovetkezo valtozokat:');
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
  
  console.log(`Firebase Admin SDK inicializalva: ${projectId}`);
}

const db = admin.firestore();
const auth = admin.auth();

// ezek az orak amikben lehet ora
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
      console.warn(`API hivas sikertelen (${i + 1}/${retries}): ${error.message}`);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); 
    }
  }
}

// teszt felhasznalok adatai
const USERS_DATA = {
  // admin fiok
  admin: {
    name: 'Admin1',
    email: 'admin1@lumine.edu.hu',
    password: 'admin123456',
    role: 'admin',
    phone: '+36 30 123 4567',
    address: '5600 Békéscsaba, Andrássy út 15.'
  },
  
  // igazgato fiok
  principal: {
    name: 'Igazgato1',
    email: 'igazgato1@lumine.edu.hu',
    password: 'igazgato123456',
    role: 'principal',
    phone: '+36 30 234 5678',
    address: '5600 Békéscsaba, Szent István tér 10.'
  },
  
  // ket osztalyfonok, mindket osztalyhoz egy
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
  
  // tanarok, annyit csinalunk amennyivel le tudjuk fedni az osszes tantargyat
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
  
  // diakok, mindket osztalyba 8-8 fo
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
  
  // minden diakhoz egy szulo, az om azonosito alapjan kapcsolodnak
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

// itt van az egesz heti orarend rogzitve
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

// vegigmegyunk a fix orarenden es listaba rakjuk az oraakat
function generateSchedule() {
  const schedule = [];
  
  // bejarjuk az osszes osztaly osszes napjat
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

// letrehozzuk az osszes felhasznalot, eloszor az admint direktbe, a tobbit az api-n at
async function createUsers() {
  console.log('Felhasznalok letrehozasa...');
  const createdUsers = [];
  
  try {
    // az admint kozvetlenul rakjuk be, mert o kell ahhoz hogy a tobbiek menjenek
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
    console.log(`Admin letrehozva: ${USERS_DATA.admin.name}`);
    
    // a tobbi felhasznalot mar az api-n keresztul regisztraljuk
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    console.log(`API URL: ${baseUrl}`);
    
    // varunk egy kicsit hogy a szerver biztosan elinduljon mire hivjuk
    console.log('Varunk hogy a szerver elinduljon...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // igazgato
    try {
      await apiCall(`${baseUrl}/api/auth/register`, {
        email: USERS_DATA.principal.email,
        password: USERS_DATA.principal.password,
        fullName: USERS_DATA.principal.name,
        role: 'principal',
        phone: USERS_DATA.principal.phone,
        address: USERS_DATA.principal.address
      });
      console.log(`Igazgato regisztralva: ${USERS_DATA.principal.name}`);
    } catch (error) {
      console.error(`Igazgato regisztralasa sikertelen: ${error.message}`);
    }
    
    // osztalyfonokokat egyenkent regisztraljuk
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
        console.log(`Osztalyfonok regisztralva: ${teacher.name} (${teacher.class})`);
      } catch (error) {
        console.error(`Osztalyfonok regisztralasa sikertelen (${teacher.name}): ${error.message}`);
      }
    }
    
    // tanarok
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
        console.log(`Tanar regisztralva: ${teacher.name}`);
      } catch (error) {
        console.error(`Tanar regisztralasa sikertelen (${teacher.name}): ${error.message}`);
      }
    }
    
    // diakok, osztalyonkent megyunk vegig
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
          console.log(`${student.role === 'dj' ? 'DJ' : 'Diak'} regisztralva: ${student.name} (${className})`);
        } catch (error) {
          console.error(`${student.role === 'dj' ? 'DJ' : 'Diak'} regisztralasa sikertelen (${student.name}): ${error.message}`);
        }
      }
    }
    
    // szulok
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
        console.log(`Szulo regisztralva: ${parent.name}`);
      } catch (error) {
        console.error(`Szulo regisztralasa sikertelen (${parent.name}): ${error.message}`);
      }
    }
    
    return createdUsers;
    
  } catch (error) {
    console.error('Hiba a felhasznalok letrehozasakor:', error);
    throw error;
  }
}

// letrehozzuk a ket osztalyt a firestoreban
async function createClasses() {
  console.log('Osztalyok letrehozasa...');
  
  try {
    const classes = ['9.A', '9.B'];
    
    for (const className of classes) {
      await db.collection('classes').add({
        name: className,
        createdAt: new Date().toISOString()
      });
      
      console.log(`Osztaly letrehozva: ${className}`);
    }
    
  } catch (error) {
    console.error('Hiba az osztalyok letrehozasakor:', error);
    throw error;
  }
}
async function createParentChildRelations(users) {
  console.log('Szulo-gyermek kapcsolatok letrehozasa...');
  
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
        
        console.log(`Kapcsolat letrehozva: ${parent.name} -> ${childUser.name}`);
      }
    }
  } catch (error) {
    console.error('Hiba a szulo-gyermek kapcsolatok letrehozasakor:', error);
    throw error;
  }
}

// az orarendet kozvetlenul a firestoreba irjuk, minden erintett felhasznalohoz
async function createSchedule() {
  console.log('Orarend letrehozasa...');
  
  try {
    const schedule = generateSchedule();
    
    // lekerjuk az osszes felhasznalot hogy megtalaljuk a tanarokat es diakokat
    const usersSnapshot = await db.collection('users').get();
    const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    for (const lesson of schedule) {
      try {
        // megkeressuk melyik tanar tartja az orat
        const teacher = allUsers.find(user => (user.fullName || user.name) === lesson.Teacher);
        
        // megkeressuk az osztaly diakjait
        const classStudents = allUsers.filter(user => 
          (user.role === 'student' || user.role === 'dj') && user.class === lesson.Class
        );
        
        // osszegyujtjuk a tanart es a diakokat
        const affectedUsers = [];
        if (teacher) affectedUsers.push(teacher);
        affectedUsers.push(...classStudents);
        
        // mindenki kap egy bejegyzest ebbol az orabol
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
        
        console.log(`Ora letrehozva: ${lesson.Class} - ${lesson.Day} ${lesson.StartTime} ${lesson.Subject} (${affectedUsers.length} felhasznalonak)`);
      } catch (lessonError) {
        console.error(`Hiba az ora letrehozasakor: ${lesson.Class} - ${lesson.Day} ${lesson.StartTime} - ${lessonError.message}`);
      }
    }
    
    console.log(`${schedule.length} ora feldolgozva az orarendben (minden erintett felhasznalonak)`);
    
    // kiirjuk mennyi ora lett letrehozva osztalyonkent
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
    
    console.log('Fix orarend osszesito:');
    Object.entries(classSummary).forEach(([className, days]) => {
      console.log(`  ${className}:`);
      Object.entries(days).forEach(([day, count]) => {
        console.log(`    ${day}: ${count} ora`);
      });
    });
    
    // meg azt is kiirjuk hogy tantargyankent mennyi ora van hetente
    const subjectCount = {};
    schedule.forEach(lesson => {
      if (!subjectCount[lesson.Subject]) {
        subjectCount[lesson.Subject] = 0;
      }
      subjectCount[lesson.Subject]++;
    });
    
    console.log('\nTantargyak heti oraszama:');
    Object.entries(subjectCount).sort((a, b) => b[1] - a[1]).forEach(([subject, count]) => {
      console.log(`  ${subject}: ${count} ora`);
    });
    
  } catch (error) {
    console.error('Hiba az orarend letrehozasakor:', error);
    throw error;
  }
}

// letoroljuk az egesz adatbazist mielott ujra feltoltjuk
async function clearDatabase() {
  console.log('Adatbazis torlese...');
  
  try {
    // eloszor az auth felhasznalokat toroljuk
    try {
      const listUsersResult = await auth.listUsers();
      if (listUsersResult.users.length > 0) {
        const deletePromises = listUsersResult.users.map(user => auth.deleteUser(user.uid));
        await Promise.all(deletePromises);
        console.log(`${listUsersResult.users.length} Auth felhasznalo torolve`);
      } else {
        console.log('Nincsenek Auth felhasznalok torolni valo');
      }
    } catch (authError) {
      console.log('Auth felhasznalok torlese hiba (ez normalis lehet uj adatbazisnal):', authError.message);
    }
    
    // majd az osszes firestore kollekciot
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
          console.log(`${snapshot.docs.length} dokumentum torolve a ${collectionName} kollekciobol`);
        } else {
          console.log(`Nincs dokumentum a ${collectionName} kollekcioban`);
        }
      } catch (collectionError) {
        console.log(`Hiba a ${collectionName} kollekcio torlesekor:`, collectionError.message);
      }
    }
    
  } catch (error) {
    console.error('Hiba az adatbazis tisztitasakor:', error);
    // ne dobjunk hibat, folytassuk az inicializalast
  }
}

// ez fut le amikor elindítjuk a scriptet
async function main() {
  try {
    console.log('Teszt adatbazis inicializalasa...');
    
    // eloszor tiszta lappal kezdunk
    await clearDatabase();
    console.log('');
    
    // letrehozzuk az osztalyokat
    await createClasses();
    console.log('');
    
    // letrehozzuk az osszes felhasznalot
    const users = await createUsers();
    console.log('');
    
    // osszekapcsoljuk a szulokat a gyerekeikkel
    await createParentChildRelations(users);
    console.log('');
    
    // feltoltjuk az orarendet
    await createSchedule();
    console.log('');
    
    console.log('Teszt adatbazis sikeresen inicializalva!');
    console.log('\nLetrehozott adatok osszesitese:');
    console.log(`   - 2 Osztaly (9.A, 9.B)`);
    console.log(`   - 1 Admin`);
    console.log(`   - 1 Igazgato`);
    console.log(`   - 2 Osztalyfonok (9.A, 9.B)`);
    console.log(`   - 5 Tanar`);
    console.log(`   - 15 Diak + 1 DJ`);
    console.log(`   - 16 Szulo`);
    console.log(`   - 2 Osztaly fix orarendje (5-6 ora/nap, 5 nap)`);
    console.log(`   - Minden felhasznalonak van telefonszama es Bekes megyei cime`);
    console.log('\nBejelentkezesi adatok:');
    console.log('   Email: [szerepkor][szam]@lumine.edu.hu');
    console.log('   Jelszó: [szerepkor]123456');
    console.log('   Pelda: admin1@lumine.edu.hu / admin123456');
    
  } catch (error) {
    console.error('Hiba tortent:', error);
    process.exit(1);
  }
}

// ha kozvetlenul futtatjak a scriptet (nem importaljak)
if (require.main === module) {
  main().then(() => {
    console.log('\nScript befejezve.');
    process.exit(0);
  }).catch(error => {
    console.error('Script hiba:', error);
    process.exit(1);
  });
}

module.exports = { main, clearDatabase };