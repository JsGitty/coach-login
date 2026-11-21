# coach-login

The sign-in and consent page for the read-only coaching data server (the private `coach-data`
repository). When an app such as Gemini connects, Supabase sends you here: you sign in, see which
app is asking, and tap **Allow** or **Deny**.

It's a plain static page served by GitHub Pages. It holds no secrets and no data: only the
Supabase address and the publishable key (both designed to be public), in `config.js`. It signs
in, asks Supabase about the request, and passes your answer back; nothing is stored in the browser.

| File | What it does |
|------|--------------|
| `consent.html`, `consent.js`, `style.css` | The page |
| `config.js` | Supabase address and publishable key |
| `vendor/supabase-js-2.119.0.js` | Supabase's JavaScript library (MIT licence in `vendor/supabase-js-LICENSE`), kept here so the page loads nothing from other sites |

Setup and how it fits together: `supabase/functions/coach-mcp/README.md` in `coach-data`.
