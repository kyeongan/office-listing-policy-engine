# Office Listing Policy Engine

Minimal rule engine (AND-only) to decide if an office should be publicly listed. Stack: TypeScript + Node.js + Express. Data is in-memory for the prototype.

## Design Decisions

### Why a rule engine instead of hardcoded logic?

Office listing rules are expected to change frequently and vary per office.
Encoding them as data allows admins to modify behavior without code changes.

### Why AND-only logic?

The problem statement explicitly limits rules to AND semantics.
This simplifies evaluation, improves readability, and avoids premature complexity.

### Why evaluation-on-read?

Rules depend on frequently changing attributes (occupancy, market status).
Evaluating on read guarantees correctness and keeps the system simple.
This can later evolve into an event-driven or cached model if scale requires it.

## Run

```bash
npm install
npm run dev   # http://localhost:3000
```

## API Usage

- POST /api/rules  
  Used by admin users to define or update listing rules for an office.

- GET /api/offices/:id/listed  
  Called by the public listing service to decide whether an office is visible.

- GET /api/rules/:officeId  
  Returns all rules configured for a specific office.

### Rule JSON Example (matches TAKEHOME requirements)

Create a rule that lists office 123 if:

- office 123 is not occupied
- office 456 is occupied
- building 77 is on market
- street 8 average price is more than $1000

```json
{
  "office_id": 123,
  "criteria": [
    { "type": "office_occupied", "entity_id": 123, "value": false },
    { "type": "office_occupied", "entity_id": 456, "value": true },
    { "type": "building_on_market", "entity_id": 77, "value": true },
    { "type": "street_price", "entity_id": 8, "operator": ">", "value": 1000 }
  ]
}
```

Additional criterion examples:

```json
{ "type": "building_occupancy", "entity_id": 77, "operator": "<", "value": 80 }
{ "type": "street_occupancy", "entity_id": 8, "operator": ">", "value": 60 }
{ "type": "date_comparison", "operator": "future", "value": "2026-01-01T00:00:00Z" }
```

### Quick cURL

```bash
# Create rule
curl -X POST http://localhost:3000/api/rules \
  -H "Content-Type: application/json" \
  -d '{
    "office_id": 1001,
    "criteria": [
      { "type": "building_on_market", "entity_id": 201, "value": true },
      { "type": "street_price", "entity_id": 101, "operator": ">", "value": 1200 }
    ]
  }'

# Check listing decision
curl http://localhost:3000/api/offices/1001/listed
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

Occupancy semantics:

- Building occupancy: percentage of occupied offices in that building
- Street occupancy: percentage of occupied offices across buildings on that street
  Both are evaluated as 0–100 and compared using `>`, `<`, or `=` operators.

## Sample Data (small)

- Streets: 101 (Madison, $1500), 102 (3rd Ave, $800)
- Buildings: 201 (on market, Madison), 202 (off market, 3rd Ave)
- Offices: 1001 vacant, 1002 occupied (building 201); 2001 occupied, 2002 vacant (building 202)

## Production Considerations

In a production system:

- Rules and entities would be stored in a database
- Data access would be optimized with batching or caching
- Listing results could be cached and invalidated via domain events
- Authorization would restrict rule creation to admin users

## Extend (add criterion)

1. Add type in `types.ts`
2. Implement evaluator in `evaluators.ts`
3. Register in `engine.ts`
