import express from 'express';
import logger from './logger.js';
import { AppDataSource, connectDb, RuleRecord } from './db/client.js';
import { DbEvaluationContext } from './context.js';
import { evaluateRule } from './engine.js';
import type { Rule } from './types.js';
import { seedDb } from './db/seed.js';

const app = express();
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info({ req: { method: req.method, url: req.url, body: req.body } }, 'Incoming request');
  res.on('finish', () => {
    logger.info({ res: { statusCode: res.statusCode } }, 'Request finished');
  });
  next();
});

const context = new DbEvaluationContext();

// Start server after connecting to DB
connectDb().then(async () => {
  await seedDb();
  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
}).catch(error => {
  logger.error({ error }, "Failed to connect to database and start server");
  process.exit(1);
});

// ... (rest of the API routes)
// Note: I will not modify the API routes themselves as they don't contain console logs.
// The request logger middleware and the final error log in connectDb().catch are the main changes here.


// Create a rule for an office
app.post('/api/rules', async (req, res) => {
  const rule: Rule = req.body;

  const newRuleRecord = new RuleRecord();
  newRuleRecord.office_id = rule.office_id;
  newRuleRecord.criteria = JSON.stringify(rule.criteria);

  await AppDataSource.manager.save(newRuleRecord);

  // Re-fetch to ensure all properties including generated ID are present
  const savedRule = await AppDataSource.manager.findOneBy(RuleRecord, { id: newRuleRecord.id });

  if (savedRule) {
    res.json({ id: savedRule.id, office_id: savedRule.office_id, criteria: JSON.parse(savedRule.criteria) });
  } else {
    res.status(500).json({ message: "Failed to save rule." });
  }
});

// Get rules for an office
app.get('/api/rules/:officeId', async (req, res) => {
  const officeId = parseInt(req.params.officeId);
  const ruleRecords = await AppDataSource.manager.find(RuleRecord, { where: { office_id: officeId } });

  const rules = ruleRecords.map(r => ({
    id: r.id,
    office_id: r.office_id,
    criteria: JSON.parse(r.criteria),
  }));

  res.json(rules);
});

// Check if office should be listed
app.get('/api/offices/:id/listed', async (req, res) => {
  const officeId = parseInt(req.params.id);
  const ruleRecords = await AppDataSource.manager.find(RuleRecord, { where: { office_id: officeId } });

  const rules = ruleRecords.map(r => ({
    id: r.id,
    office_id: r.office_id,
    criteria: JSON.parse(r.criteria),
  }));

  if (rules.length === 0) {
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

