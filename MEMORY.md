# Pickyalo — Project Memory

## EXPERIMENT — Home visual review, 21 September 2026

- At Manu's later explicit request, the reviewable Home now uses one illustrated index for Comercios, Descubrir and Eventos, a beige gradient and an optional burgundy palette. These are visual changes to the existing routes, not the deferred progressive-chip experiment.
- The existing next-themes provider retains the choice. Only `/` allows dark mode; other routes remain explicitly light until their palettes are reviewed.
- A small interactive editorial terminal explains what Pickyalo is, how it works and the curation principle. It uses local copy, no bot or external service. “Ahora en Talavera” retains five mixed real items.
- The shared footer is compact, keeps the current navigation and privacy/cookie links, and leaves room for the fixed cookie-preferences control. This review is local; it has not been deployed.


## DECIDED — Traspaso estratégico, 21 September 2026

- Pickyalo is no longer an ordering app. It is a curated local discovery showcase for **local commerce, tourism and plans/events**, with an approximate content balance of 50/35/15. It is free for users and has no public ratings, reviews or rankings.
- The brand is **Pickyalo**. Keep the repository name `mmateo23/zylenpick`; do not rename it.
- Payment never buys ranking or a larger card. Results are ordered by proximity. Future revenue may come from enhanced profiles, physical QR, metrics and campaigns.
- Do not include chains. Local non-food commerce with identity is in scope, including crafts, ceramics and traditional shops.
- There is no fixed launch date. Publish only after five complete profiles, required analytics and the legal notice are ready.
- Content and permissions are the current bottleneck. Freeze new functionality unless it resolves a critical blocker. The model must work beyond Talavera and across the comarca.
- Freeze cart, checkout, orders and weight pricing; preserve their code and data. Do not activate payments before a charging decision, no earlier than December–January and after consulting the accountant.
- Required pre-launch analytics: `home_vista`, `home_boton_click` (or the final Home equivalent), `ahora_item_click`, `ficha_vista`, `accion_ficha` with action type, `eventos_vacio_visto`, and `qr_escaneado` with the physical-piece id. Mark `add_to_cart` and `pedido_confirmado` as obsolete.
- Prefer PostHog without tracking cookies if technically viable. Legal pages require text supplied by Manu. The public footer contains only Pickyalo, contact email and the legal-notice link; the owner's full legal name appears only inside the legal notice.
- Distance copy is fixed: under one minute, “Aquí al lado”; up to about 20 minutes, walking time; farther away, driving time or kilometres; without location permission, show the area. Estimate routes as straight-line distance × 1.3 and round up. Never invent distance.
- A minimum commerce profile contains name, phone, address, opening hours including closing day, 3–4 products with optional indicative prices, façade photo, reservation acceptance, preferred monthly contact and photo permission. Every fact needs a confirmation date.
- Data provenance should progressively distinguish imported, business-provided, inferred, reviewed and verified-in-person data, with freshness dates.
- Base Home agreed on 13 September: “¿Qué te apetece descubrir ahora?”, three entrances (Comer, Explorar, Eventos), then “Ahora en Talavera” with five mixed real items, and nothing else. Wording alternatives (“Visitar”, “Lugares”, “Planes”) and a fourth “Comprar” entrance remain OPEN and must not be built without confirmation.
- Current implementation warning: the working tree already contains a richer progressive Home created before this handoff. It does not match the smaller base Home exactly. Do not extend or replace it until Manu explicitly chooses how to reconcile the live experiment with the agreed base.

## EXPERIMENT — Single-screen chip Home, 21 September 2026

- Do not build it yet. First show a mockup to five people. Codex may assess reuse, missing data and effort.
- The concept is one screen where selected chips form a removable/searchable phrase, up to five dependent chips appear at a time, and two or three real results appear after the first choice.
- Chips describe moments rather than business categories. Food, tourism and plans may mix in results. No next/back flow and never an empty result state; similarity ranking is an OPEN implementation idea.
- Accessibility requirements: icon plus word, selected state indicated by more than colour, minimum 48×48 pt targets with 8 pt separation, 18 px chip text (never below 16 px), 4.5:1 contrast, immediate feedback, calm motion, reduced-motion support and compatibility with maximum system text size.
- Never show cart, prominent prices, stars, reviews, sponsored labels, paid card sizes or large maps in this experiment.
- The motorhome journey, similarity scoring, “Explorar” wording, recurring-plan treatment and a “Comprar” entrance remain OPEN. Do not implement them without Manu's confirmation.

