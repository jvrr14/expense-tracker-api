# Expense Tracking

This context records personal expenses while keeping each user's financial records private from every other user.

## Language

**Expense**:
A monetary outflow recorded by a user. Its amount is represented in the smallest currency unit, and its expense date is when the outflow occurred.
_Avoid_: Transaction, purchase

**Expense date**:
The calendar date on which an expense occurred, independent of when the record was created or updated.
_Avoid_: Created date, transaction timestamp

**Built-in expense category**:
A system-defined classification available to every user. The accepted set is fixed for the current product scope.
_Avoid_: Tag, custom category

**Expense owner**:
The user who recorded an expense and is the only user permitted to retrieve, change, or delete it.
_Avoid_: Account, creator
