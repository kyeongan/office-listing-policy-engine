import type { Rule, CriterionEvaluator, EvaluationContext, CriterionType } from './types.js';
import { OfficeOccupiedEvaluator, BuildingOccupancyEvaluator, BuildingOnMarketEvaluator, StreetOccupancyEvaluator, StreetPriceEvaluator, DateComparisonEvaluator } from './evaluators.js';

const evaluators: Record<CriterionType, CriterionEvaluator> = {
  office_occupied: new OfficeOccupiedEvaluator(),
  building_occupancy: new BuildingOccupancyEvaluator(),
  building_on_market: new BuildingOnMarketEvaluator(),
  street_occupancy: new StreetOccupancyEvaluator(),
  street_price: new StreetPriceEvaluator(),
  date_comparison: new DateComparisonEvaluator(),
};

export async function evaluateRule(rule: Rule, context: EvaluationContext): Promise<boolean> {
  for (const criterion of rule.criteria) {
    const evaluator = evaluators[criterion.type];
    const result = await evaluator.evaluate(criterion, context);
    if (!result) return false;
  }
  return true;
}
