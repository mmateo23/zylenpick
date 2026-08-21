# Pickyalo — Project Memory

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