---
name: Clerk Auth setup
description: Clerk provisioned for FanSphere; key decisions and gotchas for web cookie auth.
---

# Clerk Auth — FanSphere

## Setup state
- `setupClerkWhitelabelAuth()` called — appId `app_3FNq2PNPkrveab2FKexqYyi01zU`
- Env vars auto-set: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`

## Key decisions

**Auth transport: cookie-based (web only)**
Do NOT add `getToken()`, `setAuthTokenGetter`, or `Authorization: Bearer` to browser fetch calls. Clerk session cookies handle auth automatically for the web app.

**Why:** FanSphere is a web app (React+Vite), not Expo. Cookie auth is automatic on same-origin requests through the shared proxy.

**How to apply:** Only add bearer token wiring if a native mobile (Expo) artifact is added later.

## Routing
- `/sign-in/*?` and `/sign-up/*?` — exact wouter paths required for OAuth callbacks
- `<SignIn routing="path" path={`${basePath}/sign-in`}>` — full path required (Clerk reads window.location.pathname)
- `proxyUrl={clerkProxyUrl}` is unconditional — empty in dev, auto-set in prod

## Providers enabled (Replit-managed)
- Google (via Auth pane)
- GitHub (via Auth pane)
- Apple (via Auth pane)
- Email/password
