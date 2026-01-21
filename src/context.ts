import { AppDataSource, Office, Building, Street } from './db/client.js';
import { redisClient } from './cache/client.js';
import type { EvaluationContext } from './types.js';

const CACHE_TTL_SECONDS = 300; // 5 minutes

export class DbEvaluationContext implements EvaluationContext {
  async getOffice(id: number): Promise<Office | undefined> {
    const cacheKey = `office:${id}`;
    const cachedOffice = await redisClient.get(cacheKey);
    if (cachedOffice) {
      return JSON.parse(cachedOffice);
    }

    const office = (await AppDataSource.manager.findOneBy(Office, { id })) || undefined;
    if (office) {
      await redisClient.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(office));
    }
    return office;
  }

  async getBuilding(id: number): Promise<Building | undefined> {
    const cacheKey = `building:${id}`;
    const cachedBuilding = await redisClient.get(cacheKey);
    if (cachedBuilding) {
      return JSON.parse(cachedBuilding);
    }

    const building = (await AppDataSource.manager.findOneBy(Building, { id })) || undefined;
    if (building) {
      await redisClient.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(building));
    }
    return building;
  }

  async getStreet(id: number): Promise<Street | undefined> {
    const cacheKey = `street:${id}`;
    const cachedStreet = await redisClient.get(cacheKey);
    if (cachedStreet) {
      return JSON.parse(cachedStreet);
    }

    const street = (await AppDataSource.manager.findOneBy(Street, { id })) || undefined;
    if (street) {
      await redisClient.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(street));
    }
    return street;
  }

  async getBuildingOccupancy(buildingId: number): Promise<number> {
    const cacheKey = `building-occupancy:${buildingId}`;
    const cachedOccupancy = await redisClient.get(cacheKey);
    if (cachedOccupancy) {
      return JSON.parse(cachedOccupancy);
    }

    const offices = await AppDataSource.manager.find(Office, {
      where: { building_id: buildingId },
    });
    if (offices.length === 0) return 0;

    const occupied = offices.filter((o) => o.occupied).length;
    const occupancy = (occupied / offices.length) * 100;
    await redisClient.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(occupancy));
    return occupancy;
  }

  async getStreetOccupancy(streetId: number): Promise<number> {
    const cacheKey = `street-occupancy:${streetId}`;
    const cachedOccupancy = await redisClient.get(cacheKey);
    if (cachedOccupancy) {
      return JSON.parse(cachedOccupancy);
    }

    // Cache miss: Calculate for the specific street
    const buildingsInStreet = await AppDataSource.manager.find(Building, { where: { street_id: streetId } });
    if (buildingsInStreet.length === 0) {
      await redisClient.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(0));
      return 0;
    }

    const buildingIds = buildingsInStreet.map(b => b.id);
    const officesInStreet = await AppDataSource.manager.createQueryBuilder(Office, "office")
        .where("office.building_id IN (:...buildingIds)", { buildingIds })
        .getMany();

    let occupancy = 0;
    if (officesInStreet.length > 0) {
      const occupied = officesInStreet.filter((o) => o.occupied).length;
      occupancy = (occupied / officesInStreet.length) * 100;
    }

    await redisClient.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(occupancy));
    return occupancy;
  }
}