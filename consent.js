// Consent page for the coach-data MCP server's sign-in (Supabase Auth OAuth server).
//
// Supabase sends you here with ?authorization_id=... when an app (e.g. Gemini) asks for access.
// You sign in, see which app is asking, and Allow or Deny; Supabase then sends you back to the app.
// Nothing is remembered in the browser: you sign in each time you approve an app.
"use strict";

const $ = (id) => document.getElementById(id);
const say = (text) => { $("message").textContent = text; };

const cfg = window.COACH_LOGIN || {};
const authorizationId = new URLSearchParams(location.search).get("authorization_id");

function start() {
  if (!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(cfg.supabaseUrl || "") || !cfg.publishableKey ||
      /^sb_secret_/.test(cfg.publishableKey)) {
    say("This page isn't set up yet: config.js needs the Supabase address and publishable key.");
    return;
  }
  if (!authorizationId) {
    say("Nothing to approve. This page opens by itself when you connect an app to your coaching data.");
    return;
  }

  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  $("signin").hidden = false;
  $("email").focus();
  $("signin").addEventListener("submit", async (e) => {
    e.preventDefault();
    const button = $("signin").querySelector("button");
    button.disabled = true;
    say("Signing in…");
    const { data, error } = await sb.auth.signInWithPassword({
      email: $("email").value.trim(),
      password: $("password").value,
    });
    $("password").value = "";
    button.disabled = false;
    if (error) return say(`Sign-in failed: ${error.message}`);
    $("signin").hidden = true;
    await showRequest(sb, data.user);
  });
}

async function showRequest(sb, user) {
  say("Checking the request…");
  const { data, error } = await sb.auth.oauth.getAuthorizationDetails(authorizationId);
  if (error) return say(`This request can't be used (${error.message}). Start connecting the app again.`);

  // Already approved earlier: Supabase just wants to send you straight back.
  if (!data.authorization_id && data.redirect_url) {
    say("Already allowed. Taking you back…");
    location.assign(data.redirect_url);
    return;
  }

  let target = data.redirect_uri || "";
  try { target = new URL(target).host || target; } catch { /* show as given */ }
  $("client").textContent = data.client?.name || "An app";
  $("redirect").textContent = target || "unknown";
  $("who").textContent = user?.email || "";
  say("");
  $("consent").hidden = false;

  const decide = async (approve) => {
    $("allow").disabled = $("deny").disabled = true;
    say(approve ? "Allowing…" : "Denying…");
    // Both send the browser back to the app when they succeed.
    const { error: err } = approve
      ? await sb.auth.oauth.approveAuthorization(authorizationId)
      : await sb.auth.oauth.denyAuthorization(authorizationId);
    if (err) {
      $("allow").disabled = $("deny").disabled = false;
      say(`That didn't work: ${err.message}`);
    }
  };
  $("allow").addEventListener("click", () => decide(true));
  $("deny").addEventListener("click", () => decide(false));
}

start();
