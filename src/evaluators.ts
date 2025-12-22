import type { Criterion, CriterionEvaluator, EvaluationContext } from './types.js';

export class OfficeOccupiedEvaluator implements CriterionEvaluator {
  async evaluate(criterion: Criterion, context: EvaluationContext): Promise<boolean> {
    const office = await context.getOffice(criterion.entity_id!);
    return office ? office.occupied === criterion.value : false;
  }
}

export class BuildingOccupancyEvaluator implements CriterionEvaluator {
  async evaluate(criterion: Criterion, context: EvaluationContext): Promise<boolean> {
    const occupancy = await context.getBuildingOccupancy(criterion.entity_id!);
    const target = criterion.value as number;

    switch (criterion.operator) {
      case '>':
        return occupancy > target;
      case '<':
        return occupancy < target;
      case '=':
        return Math.abs(occupancy - target) < 0.01;
      default:
        return false;
    }
  }
}

export class BuildingOnMarketEvaluator implements CriterionEvaluator {
  async evaluate(criterion: Criterion, context: EvaluationContext): Promise<boolean> {
    const building = await context.getBuilding(criterion.entity_id!);
    return building ? building.on_market === criterion.value : false;
  }
}

export class StreetOccupancyEvaluator implements CriterionEvaluator {
  async evaluate(criterion: Criterion, context: EvaluationContext): Promise<boolean> {
    const occupancy = await context.getStreetOccupancy(criterion.entity_id!);
    const target = criterion.value as number;

    switch (criterion.operator) {
      case '>':
        return occupancy > target;
      case '<':
        return occupancy < target;
      case '=':
        return Math.abs(occupancy - target) < 0.01;
      default:
        return false;
    }
  }
}

export class StreetPriceEvaluator implements CriterionEvaluator {
  async evaluate(criterion: Criterion, context: EvaluationContext): Promise<boolean> {
    const street = await context.getStreet(criterion.entity_id!);
    if (!street) return false;

    const target = criterion.value as number;

    switch (criterion.operator) {
      case '>':
        return street.avg_price > target;
      case '<':
        return street.avg_price < target;
      case '=':
        return street.avg_price === target;
      default:
        return false;
    }
  }
}

export class DateComparisonEvaluator implements CriterionEvaluator {
  async evaluate(criterion: Criterion, context: EvaluationContext): Promise<boolean> {
    const targetDate = new Date(criterion.value as string);
    const now = new Date();

    switch (criterion.operator) {
      case 'past':
        return targetDate < now;
      case 'future':
        return targetDate > now;
      default:
        return false;
    }
  }
}
