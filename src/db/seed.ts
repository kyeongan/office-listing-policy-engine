import { AppDataSource, Street, Building, Office, RuleRecord } from './client.js';
import logger from '../logger.js';

export const seedDb = async () => {
  try {
    // Clear existing data (optional, for development)
    await AppDataSource.query('DELETE FROM "rule_record"');
    await AppDataSource.query('DELETE FROM "office"');
    await AppDataSource.query('DELETE FROM "building"');
    await AppDataSource.query('DELETE FROM "street"');

    // Minimal sample data for Street
    const street1 = new Street();
    street1.id = 101;
    street1.avg_price = 1500;
    await AppDataSource.manager.save(street1);

    const street2 = new Street();
    street2.id = 102;
    street2.avg_price = 800;
    await AppDataSource.manager.save(street2);

    // Minimal sample data for Building
    const building1 = new Building();
    building1.id = 201;
    building1.on_market = true;
    building1.street_id = street1.id;
    building1.street = street1; // Link the entity
    await AppDataSource.manager.save(building1);

    const building2 = new Building();
    building2.id = 202;
    building2.on_market = false;
    building2.street_id = street2.id;
    building2.street = street2; // Link the entity
    await AppDataSource.manager.save(building2);

    // Minimal sample data for Office
    const office1 = new Office();
    office1.id = 1001;
    office1.occupied = false;
    office1.building_id = building1.id;
    office1.building = building1; // Link the entity
    await AppDataSource.manager.save(office1);

    const office2 = new Office();
    office2.id = 1002;
    office2.occupied = true;
    office2.building_id = building1.id;
    office2.building = building1; // Link the entity
    await AppDataSource.manager.save(office2);

    const office3 = new Office();
    office3.id = 2001;
    office3.occupied = true;
    office3.building_id = building2.id;
    office3.building = building2; // Link the entity
    await AppDataSource.manager.save(office3);

    const office4 = new Office();
    office4.id = 2002;
    office4.occupied = false;
    office4.building_id = building2.id;
    office4.building = building2; // Link the entity
    await AppDataSource.manager.save(office4);

    logger.info('Database seeded successfully!');
  } catch (error) {
    logger.error({ error }, 'Error seeding database');
    process.exit(1);
  }
};