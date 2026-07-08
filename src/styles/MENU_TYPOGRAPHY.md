# Menu / Settings / Admin — Canonical Typography & Icon Scale

Single source of truth for **every** menu, panel, settings-style screen,
filter sheet, and admin surface — current and future.

Tokens are defined as component-layer utility classes in `src/index.css`.

| Token              | Size / weight        | Use for                                                         |
| ------------------ | -------------------- | --------------------------------------------------------------- |
| `.text-page-title` | 20px / bold          | Page/section titles (e.g. "Settings", "Internal Admin")         |
| `.text-section`    | 15px / semi-bold     | Section headers within a page (e.g. "Theme", "Platform Overview") |
| `.text-row-label`  | 14px / regular       | Body / row labels / card labels                                 |
| `.text-helper`     | 12px / muted gray    | Secondary / helper / description text                           |
| `.icon-menu`       | 18×18px              | Icons inside menu rows and cards                                |
| `.icon-menu-sm`    | 16×16px              | Compact tab-strip / inline icons                                |

## Rules

1. **Never** write one-off inline sizes (`text-2xl`, `text-xl font-bold`,
   `h-6 w-6`, `h-5 w-5`) on a settings-style screen. Use the tokens above.
2. Page titles are capped at ~20px — never larger, regardless of the page.
3. Icons in menu rows are capped at 18–20px — never larger than the
   accompanying label warrants.
4. `CardTitle` inside a settings/admin card should carry `className="text-section"`.
5. `CardDescription` inside a settings/admin card should carry `className="text-helper"`.

## Reference implementations

- `src/pages/Settings.tsx`
- `src/pages/AdminConsole.tsx`

Copy the same token usage when building any new settings, admin, filter, or
menu-style screen.
