import { db } from './db/client.js';
import type { Office, Building, Street, EvaluationContext } from './types.js';

export class DbEvaluationContext implements EvaluationContext {
  async getOffice(id: number): Promise<Office | undefined> {
    return db.offices.get(id);
  }

  async getBuilding(id: number): Promise<Building | undefined> {
    return db.buildings.get(id);
  }

  async getStreet(id: number): Promise<Street | undefined> {
    return db.streets.get(id);
  }

  async getBuildingOccupancy(buildingId: number): Promise<number> {
    const offices = Array.from(db.offices.values()).filter((o) => o.building_id === buildingId);
    if (offices.length === 0) return 0;

    const occupied = offices.filter((o) => o.occupied).length;
    return (occupied / offices.length) * 100;
  }

  async getStreetOccupancy(streetId: number): Promise<number> {
    const buildingIds = Array.from(db.buildings.values())
      .filter((b) => b.street_id === streetId)
      .map((b) => b.id);

    const offices = Array.from(db.offices.values()).filter((o) => buildingIds.includes(o.building_id));

    if (offices.length === 0) return 0;

    const occupied = offices.filter((o) => o.occupied).length;
    return (occupied / offices.length) * 100;
  }
}
