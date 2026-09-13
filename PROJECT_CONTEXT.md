# Pickyalo — Project Context

## What is Pickyalo?

**Pickyalo** is a local discovery product being developed initially in **Talavera de la Reina**.

Its central idea is to make nearby food and local places easier to discover through a highly visual experience.

Instead of starting from:

> restaurant → menu → dish

Pickyalo can start from:

> dish → desire → nearby place

The actual product is often the discovery unit.

---

# Product vision

Pickyalo wants to become a curated digital layer over a city.

It can connect:

**people → food → businesses → places → city**

The long-term value is not merely maintaining a directory.

The valuable asset is a structured, verified and continuously updated local dataset.

---

# Core food experience

The strongest current product direction is displaying actual dishes and products.

Examples:

- tortilla
- paella
- bocadillos
- roast chicken
- pastries
- traditional sweets
- takeaway dishes
- bakery products
- gourmet products

A user should be able to discover something visually and then understand:

- where it is
- how much it costs
- whether it can be collected
- when the business is open
- how to get there

---

# Commerce

Pickyalo aims to help small businesses gain visibility without forcing them to radically change how they operate.

Target businesses include:

- bars
- restaurants
- takeaway businesses
- bakeries
- pastry shops
- gourmet stores
- traditional shops
- local food businesses

The commercial message is approximately:

> The business stays where it is. Pickyalo moves its shop window in front of more people.

---

# Initial market

Pilot city:

**Talavera de la Reina, Toledo, Spain**

The broader opportunity should be treated as:

**Talavera + comarca**

Small surrounding towns may use a simpler version of the same local/business data model.

Architecture should not hardcode Talavera-specific assumptions.

---

# Existing pilot businesses

Known businesses used during development include:

- La Comida de los Dados
- Casco Viejo Bar & Kitchen
- Taberna Plaza Mayor

These are useful as realistic test cases.

Do not interpret them as the complete production catalogue.

---

# Discovery + ordering

Current MVP includes a lightweight collection ordering flow.

Concept:

1. discover dish
2. inspect venue
3. add product
4. choose collection
5. submit contact information
6. venue receives order
7. user receives a ticket/confirmation

The objective is not to build a complex delivery marketplace.

Collection should remain operationally simple.

---

# Current infrastructure

## Frontend / app

Next.js deployed through Vercel.

## Database

Supabase / PostgreSQL.

RLS is used and must be considered whenever changing the data model.

## Email

Resend.

## DNS / network

Cloudflare.

## Analytics

PostHog.

## Images / automation

Several workflows are being evaluated or used:

- Piwigo
- n8n
- OpenAI image processing
- local ComfyUI

Image workflows should eventually allow measuring:

- number of generated images
- generation cost
- average cost per image
- cost per venue

---

# Local operations

A significant part of the project is building the local dataset.

This means physically visiting areas and recording:

- businesses
- products
- murals
- monuments
- fountains
- viewpoints
- services
- accessibility
- photo spots
- useful infrastructure

The desired field workflow should be usable from a phone while walking or cycling.

Speed is more important than entering every detail immediately.

Capture first. Enrich later.

---

# Place model

A place can have a functional role.

Examples:

- primary destination
- support
- useful service
- tourism
- cultural interest
- commercial
- food
- event

A point should normally only appear publicly when appropriate publication conditions are satisfied.

Known concepts include:

- active
- published
- candidate
- verified

Coordinates can come from GPS and later be manually adjusted.

---

# Example place metadata

A captured place may contain:

## Location

- latitude
- longitude
- GPS accuracy
- manually corrected point
- area instead of point

## Verification

- verification method
- verification note
- verification date
- source

## Services

Example:

- tables
- shade
- water source
- adapted access

## Display

- visual order
- role
- active state

---

# Map expansion

The map opens a second strategic layer for Pickyalo.

It allows Pickyalo to serve people who are not explicitly searching for food but are exploring a city.

Example journey:

**monument**
→ nearby mural
→ nearby local product
→ nearby bar
→ dish
→ collection/order

This creates additional acquisition paths into the food product.

---

# Institutional opportunity

The map also creates a B2B/B2G business line.

Potential partners include:

- municipalities
- tourism offices
- business associations
- local commerce associations
- event organisers
- cultural organisations
- sports events

Possible future products include:

- curated city maps
- food routes
- event maps
- local shopping routes
- tourism discovery
- verified services
- sponsored routes
- temporary event experiences

---

# Data trust

Pickyalo should differentiate between information that is:

- imported
- discovered
- business-provided
- automatically inferred
- manually reviewed
- physically verified

This provenance should eventually make maintaining the catalogue easier and increase trust.

---

# Business verification

One future challenge is ensuring businesses presented as commercial establishments are legitimate and operating correctly.

Potential information/document workflows may include checking:

- business identity
- operating information
- licensing-related information when applicable
- food/activity documentation where appropriate
- source of information
- verification dates

The system should not unnecessarily collect sensitive documents.

Prefer confirmation of compliance or metadata when retaining the complete document is unnecessary.

---

# Keeping information updated

Pickyalo needs mechanisms for detecting changes in:

- schedules
- holidays
- temporary closures
- menu prices
- products
- contact information
- business status
- local festivities
- events

Long term, updates should combine:

- automation
- external sources
- business confirmation
- user/operator verification
- freshness timestamps

Every important field should eventually have a concept of source and freshness where useful.

---

# Brand

Current Pickyalo palette includes:

- `#741314`
- `#FDE3AD`
- `#FFF7E8`
- `#24110E`
- `#5F0F10`
- `#F6D99A`

The intended visual direction is:

- local
- editorial
- premium but approachable
- gastronomic
- contemporary
- carefully curated

Avoid generic SaaS aesthetics where possible.

---

# Marketing

Current physical/editorial experiments include:

- flyers
- A4 printed material
- small-format zines
- business acquisition material
- local product photography

Pickyalo should feel like something that belongs to the physical city, not only to the web.

---

# SEO

Organic discovery is strategically important.

Important query families include searches such as:

- where to eat in Talavera
- restaurants in Talavera de la Reina
- takeaway food
- specific dishes
- local products
- things to see in Talavera
- nearby monuments
- tourism and local discovery

Product pages, venue pages, city pages and map/place pages should therefore remain indexable where appropriate.

---

# Strategic flywheel

A simplified Pickyalo flywheel is:

**capture local data**
→ **publish useful discovery**
→ **gain visitors**
→ **send visibility/customers to businesses**
→ **sign more businesses and institutions**
→ **gain better local information**
→ **improve discovery**

The moat is progressively better local data and operations, not merely the frontend.