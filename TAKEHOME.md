Take Home Assignment:

Our real estate company holds an inventory of office spaces in New York City.

The database includes 3 main tables (and some attributes):

1. offices (occupied: boolean, building: foreign key)
2. buildings (on_market: boolean, street: foreign key)
3. streets (avg_price: integer)

We want to add dynamic listing functionality: for any office space an admin user can define specific rules that control if the office is publicly listed for rent (or not).

The possible criterions that can be used to define a rule are:

1. office O is occupied
2. building B is X% occupied
3. building B is on/off market
4. street S is Y% occupied
5. street S is above/below $Z average price
6. date D is in the past/future

For example, we can define that office 123 gets listed if:
office 123 is not occupied
AND office 456 is occupied
AND building 77 is on market
AND street 8 average price is more than $1000

Please design a system that implements dynamic listing functionality, taking into account that:

1. Admin users can change entity attributes at any time
2. Rules are only built using AND terms, no need to support OR
3. We'll probably want to add more types of criterions in the future

You can use any tool/format to describe the system, feel free to include schemas/pseudocode for components that are non-trivial.
