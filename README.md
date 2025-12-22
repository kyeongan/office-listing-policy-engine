src/

# Office Listing Policy Engine

Minimal rule engine (AND-only) to decide if an office should be publicly listed. Stack: TypeScript + Node.js + Express. Data is in-memory for the prototype.

## Run

```bash
npm install
npm run dev   # http://localhost:3000
```

## API

- POST /api/rules — create a rule for an office
- GET /api/rules/:officeId — list rules for an office
- GET /api/offices/:id/listed — check if office should be listed

Example create:

```bash
curl -X POST http://localhost:3000/api/rules \
  -H "Content-Type: application/json" \
  -d '{
    "office_id": 1001,
    "criteria": [
      {"type": "office_occupied", "entity_id": 1001, "value": false},
      {"type": "street_price", "entity_id": 101, "operator": ">", "value": 1000}
    ]
  }'
```

## Rule Model

- Rule: `office_id`, `criteria[]`
- Criterion: `type`, `entity_id?`, `operator?`, `value?`
- Supported types: `office_occupied`, `building_occupancy`, `building_on_market`, `street_occupancy`, `street_price`, `date_comparison`

## How It Works

- Evaluators: one class per criterion type (`src/evaluators.ts`)
- Engine: loops criteria with AND logic (`src/engine.ts`)
- Context: fetches latest data (`src/context.ts`)
- In-memory data seeded on startup (`src/db/seed.ts`)

## Sample Data (small)

- Streets: 101 (Madison, $1500), 102 (3rd Ave, $800)
- Buildings: 201 (on market, Madison), 202 (off market, 3rd Ave)
- Offices: 1001 vacant, 1002 occupied (building 201); 2001 occupied, 2002 vacant (building 202)

## Extend (add criterion)

1. Add type in `types.ts`
2. Implement evaluator in `evaluators.ts`
3. Register in `engine.ts`
