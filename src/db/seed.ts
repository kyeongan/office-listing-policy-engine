import { db } from './client.js';

// Minimal sample data
db.streets.set(101, { id: 101, avg_price: 1500 }); // Madison Ave
db.streets.set(102, { id: 102, avg_price: 800 }); // 3rd Ave

db.buildings.set(201, { id: 201, on_market: true, street_id: 101 }); // 350 Madison
db.buildings.set(202, { id: 202, on_market: false, street_id: 102 }); // 850 3rd Ave

db.offices.set(1001, { id: 1001, occupied: false, building_id: 201 }); // Vacant
db.offices.set(1002, { id: 1002, occupied: true, building_id: 201 }); // Occupied
db.offices.set(2001, { id: 2001, occupied: true, building_id: 202 }); // Occupied
db.offices.set(2002, { id: 2002, occupied: false, building_id: 202 }); // Vacant

console.log('Database seeded');
console.log(`Streets: ${db.streets.size}`);
console.log(`Buildings: ${db.buildings.size}`);
console.log(`Offices: ${db.offices.size}`);
