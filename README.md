# chordpic.com | Simple Chord Diagram Creator

Web app to create chord charts as easily and quickly as possible. It's hosted at https://chordpic.com.

## Technologies

The web app is built with Next.js and deployed with Vercel. Backend runs on Supabase. Payments are handled by Stripe.

The SVGs are created with [SVGuitar](https://github.com/omnibrain/svguitar).

## Contribute

Change anything you want and send a pull request.

## Routing

Page routes live under `app/[locale]`. Proxy keeps existing English URLs
unprefixed (`/news` internally renders `/en/news`) and other languages prefixed
(`/de/news`). Use `LocalizedLink` and `useLocalizedRouter` for internal navigation.
Metadata is generated on the server; interactive page content and shared providers
remain Client Components.

The existing `pages/api` handlers are retained for Supabase authentication, Stripe
checkout/webhooks, and the XML sitemap. Account access is verified on the server,
with expiring Supabase cookies refreshed in Proxy before rendering.
