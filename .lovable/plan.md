# Report: SelfERA error pages

This is a report only. Nothing in the app changes.

SelfERA has **two** error screens. They do different jobs.

---

## 1. "Page not found" (404) page

**What it is**
The screen someone sees when they go to a web address that doesn't exist in SelfERA, for example `/feeed` or an old, broken link.

**What it's for**
- Stops people landing on a blank or broken screen.
- Explains clearly that the page doesn't exist.
- Gives them a quick way back into the app.

**When it shows**
Whenever an address doesn't match any real page. It works whether or not the person is signed in.

**What's on the page**
- **Faded brand tile with a "?"**: a square using the SelfERA blue, purple and orange gradient, dimmed to half strength. It keeps the page on-brand without being loud.
- **"404" in large text**: the standard signal that a page wasn't found.
- **"Page not found"**: a short, plain explanation.
- **"Go Home" button** (gradient style, house icon): goes to the home page. Signed-in people are sent on to their feed. Signed-out people see the landing page.
- **"Go Back" button** (outline style, arrow icon): goes back to the previous page, like the browser's back button.
- **Layout**: centred on a dark background and fills the whole screen height. The buttons stack on mobile and sit side by side on larger screens.

**Behind the scenes**
Each visit records the bad address in the browser console, so broken links can be tracked down.

---

## 2. "Something went wrong" crash screen

**What it is**
A safety net wrapped around the entire app. If any part of the app crashes while it's showing a page, this screen appears instead.

**What it's for**
- Stops a crash turning into a completely white, frozen screen. That matters most on a mental health platform, where someone may be using crisis tools.
- Tells the person something went wrong and gives them a one-tap way to recover.

**What's on the page**
- **"Something went wrong"** heading.
- **The error message**: shows the technical reason for the crash in small, muted text, or "An unexpected error occurred." if there isn't one.
- **"Reload" button**: reloads the whole app, which usually fixes it.
- **Layout**: centred on the app's dark background.

**Behind the scenes**
- The crash details are logged to the console for debugging.
- At app start-up, other hidden failures (background errors and failed requests) are also logged, so white screens can be investigated.
- Old offline/caching data that used to cause white screens is cleared on load.

---

## Things you may want to look at later (not changing now)

- The 404 tile and the Reload button use **rounded corners**, which goes against the square-edge design rule.
- The 404 page uses **hard-coded colours** for the gradient instead of the brand colour settings.
- The crash screen shows **raw technical error text**, which may confuse or worry users.
- Neither page has a **link to Crisis Support**, which could be a useful safety net on this platform.
- The wording isn't **translated** into the app's other languages.
- "Go Home" and "Go Back" use title case. The rest of the app uses more natural, human wording.

Tell me if you'd like any of these improved.
