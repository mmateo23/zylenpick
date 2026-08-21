# Pickyalo — Agent Instructions

## 1. Purpose

You are working on **Pickyalo**, a local discovery platform focused primarily on real food, dishes and nearby businesses.

Your job is not only to write code. You must preserve the product vision, simplify the system, avoid unnecessary complexity and help move Pickyalo toward a usable and scalable product.

Before making significant product or architecture decisions, read:

1. `PROJECT_CONTEXT.md`
2. `MEMORY.md`
3. Existing code and database schema

Never assume the current implementation represents the intended final product.

---

## 2. Core product principle

Pickyalo should help a person quickly answer:

> “What can I eat or discover near me right now?”

The product should feel visual, local, fast and curated.

Food and actual dishes are the main acquisition and discovery layer.

The map expands the product into:

- local commerce
- tourism
- points of interest
- useful public services
- events
- routes
- collaborations with municipalities and associations

Do not turn Pickyalo into a generic Google Maps clone, Tripadvisor clone or restaurant review site.

---

## 3. Non-negotiable product rules

### Food first

Actual products and dishes should have more visual importance than venue logos or generic business listings.

### Real places

Content should represent real places, products or points that can be verified.

### No public review system

Pickyalo does not depend on public star ratings or open user reviews.

The intended model is based on:

- curation
- verification
- selected places
- useful information
- visual quality

### Local identity

The first operating area is **Talavera de la Reina and its surrounding comarca**.

Architecture must nevertheless allow expansion to other cities and regions.

### Simple for businesses

Businesses should not need to learn a complex back office to participate.

Prefer workflows where Pickyalo can:

- capture information
- import it
- verify it
- maintain it automatically
- request only the minimum required information from the business

---

## 4. Current technical stack

Main infrastructure:

- Next.js
- Vercel
- Supabase
- PostgreSQL
- Supabase RLS
- Cloudflare
- Resend
- PostHog

Image/content tooling being explored:

- n8n
- OpenAI image workflows
- local ComfyUI
- Piwigo

Do not introduce another infrastructure service unless there is a clear operational reason.

Always ask:

> Can the existing stack solve this cleanly?

before adding dependencies.

---

## 5. Existing product flow

Current MVP direction:

`/`
→ `/cities`
→ `/cities/[city]`
→ `/cities/[city]/venues/[venue]`
→ `/cart`
→ checkout
→ order confirmation

Orders contain:

- customer data
- selected items
- pickup time or ASAP
- notes
- ticket code
- order status

Current known order statuses include:

- `pending`
- `sent`
- `cancelled`

---

## 6. Important data concepts

Existing/known core entities include:

- `cities`
- `venues`
- `menu_items`
- `orders`
- `order_items`
- `profiles`
- `venue_memberships`

The product is expanding toward additional entities such as:

- places
- points of interest
- murals
- fountains
- viewpoints
- public services
- events
- routes
- verification records
- source records

Do not create duplicate concepts without checking the current schema first.

---

## 7. Price modes

Products may use:

- `fixed`
- `from`
- `variable`
- `hidden`

Do not assume every dish has a fixed price.

The UI must handle unknown or variable prices gracefully.

---

## 8. Map philosophy

The map is an important strategic layer but not a replacement for the core food discovery experience.

It can contain:

### Food
- restaurants
- bars
- bakeries
- takeaway
- gourmet shops
- traditional food shops

### Tourism
- monuments
- murals
- viewpoints
- interesting streets
- photo spots
- cultural locations

### Useful places
- public toilets
- water fountains
- shaded areas
- picnic tables
- accessibility-related points
- libraries

### Events
- fairs
- markets
- festivals
- sports events
- temporary activities

The map can later support B2B/B2G agreements with:

- municipalities
- tourism departments
- associations
- event organisers
- commercial districts

---

## 9. Field capture

A major Pickyalo workflow is collecting information while walking or cycling around a city.

The desired interaction should be close to:

1. Take a photo.
2. Capture GPS automatically.
3. Identify/classify the place.
4. Add an optional voice or text note.
5. Save.
6. Enrich later automatically.

Think of the experience as a lightweight exploration/capture tool rather than a traditional admin form.

A concept similar to “fog of war” may eventually show explored and unexplored areas.

Keep the first version extremely simple.

---

## 10. Verification

Places may contain verification information such as:

- verification method
- coordinates
- GPS precision
- manually corrected location
- verification date
- source
- specific services
- accessibility
- active/inactive state
- publication state
- candidate state
- visual ordering

Do not invent verified facts.

Maintain a distinction between:

- discovered
- candidate
- verified
- published
- inactive

---

## 11. Content quality

Descriptions should be factual, useful and concise.

Do not generate generic tourism filler.

For a point of interest, useful fields may include:

- what it is
- why it is relevant
- access
- location
- accessibility
- services
- verification
- practical notes

For food, emphasize:

- actual dish
- visual appeal
- price when known
- collection availability
- business
- practical ordering information

---

## 12. Business model considerations

Pickyalo may monetize through several complementary lines.

Examples:

- free business presence
- enhanced listings
- premium product presentation
- image enhancement
- highlighted products
- sponsored discovery
- commercial campaigns
- municipal agreements
- tourism agreements
- event integrations
- local association agreements

Do not design the core UX around advertising.

User value comes first.

---

## 13. Working style

When modifying the project:

1. Inspect the existing implementation.
2. Identify what already exists.
3. Prefer modifying over duplicating.
4. Keep changes small and reversible.
5. Avoid premature architecture.
6. Preserve mobile usability.
7. Preserve SEO.
8. Preserve accessibility.
9. Validate database/RLS implications.
10. Run relevant checks before declaring work complete.

---

## 14. Product decision rule

When several approaches are technically valid, prioritize:

1. simpler user experience
2. less manual administration
3. less infrastructure
4. lower operating cost
5. easier expansion to another city
6. higher quality data
7. easier verification

---

## 15. Agent behaviour

Do not blindly implement every idea as a new feature.

If an idea can be solved through:

- an existing model
- a new field
- automation
- a view
- a lightweight workflow

prefer that over creating another subsystem.

Protect Pickyalo from feature creep.

The objective is to make the product progressively more useful, not progressively more complicated.