
# Color-Coded Billing Status for MyERA

## Overview
Add intelligent color-coding to the billing section that visually communicates payment status at a glance:
- **Green** - Payment is current and up-to-date
- **Amber/Yellow** - Payment approaching due date (within 7 days)
- **Red** - Payment is overdue

---

## Implementation Approach

### 1. Create Billing Status Helper Function
Add a utility function in `MyERA.tsx` to determine payment status based on dates:

```text
┌─────────────────────────────────────────────────────────┐
│  getBillingStatus(nextDueDate, subscriptionStatus)      │
├─────────────────────────────────────────────────────────┤
│  Returns: 'current' | 'warning' | 'overdue'             │
│                                                         │
│  Logic:                                                 │
│  - If status is 'past_due' → 'overdue'                 │
│  - If nextDue < today → 'overdue'                      │
│  - If nextDue within 7 days → 'warning'                │
│  - Otherwise → 'current'                                │
└─────────────────────────────────────────────────────────┘
```

### 2. Define Color Classes
Create a mapping object for status-to-color:

| Status    | Amount Color      | Date Color            |
|-----------|-------------------|-----------------------|
| current   | `text-green-500`  | `text-green-500/70`   |
| warning   | `text-amber-500`  | `text-amber-500/70`   |
| overdue   | `text-red-500`    | `text-red-500/70`     |

### 3. Update Billing Section UI
Modify the "Next Due" section to apply dynamic colors:
- The **amount** will use the primary status color (bold)
- The **date** will use a slightly muted version of the same color
- "Last Payment" section remains neutral (already paid)

### 4. Use Real Subscription Data
Replace hardcoded mock dates with actual data from `useSubscription`:
- `subscription.current_period_end` for next due date
- `subscription.current_period_start` for last payment reference
- `subscription.status` to check for `past_due` state

---

## Visual Example

```text
┌──────────────────────────────────────────────────┐
│  Last Payment    │      Next Due                 │
│  ────────────    │      ─────────                │
│    $14.99        │    $14.99  ← Green/Amber/Red  │
│  Dec 25, 2025    │  Jan 25, 2026 ← Matching tint │
└──────────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/MyERA.tsx` | Add helper function, update billing UI with dynamic color classes, use real subscription dates |

---

## Technical Details

**Helper Function:**
```typescript
type BillingStatus = 'current' | 'warning' | 'overdue';

const getBillingStatus = (
  nextDueDate: string | null, 
  status: SubscriptionStatus | undefined
): BillingStatus => {
  if (status === 'past_due') return 'overdue';
  if (!nextDueDate) return 'current';
  
  const now = new Date();
  const dueDate = new Date(nextDueDate);
  const daysUntilDue = Math.ceil(
    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 7) return 'warning';
  return 'current';
};

const statusColors = {
  current: { amount: 'text-green-500', date: 'text-green-500/70' },
  warning: { amount: 'text-amber-500', date: 'text-amber-500/70' },
  overdue: { amount: 'text-red-500', date: 'text-red-500/70' },
};
```

**Free Plan Handling:**
For users on the free plan (no billing), the amounts will remain neutral (`text-foreground`) since there's nothing to pay.
