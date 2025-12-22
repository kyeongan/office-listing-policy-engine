// In-memory database for prototype
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

export interface RuleRecord {
  id: number;
  office_id: number;
  criteria: string;
}

export const db = {
  streets: new Map<number, Street>(),
  buildings: new Map<number, Building>(),
  offices: new Map<number, Office>(),
  rules: new Map<number, RuleRecord>(),
  ruleIdCounter: 1,
};
