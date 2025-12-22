// Domain entities
export interface Office {
  id: number;
  occupied: boolean;
  building_id: number;
}

export interface Building {
  id: number;
  on_market: boolean;
  street_id: number;
}

export interface Street {
  id: number;
  avg_price: number;
}

// Rule system
export type CriterionType = 'office_occupied' | 'building_occupancy' | 'building_on_market' | 'street_occupancy' | 'street_price' | 'date_comparison';

export interface Criterion {
  type: CriterionType;
  entity_id?: number;
  operator?: '>' | '<' | '=' | 'past' | 'future';
  value?: number | boolean | string;
}

export interface Rule {
  id?: number;
  office_id: number;
  criteria: Criterion[];
}

// Evaluation
export interface EvaluationContext {
  getOffice(id: number): Promise<Office | undefined>;
  getBuilding(id: number): Promise<Building | undefined>;
  getStreet(id: number): Promise<Street | undefined>;
  getBuildingOccupancy(buildingId: number): Promise<number>;
  getStreetOccupancy(streetId: number): Promise<number>;
}

export interface CriterionEvaluator {
  evaluate(criterion: Criterion, context: EvaluationContext): Promise<boolean>;
}