## DECIDED — Explicitly frozen or discarded, 21 September 2026

- Ordering, cart and weight pricing; €2/hour featured chips; €99 professional onboarding; mobile wallet card; automatic assistant/bot; PickLamp; PickPrint; hiking; TikTok; VeriFactu inside Pickyalo; and Stripe payments before a later charging decision.
- Payment-plan names and prices are internal reference only during phase 0 and must not appear publicly: Selección free, Escaparate vivo €9, Temporada €19, Socio €39, annual with two months free.

## DECIDED — Editorial pivot, 14 September 2026

- The user's latest direction supersedes the older food-first hierarchy: Lo local and Explora have equal prominence, no 01/02 numbering. Commerce includes local shops and hospitality, with food as content within it.
- Reuse the existing iPost. Switching or swiping changes the entire Home environment: colour, imagery and lower selection. Do not leave dishes visible inside Explora. The later voice clarification places active events in the same swipeable header as a third environment.
- Keep it premium, visual, local and light. Existing Talavera monuments/stickers and published records are the source; do not create another site or duplicate data systems.
- Freeze public cart/checkout/orders and retain their implementation and records. The panel has four main destinations: Fichas, Destacados, Horarios and Métricas. Basic metrics use available catalogue counts; PostHog remains the analytics system, with no invented traffic numbers.
- Implementation/recovery boundaries are documented in `docs/editorial-pivot.md`. These notes describe the code; verify deployment status separately before claiming publication.

## EXPERIMENT — Product/local card flip, 14 September 2026

- The existing `/platos` mosaic can turn a product card over to show its venue's existing cover, with a separate product-detail/local-profile action. Reuses published venue data; no synthetic product records, schema or publication changes.
- Back images load only after interaction. Missing, identical or failed venue covers keep the original product-detail action. Reduced motion disables the rotation animation.
- A venue cover is not necessarily a façade: use neutral local wording. Showing only façades for specific venues, or hiding venues that have not agreed to appear, requires identifying those venues. This experiment does not establish consent or alter publication status.

This file stores decisions that should survive between agents and coding sessions.

Do not treat every experimental idea as a permanent decision.

Use three states:

- **DECIDED**
- **EXPERIMENT**
- **OPEN**

---

# Product identity

**DECIDED**

Project name: **Pickyalo**

Previous name: ZylenPick.

Primary public domain:

`pickyalo.com`

---

# Initial geography

**DECIDED**

Launch area:

**Talavera de la Reina**

Expansion model:

**Talavera + comarca**, followed later by additional cities.

---

# Core proposition

**DECIDED**

Food discovery is based heavily on actual dishes/products rather than only business listings.

Pickyalo prioritizes:

- visual discovery
- nearby availability
- local businesses
- collection
- curated information

---

# Reviews

**DECIDED**

Do not build Pickyalo around public reviews or star ratings.

Quality/trust should be based on curation and verification.

---

# Ordering

**DECIDED**

The initial transactional model is focused on **collection**, not building a delivery logistics network.

---

# Current MVP route model

**DECIDED**

Current core flow:

`/`
→ city
→ venue
→ product
→ cart
→ checkout
→ ticket/order confirmation

---

# Price handling

**DECIDED**

Supported concepts include:

- fixed
- from
- variable
- hidden

Never require all products to have a fixed numerical price.

---

# Existing infrastructure

**DECIDED**

Primary stack:

- Next.js
- Vercel
- Supabase
- PostgreSQL
- Cloudflare
- Resend
- PostHog

Avoid replacing these without a compelling reason.

---

# Image strategy

**EXPERIMENT**

Image enhancement/generation workflows are being tested using combinations of:

- OpenAI
- n8n
- ComfyUI
- Piwigo

Future cost tracking should make it possible to see:

- generation count
- venue-level cost
- total cost
- average image cost

---

# Field capture

**DECIDED DIRECTION**

Pickyalo should eventually provide an extremely fast mobile workflow for capturing places while exploring a city.

Ideal interaction:

photo
→ GPS
→ category
→ optional note
→ save

Detailed editing can occur later.

---

# Exploration map

**EXPERIMENT**

