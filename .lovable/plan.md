# Report: the MyERA page

This is a report only. Nothing in the app changes.

## What it is
MyERA is your personal hub inside SelfERA, at the "MyERA" tab. Your Profile page is your public social face. MyERA is the private "control room" for your account, your support network and your paid interactions with verified providers.

## What it's for
- Shows who you are on SelfERA and your account status at a glance.
- Connects the free social side of the app to the paid side, where people find and work with verified professionals.
- Gives you one place to manage your support connections and interactions (sessions or bookings with providers).

## What's on the page, top to bottom

### 1. Cover banner
- Your cover photo, faded into the dark background. If you haven't set one, a stock gradient image is used.
- **Three-dot menu** (top right):
  - **Analytics**: opens your creator dashboard.
  - **Settings**
  - **About SelfERA**: opens the transparency page.

### 2. Identity card (floats over the cover)
- **Avatar** with the brand gradient ring. Tap it to go to your profile.
- **Name**, plus the ERA verified tick if you're verified.
- **@handle**
- **Account type badge**: Individual, Professional or Organisation.
- **Account Status button**: shows "ERA Verified · Active", your plan name (for example "Pro Plan") or "Free Account". Tap it to open the Account page, which covers billing, plan and verification.

### 3. Stats row (four tappable boxes)
| Box | Shows | Goes to |
|---|---|---|
| Waitlist | The number of communities you belong to | Community |
| My List | How many providers you're connected to (active and pending) | Directory |
| Pending | Connection requests waiting on you, with a coloured dot when there are any | Notifications |
| Alerts | A bell icon | Notifications |

Why it's there: it gives a quick read on your network without opening other pages.

### 4. MyERA Network section
- **"+ Add" button**: opens a picker for verified directory providers, so you can add one to your network.
- **Three tabs:**
  - **Discover**: your support connections (verified providers), each with a status ring, an "active" dot or "Pending" tag, their organisation or role, and a **message button** that opens a chat with them. If you have none, you'll see "find support when you're ready" and an **Explore Directory** button. A loading spinner shows while it loads, and an error message with **Try again** shows if it fails.
  - **My List**: currently only a placeholder message ("your saved connections..."). It isn't working yet.
  - **Interactions**: your paid interactions with providers, grouped into Pending, Active, Completed and Cancelled. The buttons change with your role:
    - **Clients** can confirm, complete or cancel.
    - **Providers** can accept, decline, complete or cancel.

### 5. Footer
A soft line: "By using SelfERA, you agree to our community guidelines."

### Hidden or pop-up parts
- **Verification flow**: a full-screen screen for applying for ERA verification. It's built in, but nothing on the page currently opens it.
- **Verified Directory Picker**: the pop-up opened by "+ Add".

## Where the information comes from
All of it comes from real data: your profile, community memberships, support connections, pending requests, verification request, subscription and interactions. Your role (client or provider) changes what the Interactions tab lets you do.

## Things to know or revisit later
- **"Waitlist" is mislabelled.** It counts communities and links to Community.
- **My List tab** is a placeholder only.
- **Pending and Alerts** both open Notifications.
- The **verification flow and intent selection** code exists but nothing on the page triggers it.
- Built-but-unused role views (Client, Creator, Practitioner, Organisation, Analytics) aren't shown here yet, even though the project rules say they should be.
- The **fallback cover** is a hard-coded stock image.
- Some parts use **rounded corners**, which goes against the square-edge design rule.

Tell me if you'd like any of these fixed.
