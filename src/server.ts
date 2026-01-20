import express from 'express';
import { db } from './db/client.js';
import { DbEvaluationContext } from './context.js';
import { evaluateRule } from './engine.js';
import type { Rule } from './types.js';

const app = express();
app.use(express.json());

const context = new DbEvaluationContext();

// Fast lookup: officeId -> Rule[]
const officeRulesMap: Map<number, any[]> = new Map();

// Seed data on startup
import './db/seed.js';

// Create a rule for an office
app.post('/api/rules', (req, res) => {
  const rule: Rule = req.body;

  const id = db.ruleIdCounter++;
  const dbRule = {
    id,
    office_id: rule.office_id,
    criteria: JSON.stringify(rule.criteria, null, 4),
  };
  db.rules.set(id, dbRule);

  // Update officeRulesMap
  const ruleObj = { id, office_id: rule.office_id, criteria: rule.criteria };
  if (!officeRulesMap.has(rule.office_id)) {
    officeRulesMap.set(rule.office_id, [ruleObj]);
  } else {
    officeRulesMap.get(rule.office_id)!.push(ruleObj);
  }

  res.json({ id, ...rule });
});

// Get rules for an office
app.get('/api/rules/:officeId', (req, res) => {
  const officeId = parseInt(req.params.officeId);
  let rules = officeRulesMap.get(officeId);
  if (!rules) {
    // fallback for legacy or direct db.rules manipulation
    rules = Array.from(db.rules.values())
      .filter((r) => r.office_id === officeId)
      .map((r) => ({
        id: r.id,
        office_id: r.office_id,
        criteria: JSON.parse(r.criteria),
      }));
    if (rules.length > 0) {
      officeRulesMap.set(officeId, rules);
    }
  }
  res.json(rules || []);
});

// Check if office should be listed
app.get('/api/offices/:id/listed', async (req, res) => {
  const officeId = parseInt(req.params.id);

  let rules = officeRulesMap.get(officeId);
  if (!rules) {
    // fallback for legacy or direct db.rules manipulation
    rules = Array.from(db.rules.values())
      .filter((r) => r.office_id === officeId)
      .map((r) => ({
        id: r.id,
        office_id: r.office_id,
        criteria: JSON.parse(r.criteria),
      }));
    if (rules.length > 0) {
      officeRulesMap.set(officeId, rules);
    }
  }

  if (!rules || rules.length === 0) {
    return res.json({ listed: false, reason: 'No rules defined' });
  }

  for (const rule of rules) {
    const passes = await evaluateRule(rule, context);
    if (passes) {
      return res.json({ listed: true, rule_id: rule.id });
    }
  }

  res.json({ listed: false, reason: 'No rules passed' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