A “fog of war” concept inspired by exploration games has been discussed.

Purpose:

show which areas have already been explored/captured.

Do not make this a prerequisite for the first field-capture MVP.

---

# Tourism/map strategy

**DECIDED**

The tourism/map layer is not intended to replace the primary food product.

Its strategic purposes are:

1. acquire additional visitors
2. create contextual discovery around the city
3. connect points of interest to nearby commerce
4. create B2B/B2G opportunities

---

# Institutional strategy

**DECIDED DIRECTION**

Potential partners:

- municipalities
- tourism bodies
- associations
- events
- local commerce organisations

This may become a significant independent revenue line.

---

# Catalogue trust

**DECIDED DIRECTION**

Pickyalo should progressively track:

- source
- verification method
- verification date
- freshness
- active status
- publication status

The platform should distinguish discovered information from verified information.

---

# Physical verification

**DECIDED DIRECTION**

On-site checks are a valid verification source.

Example verification metadata:

`Comprobado in situ el [fecha]`

GPS coordinates may be corrected manually.

---

# Business compliance

**OPEN / RESEARCH**

Pickyalo wants mechanisms to reduce the possibility of promoting illegitimate businesses.

The exact legal/document workflow has not been finalized.

Do not implement document retention before determining:

- what information is legally necessary
- what can simply be verified
- retention requirements
- GDPR implications

---

# Data freshness

**HIGH PRIORITY**

A major operational challenge is keeping information updated.

Areas include:

- business hours
- holiday hours
- temporary closures
- prices
- products
- events
- local festivities

Automation should be preferred where reliable.

---

# Content acquisition

**DECIDED DIRECTION**

Field data should be quick to capture.

The operator should not need to complete a long admin form while standing in front of a place.

Principle:

> Capture now, enrich later.

---

# SEO

**HIGH PRIORITY**

Pickyalo needs organic acquisition from both food and city discovery.

Pages should be designed so search engines can understand:

- city
- business
- dishes
- products
- places
- categories
- local context

Avoid hiding valuable public content behind client-only interactions.

---

# Physical brand

**DECIDED DIRECTION**

Pickyalo will also use physical materials.

Examples:

- zines
- flyers
- business presentations
- printed editorial material

Brand direction:

local + editorial + premium + gastronomic.

---

# Current brand palette

**DECIDED**

```text
Burgundy      #741314
Cream         #FDE3AD
Light cream   #FFF7E8
Dark brown    #24110E
Dark red      #5F0F10
Warm beige    #F6D99A
```

---

# Product philosophy

When designing features, optimize for:

**less friction**
→ **better data**
→ **more discovery**
→ **more value for local businesses**

Avoid building features purely because competitors have them.

---

# Architecture principle

Prefer a flexible shared model over one subsystem for every content type.

Before adding a table/service/component, ask:

> Can this be represented cleanly using an existing abstraction?

But do not force unrelated concepts into the same model just to reduce table count.

---

# Cost principle

Pickyalo is still in an early-stage validation phase.

Prefer:

- free tiers
- usage-based services
- existing infrastructure
- low operational overhead

Avoid infrastructure that creates fixed monthly costs without validated usage.

---

# Communication preference

Keep explanations and implementation reports short, practical and structured.

When work is completed, report:

1. what changed
2. important files
3. database changes
4. tests/checks
5. remaining issues

Avoid unnecessarily long explanations.

## 2026-09-29 — Panel de gestión accesible (DECIDED)

Manu pide recuperar el panel funcional anterior. Mantener visibles Inicio, Scout, Locales, Lugares, Explora, Contenido, Solicitudes y Ajustes, con acceso directo adicional a Imágenes. El inicio agrupa las herramientas existentes y conserva las métricas del catálogo. No volver a limitar la navegación a Fichas/Destacados/Horarios/Métricas. Esta decisión recupera accesos privados; no reactiva pedidos, pagos ni funcionalidades públicas congeladas.

## 2026-10-08 — Entrada compartida por clave (DECIDED)

Manu pide una capa de entrada lúdica con clave compartida antes de acceder a la web, conservando los enlaces. Implementada en `/entrada`, con validación del servidor, acceso recordado durante 30 días y destino original conservado. No sustituye la autenticación ni los permisos del panel. Configuración y límites en `docs/site-access.md`; sin desplegar.
