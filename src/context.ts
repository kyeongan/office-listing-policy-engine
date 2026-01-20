import { db } from './db/client.js';
import type { Office, Building, Street, EvaluationContext } from './types.js';

export class DbEvaluationContext implements EvaluationContext {
  private streetOccupancyCache: Map<number, number> = new Map();
  private streetOccupancyCacheValid: boolean = false;

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
    const offices = Array.from(db.offices.values()).filter(
      (o) => o.building_id === buildingId,
    );
    if (offices.length === 0) return 0;

    const occupied = offices.filter((o) => o.occupied).length;
    return (occupied / offices.length) * 100;
  }

  // Pre-compute and cache street occupancy for all streets
  private computeStreetOccupancyCache() {
    this.streetOccupancyCache.clear();
    const allStreets = Array.from(db.streets.values());
    for (const street of allStreets) {
      const streetId = street.id;
      const buildingIds = Array.from(db.buildings.values())
        .filter((b) => b.street_id === streetId)
        .map((b) => b.id);
      const offices = Array.from(db.offices.values()).filter((o) =>
        buildingIds.includes(o.building_id),
      );
      if (offices.length === 0) {
        this.streetOccupancyCache.set(streetId, 0);
      } else {
        const occupied = offices.filter((o) => o.occupied).length;
        this.streetOccupancyCache.set(
          streetId,
          (occupied / offices.length) * 100,
        );
      }
    }
    this.streetOccupancyCacheValid = true;
  }

  // Call this method to invalidate cache when data changes
  invalidateStreetOccupancyCache() {
    this.streetOccupancyCacheValid = false;
  }

  async getStreetOccupancy(streetId: number): Promise<number> {
    if (!this.streetOccupancyCacheValid) {
      this.computeStreetOccupancyCache();
    }
    return this.streetOccupancyCache.get(streetId) ?? 0;
  }
}
