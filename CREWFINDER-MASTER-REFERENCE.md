# CrewFinder Master Reference Document

**Last Updated:** March 3, 2026
**Version:** 1.0
**Status:** Early Access / Live

---

## 1. PROJECT OVERVIEW

### Purpose
CrewFinder is an on-demand marketplace platform that connects tree service companies, landscapers, and outdoor trade workers with skilled laborers for short-term or on-demand work. Companies can post jobs and find workers; workers can build profiles and find work opportunities.

### Target Markets
- Tree Service
- Landscaping
- Hardscaping
- Irrigation
- Snow Removal
- Related outdoor trades

### Tech Stack
- **Frontend:** HTML5, CSS3, JavaScript (vanilla, no frameworks)
- **Backend:** Supabase (PostgreSQL + serverless functions)
- **Authentication:** Supabase Auth (email/password)
- **Real-time:** Supabase Realtime, Web Push Notifications, Service Worker
- **Deployment:** Netlify (static site hosting)
- **Voice/SMS:** Twilio (optional integration for voice calling)
- **External APIs:** Google Fonts, Supabase JS SDK v2, Twilio SDK
- **PWA:** Progressive Web App with offline-first caching

### Core Features
- Job posting and browsing
- Worker profile creation with skills/ratings
- On-demand hiring system
- Crew roster/saved workers
- Storm response board (emergency coordination)
- Equipment marketplace
- Industry news feed
- Crew calendar/availability tracking
- Rating system (two-way)
- Insurance document verification
- Voice calling (via Twilio)
- Push notifications

---

## 2. FILE INVENTORY

### Download Repo Location (CURRENT/MOST RECENT)
**Path:** `/sessions/gifted-cool-dijkstra/mnt/masstreepros/Downloads/crewfinder-repo/`

| File | Size | Type | Purpose | Last Modified |
|------|------|------|---------|----------------|
| **app.html** | 199 KB | Main App | Primary application interface (5,262 lines) | Feb 21 00:53 |
| **index.html** | 14 KB | Marketing | Public landing page (197 lines) | Feb 21 00:52 |
| **demo.html** | 37 KB | Demo | Interactive walkthrough/demo (1,008 lines) | Feb 21 00:52 |
| **admin.html** | 57 KB | Admin | Admin dashboard (1,131 lines) | Feb 21 00:52 |
| **app_1.html** | 168 KB | Backup | Older version of app (4,520 lines) | Feb 21 00:52 |
| **caller.html** | 30 KB | Twilio | Voice calling interface (689 lines) | Feb 21 00:52 |
| **calendar.html** | 17 KB | Feature | Crew calendar/availability (223 lines) | Feb 21 00:52 |
| **equipment.html** | 22 KB | Feature | Equipment marketplace (431 lines) | Feb 21 00:52 |
| **storm.html** | 18 KB | Feature | Storm/emergency board (221 lines) | Feb 21 00:52 |
| **news.html** | 13 KB | Feature | Industry news feed (186 lines) | Feb 21 00:52 |
| **waitlist.html** | 19 KB | Marketing | Waitlist signup form (217 lines) | Feb 21 00:52 |
| **sw.js** | 2.7 KB | Service Worker | Offline caching (103 lines) | Feb 21 00:52 |
| **manifest.json** | 538 B | Config | PWA manifest (25 lines) | Feb 21 00:52 |
| **netlify.toml** | 54 B | Deploy | Netlify config (2 lines) | Feb 21 00:52 |
| **icon-192.png** | 1.2 KB | Asset | App icon 192x192 | Feb 21 00:52 |
| **icon-512.png** | 3.8 KB | Asset | App icon 512x512 | Feb 21 00:52 |
| **files.zip** | 16 KB | Archive | Demo/sample files | Feb 21 00:52 |
| **files/** | — | Directory | Demo data directory | Feb 21 00:52 |

### Desktop Repo (OLDER COPY)
**Path:** `/sessions/gifted-cool-dijkstra/mnt/masstreepros/Desktop/crewfinder-repo/`

**Status:** Outdated (last sync Feb 20-21)
**Missing files:** calendar.html, news.html, storm.html (these are NOT in Desktop version)
**Last Modified:** Mar 2 15:56

### Supabase Backend
**Path:** `/sessions/gifted-cool-dijkstra/mnt/masstreepros/crewfinder-supabase/supabase/`

| File | Purpose |
|------|---------|
| **config.toml** | Supabase local dev configuration |
| **functions/twilio-token/index.ts** | Twilio JWT token generation (70 lines) |
| **functions/twilio-voice/index.ts** | Twilio voice webhook TwiML handler (34 lines) |

### Other Assets
- `/sessions/gifted-cool-dijkstra/mnt/masstreepros/Desktop/CrewFinder.png` - Logo (raster)
- `/sessions/gifted-cool-dijkstra/mnt/masstreepros/Downloads/crewfinder-tree-white.png` - Tree logo variant
- `/sessions/gifted-cool-dijkstra/mnt/masstreepros/Downloads/crewfinder-va-script.pdf` - VA script for calling

---

## 3. ARCHITECTURE MAP

### Page Navigation Flow

```
index.html (Public Landing)
├── Links to: /app.html, /waitlist.html, /demo.html
└── Hero sections, value props, storm feature showcase

demo.html (Interactive Demo)
└── Splash screen with role selection → navigates to app sections

app.html (Main Application Hub)
├── Role selector (Company vs Worker)
├── Job browsing/posting interface
├── Sidebar navigation (when sidebar expanded)
└── Bottom navigation bar (mobile)

Bottom Navigation Bar (All App Pages)
├── Jobs (app.html) - green icon
├── Calendar (calendar.html) - availability
├── Gear (equipment.html) - marketplace
├── Storm (storm.html) - emergency board
└── News (news.html) - industry updates

Feature Pages:
├── calendar.html - Crew availability calendar (Supabase: crew_availability)
├── equipment.html - Equipment marketplace (Supabase: equipment_listings)
├── storm.html - Emergency/storm board (Supabase: storm_board)
├── news.html - Industry news (Supabase: industry_news)
├── caller.html - Twilio voice calling (Supabase: call_log)
└── admin.html - Admin dashboard (TBD)

Other Pages:
├── waitlist.html - Email capture for launch notification
└── app_1.html - Older version (backup/reference)
```

### API & Data Flow

#### Frontend → Supabase
Each page directly queries Supabase tables using:
```javascript
const SUPABASE_URL = 'https://mhatwlmbwikvrlcgfojt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
```

**Note:** Supabase anon key is embedded in frontend code (not ideal for production)

#### External API Calls
- **Google Fonts:** CSS font import (Outfit family)
- **Twilio:** Voice calling via `caller.html` → Edge functions → Twilio API
- **Service Worker (sw.js):** Intercepts all GET requests, caches responses, skips Supabase API calls

### Service Worker Behavior (sw.js)
- **Cache Name:** `crewfinder-v1`
- **Network-first strategy:** Try network, fall back to cache
- **Supabase Bypass:** All `supabase.co` requests skip caching
- **Push notifications:** Listen for push events, display notifications
- **Notification click handler:** Route to `/app.html` or custom URL

---

## 4. SUPABASE TABLES & SCHEMA

All tables are in Supabase project: `mhatwlmbwikvrlcgfojt`

### Table: `profiles`
**Purpose:** User account information
**Columns (inferred):**
- id (UUID, primary)
- email
- full_name
- user_type (`'worker'` | `'company'`)
- avatar_url
- location (string, city/state)
- bio
- phone
- website
- created_at
- updated_at

### Table: `jobs`
**Purpose:** Job postings
**Columns (inferred):**
- id (UUID)
- posted_by (UUID, foreign key to profiles)
- title
- description
- location
- job_type (hourly, day_rate, contract)
- pay_min, pay_max
- skills_needed (array of strings)
- is_active (boolean)
- status (`'open'` | `'in_progress'` | `'completed'`)
- created_at
- updated_at

### Table: `job_responses`
**Purpose:** Worker responses to jobs
**Columns (inferred):**
- id (UUID)
- job_id (UUID, FK)
- worker_id (UUID, FK)
- response_message
- status (`'pending'` | `'accepted'` | `'rejected'`)
- created_at

### Table: `profiles` / `worker_profiles`
**Purpose:** Detailed worker profiles
**Columns (inferred):**
- worker_id (UUID, FK)
- skills (array of strings)
- certifications (array: ISA Arborist, CDL-A, OSHA 30, etc.)
- hourly_rate, day_rate
- availability (boolean or availability_status)
- insurance_verified (boolean)
- insurance_doc_url

### Table: `saved_workers` / `crew_roster`
**Purpose:** Companies saving favorite workers
**Columns (inferred):**
- id (UUID)
- company_id (UUID, FK to profiles)
- worker_id (UUID, FK to profiles)
- notes
- created_at

### Table: `reviews` / `ratings`
**Purpose:** Two-way rating system
**Columns (inferred):**
- id (UUID)
- from_user_id (UUID, FK)
- to_user_id (UUID, FK)
- rating (1-5 stars)
- review_text
- job_id (UUID, optional FK)
- created_at

### Table: `crew_availability`
**Purpose:** Calendar availability posts (calendar.html)
**Columns (actual from code):**
- id (UUID)
- display_name
- user_type (`'worker'` | `'company'`)
- date (YYYY-MM-DD)
- status (`'available'` | `'busy'` | `'booked'` | `'storm_ready'`)
- time_preference (`'morning'` | `'afternoon'` | `'full_day'` | `'flexible'`)
- location
- hourly_rate (nullable, number)
- notes
- created_at

### Table: `equipment_listings`
**Purpose:** Equipment marketplace (equipment.html)
**Columns (actual from code):**
- id (UUID)
- title
- description
- category (`'chipper'` | `'chainsaw'` | `'bucket_truck'` | `'log_truck'` | `'stump_grinder'` | `'crane'` | `'safety_gear'` | `'rigging'` | `'trailer'` | `'skid_steer'` | `'other'`)
- condition (`'new'` | `'like_new'` | `'good'` | `'fair'` | `'parts_only'`)
- price (numeric)
- price_type (`'fixed'` | `'obo'` | `'trade'` | `'free'`)
- seller_name
- seller_type (`'company'` | `'worker'`)
- phone
- email
- location
- is_sold (boolean)
- views (numeric)
- created_at

### Table: `storm_board`
**Purpose:** Emergency/storm response coordination (storm.html)
**Columns (actual from code):**
- id (UUID)
- title
- description
- post_type (`'storm_need'` | `'storm_available'` | `'subcontract_need'` | `'subcontract_available'`)
- urgency (`'normal'` | `'urgent'` | `'emergency'`)
- poster_name
- poster_type (`'company'` | `'worker'`)
- location
- crew_needed (integer)
- start_date (nullable date)
- end_date (nullable date)
- pay_rate
- phone
- email
- equipment_needed (array of strings)
- is_active (boolean)
- responses_count (integer)
- created_at

### Table: `industry_news`
**Purpose:** Industry news feed (news.html)
**Columns (actual from code):**
- id (UUID)
- title
- summary
- content
- category (`'safety'` | `'equipment'` | `'business'` | `'weather'` | `'regulations'` | `'training'` | `'events'` | `'general'`)
- source_name
- source_url
- is_featured (boolean)
- published_at (datetime)
- created_at

### Table: `skills`
**Purpose:** Skill master list
**Columns (inferred):**
- id (UUID)
- name (e.g., "Climbing", "Rigging", "CDL-A")
- category (e.g., "tree_service", "landscaping", "certification")
- icon (optional emoji)

### Table: `job_skills`
**Purpose:** Relationship between jobs and skills
**Columns (inferred):**
- id (UUID)
- job_id (UUID, FK)
- skill_id (UUID, FK)

### Table: `worker_skills`
**Purpose:** Relationship between workers and skills
**Columns (inferred):**
- id (UUID)
- worker_id (UUID, FK)
- skill_id (UUID, FK)
- proficiency_level (`'beginner'` | `'intermediate'` | `'expert'`)

### Table: `insurance-docs` / `work-photos` / `work_photos`
**Purpose:** File storage references
**Usage:** Store URLs to Supabase Storage files

### Table: `call_log`
**Purpose:** Twilio call history
**Columns (inferred):**
- id (UUID)
- from_user_id (UUID, FK)
- to_phone
- call_type
- duration_seconds
- status (`'completed'` | `'missed'` | `'failed'`)
- created_at

### Table: `messages`
**Purpose:** In-app messaging between users
**Columns (inferred):**
- id (UUID)
- from_user_id (UUID, FK)
- to_user_id (UUID, FK)
- message_text
- read (boolean)
- created_at

### Table: `push_subscriptions`
**Purpose:** Web push notification subscriptions
**Columns (inferred):**
- id (UUID)
- user_id (UUID, FK)
- subscription_endpoint (URL)
- auth_key
- p256dh_key
- created_at

### Table: `avatars`
**Purpose:** User profile photos
**Usage:** References to Supabase Storage files

### Table: `unclaimed_businesses`
**Purpose:** Auto-created business profiles
**Columns (inferred):**
- id (UUID)
- business_name
- location
- created_at

---

## 5. API ENDPOINTS & EXTERNAL CALLS

### Supabase REST API Endpoints
All queries use the Supabase JS SDK, which translates to REST calls to:
```
https://mhatwlmbwikvrlcgfojt.supabase.co/rest/v1/[table]
```

#### Example Patterns:
```javascript
// SELECT
sb.from('jobs').select('*').eq('is_active', true).order('created_at', { ascending: false })

// INSERT
sb.from('jobs').insert([jobData])

// UPDATE
sb.from('jobs').update({ status: 'completed' }).eq('id', jobId)

// DELETE
sb.from('jobs').delete().eq('id', jobId)
```

### Twilio Integration
**Project:** CrewFinder Supabase
**Edge Functions Location:** `/supabase/functions/`

#### 1. `twilio-token` Function
**Path:** `functions/twilio-token/index.ts`
**Purpose:** Generate JWT access token for Twilio Voice
**Endpoint:** `https://mhatwlmbwikvrlcgfojt.supabase.co/functions/v1/twilio-token`
**Method:** POST
**Request Body:**
```json
{
  "identity": "user-id-or-phone"
}
```
**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```
**Environment Variables Required:**
- `TWILIO_ACCOUNT_SID`
- `TWILIO_API_KEY_SID`
- `TWILIO_API_KEY_SECRET`
- `TWILIO_TWIML_APP_SID`

#### 2. `twilio-voice` Function
**Path:** `functions/twilio-voice/index.ts`
**Purpose:** TwiML response for inbound calls
**Endpoint:** `https://mhatwlmbwikvrlcgfojt.supabase.co/functions/v1/twilio-voice`
**Method:** POST
**Request Body:** Form data with `To` field (phone number)
**Response:** TwiML XML with Dial instruction

### External APIs
- **Google Fonts:** `https://fonts.googleapis.com/css2?family=Outfit:...`
- **Supabase JS SDK:** CDN via `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
- **Twilio Programmable Voice SDK:** (referenced in caller.html)

---

## 6. AUTHENTICATION FLOW

### Current Implementation
- **Auth Provider:** Supabase Auth (built-in)
- **Credentials:** Email + password
- **Session Management:** JWT tokens stored in localStorage

### Auth Flow (Implied from Code Structure)
1. User visits `index.html` or `demo.html`
2. Splash screen prompts: "I'm a Company" or "I'm a Worker"
3. Redirects to `app.html` with role selection
4. User can browse jobs without signup OR
5. User must sign up/log in to post, respond, or save
6. Supabase Auth handles credential validation
7. JWT token stored, used for all subsequent API calls

### Auth Persistence
- Tokens stored in browser localStorage
- Service Worker (`sw.js`) does NOT intercept auth requests
- Page refresh maintains login state via localStorage

### Anonymous Access
- Config suggests: `enable_anonymous_sign_ins = false` (disabled)
- All users must create accounts

---

## 7. FEATURE MATRIX

| Feature | Page | Status | Tech | Details |
|---------|------|--------|------|---------|
| **Job Browsing** | app.html | Live | JS + Supabase | Filter, search, sort jobs |
| **Job Posting** | app.html | Live | JS + Supabase | Post with title, desc, pay, skills |
| **Worker Profile** | app.html | Live | JS + Supabase | Skills, rate, certs, insurance |
| **Crew Roster** | app.html | Live | JS + Supabase | Save favorite workers, notes |
| **Ratings/Reviews** | app.html | Live | JS + Supabase | 2-way 5-star rating system |
| **Calendar/Availability** | calendar.html | Live | JS + Supabase | Post availability, filter by date/status |
| **Storm Board** | storm.html | Live | JS + Supabase | Emergency posts, urgency levels |
| **Equipment Marketplace** | equipment.html | Live | JS + Supabase | Buy/sell used equipment |
| **Industry News** | news.html | Live | JS + Supabase | Curated news, category filters |
| **Messaging** | app.html | Partial | JS + Supabase | In-app messaging (table exists) |
| **Voice Calling** | caller.html | Partial | Twilio + Supabase | Twilio Programmable Voice |
| **Push Notifications** | sw.js | Partial | Web Push API | Browser notifications via service worker |
| **Admin Dashboard** | admin.html | TBD | JS | Moderation, analytics (content unclear) |
| **Insurance Verification** | app.html | Implied | JS + Supabase | Document upload, visual badge |
| **PWA/Offline** | All | Live | Service Worker | Works offline, installable |
| **Waitlist** | waitlist.html | Live | JS | Email capture form |
| **Responsive Design** | All | Live | CSS3 | Mobile-first design (430px app width) |

---

## 8. TWILIO INTEGRATION STATUS

### Current State
- **Status:** Partially Integrated
- **Voice Calling:** Edge functions ready, but frontend integration may be incomplete
- **Caller.html:** Exists with Twilio SDK reference, needs verification

### Twilio Setup (Inferred)
- **Account SID:** Required (not visible in code)
- **API Key:** Auth via key/secret pair
- **TwiML App:** Configured for voice application
- **Phone Number:** `+15089781249` (hardcoded in twilio-voice function)

### Workflow
1. User initiates call from `caller.html`
2. Frontend requests token from `twilio-token` edge function
3. Edge function signs JWT with credentials
4. Token returned to frontend
5. Frontend uses token to connect to Twilio Voice Client
6. Incoming calls route to `twilio-voice` function
7. TwiML response dials specified number

### Known Issues / Gaps
- Twilio account credentials not visible in codebase
- Frontend implementation in `caller.html` needs review
- Call logging feature exists but not fully documented

---

## 9. KNOWN ISSUES & GAPS

### Security Issues
1. **Supabase Anon Key Exposed:** Public API key embedded in all frontend files
   - **Impact:** Anyone with developer tools can make API calls
   - **Recommendation:** Move to private API or use proper backend auth

2. **Phone Number Hardcoded:** Caller ID `+15089781249` in twilio-voice function
   - **Impact:** All outbound calls appear to be from this number
   - **Recommendation:** Make configurable per user/company

### Feature Gaps
1. **Admin Dashboard:** `admin.html` exists but content/functionality unclear
2. **Messaging System:** Table exists (`messages`) but UI not fully implemented in main app
3. **Voice Calling:** Partial integration, unclear if frontend calling works
4. **Push Notifications:** Infrastructure in place (sw.js) but implementation in app unclear
5. **Insurance Verification:** Process not visible in code (table exists but workflow unclear)

### Technical Debt
1. **Large HTML Files:** `app.html` (5,262 lines) and `app_1.html` (4,520 lines) are extremely large
   - **Recommendation:** Break into components or use framework

2. **No Build Step:** Pure HTML/CSS/JS, no minification or bundling
   - **Recommendation:** Add build process for production

3. **Inline Styles:** All CSS inline or in `<style>` tags, no external stylesheet
   - **Recommendation:** Extract to external CSS file

4. **No Version Control Strategy:** Two versions of app.html (app.html, app_1.html)
   - **Recommendation:** Use git branches instead

5. **No Error Handling:** Minimal try/catch blocks, mostly silent failures
   - **Recommendation:** Add error boundaries and user feedback

### Missing Documentation
- No API documentation
- No component documentation
- No database schema documentation (has to be inferred)
- No deployment docs
- No contribution guidelines

---

## 10. DUPLICATE ANALYSIS: DESKTOP VS. DOWNLOADS

### Downloads Repo (Current/Most Complete)
- **Path:** `/sessions/gifted-cool-dijkstra/mnt/masstreepros/Downloads/crewfinder-repo/`
- **Last Modified:** Feb 21 00:52-00:53
- **Status:** PRIMARY - USE THIS COPY

### Desktop Repo (Outdated)
- **Path:** `/sessions/gifted-cool-dijkstra/mnt/masstreepros/Desktop/crewfinder-repo/`
- **Last Modified:** Feb 20 23:55 and Mar 2 15:56
- **Status:** BACKUP/OUTDATED

### Key Differences

| File | Downloads | Desktop | Notes |
|------|-----------|---------|-------|
| app.html | 199 KB | 198 KB | Nearly identical |
| app_1.html | 168 KB | 168 KB | Identical |
| calendar.html | **EXISTS (17 KB)** | MISSING | Newer feature |
| news.html | **EXISTS (13 KB)** | MISSING | Newer feature |
| storm.html | **EXISTS (18 KB)** | MISSING | Newer feature |
| equipment.html | 22 KB | 17 KB | Feb 21 update on Downloads |
| Other files | All present | All present | Matching sizes |

### Action Items
1. **DELETE** Desktop repo copy (outdated)
2. **USE** Downloads repo as source of truth
3. **BACKUP** Downloads repo to version control

---

## 11. ASSET INVENTORY

### Icons & Logos
| Asset | Location | Size | Format | Purpose |
|-------|----------|------|--------|---------|
| **icon-192.png** | `/Downloads/crewfinder-repo/` | 1.2 KB | PNG | PWA icon 192x192 |
| **icon-512.png** | `/Downloads/crewfinder-repo/` | 3.8 KB | PNG | PWA icon 512x512 |
| **CrewFinder.png** | `/Desktop/` | ? | PNG | Logo (raster) |
| **crewfinder-tree-white.png** | `/Downloads/` | ? | PNG | Tree logo variant |

### SVG Assets (Inline)
All icons are inline SVG, no external SVG files:
- Navigation icons (Jobs, Calendar, Gear, Storm, News)
- Status indicators (available, busy, storm-ready)
- UI icons (phone, location, time, ratings, etc.)

### Fonts
- **Google Fonts:** Outfit family
  - Weights: 400, 500, 600, 700, 800, 900
  - CDN: `https://fonts.googleapis.com/css2?family=Outfit:wght@...`

### PDF Assets
- **crewfinder-va-script.pdf** - Virtual Assistant calling script (documentation)

### Demo/Sample Files
- **files.zip** - Demo data files (16 KB)
- **files/** - Directory for demo data

### Colors (Design System)
```css
--forest: #0B1F14
--forest-mid: #1A3C2A
--green: #2D7A3A
--lime: #5CB85C
--light-green: #D4EDDA
--pale-green: #F0FAF0
--white: #FFFFFF
--gray-100: #F7F7F7
--gray-200: #E8E8E8
--gray-500: #888
--gray-800: #333
--dark: #1A1A1A
```

---

## 12. DEPLOYMENT & CONFIGURATION

### Current Deployment
- **Host:** Netlify (static site)
- **Config File:** `netlify.toml` (minimal, no build step)
- **Build Command:** None (static HTML)
- **Publish Directory:** Root (`/`)

### Environment Configuration
- **Supabase URL:** `https://mhatwlmbwikvrlcgfojt.supabase.co`
- **Supabase Anon Key:** Embedded in code (not ideal)
- **Twilio Credentials:** Set in Supabase edge functions (via secrets)

### Service Worker
- **Cache Name:** `crewfinder-v1`
- **Offline URL:** `/app.html`
- **Cached on Install:** Google Fonts stylesheet only
- **Cache Strategy:** Network-first (try network, fallback to cache)

### PWA Manifest
- **Name:** CrewFinder
- **Short Name:** CrewFinder
- **Start URL:** `/app.html`
- **Display:** `standalone` (full-screen app mode)
- **Theme Color:** `#1A3C2A`
- **Background Color:** `#0B1F14`

---

## 13. DEVELOPMENT NOTES

### Code Organization
```
/sessions/gifted-cool-dijkstra/mnt/masstreepros/
├── Downloads/crewfinder-repo/           [CURRENT - USE THIS]
│   ├── *.html                           [All page files]
│   ├── sw.js                            [Service worker]
│   ├── manifest.json                    [PWA manifest]
│   ├── netlify.toml                     [Deploy config]
│   ├── icon-*.png                       [App icons]
│   ├── files/                           [Demo data]
│   └── files.zip                        [Compressed demo]
│
├── Desktop/crewfinder-repo/             [OUTDATED - IGNORE]
│
├── crewfinder-supabase/                 [BACKEND]
│   └── supabase/
│       ├── config.toml                  [Local dev config]
│       └── functions/
│           ├── twilio-token/
│           │   └── index.ts             [JWT generation]
│           └── twilio-voice/
│               └── index.ts             [TwiML webhook]
│
├── Desktop/CrewFinder.png               [Logo asset]
└── Downloads/crewfinder-*.png           [Logo variants]
```

### Page Size Analysis
- **app.html:** 5,262 lines (199 KB) - VERY LARGE
- **app_1.html:** 4,520 lines (168 KB) - Backup
- **index.html:** 197 lines (14 KB) - Landing page
- **demo.html:** 1,008 lines (37 KB) - Interactive demo
- **admin.html:** 1,131 lines (57 KB) - Admin panel
- **caller.html:** 689 lines (30 KB) - Twilio integration
- **calendar.html:** 223 lines (17 KB) - Availability calendar
- **equipment.html:** 431 lines (22 KB) - Equipment marketplace
- **storm.html:** 221 lines (18 KB) - Storm board
- **news.html:** 186 lines (13 KB) - News feed
- **waitlist.html:** 217 lines (19 KB) - Email signup
- **sw.js:** 103 lines (2.7 KB) - Service worker

### Database Schema Inference
The codebase references these tables via `.from('table_name')` queries:
- Confirmed: 20+ tables exist in Supabase
- Documentation: None available; inferred from code
- Schema files: None found in repo

---

## 14. QUICK REFERENCE: SUPABASE TABLES BY FEATURE

### Job Marketplace (Core)
- `jobs` - Job postings
- `job_responses` - Worker applications
- `job_skills` - Job skill requirements
- `profiles` - User accounts
- `worker_skills` - Worker skill inventory
- `reviews` - Ratings/reviews
- `saved_workers` - Crew roster
- `messages` - Messaging
- `call_log` - Voice call history

### Calendar Feature
- `crew_availability` - Availability posts

### Equipment Marketplace
- `equipment_listings` - Equipment for sale

### Storm/Emergency Board
- `storm_board` - Emergency/storm posts

### News Feed
- `industry_news` - Industry news articles

### Infrastructure
- `push_subscriptions` - Web push subscriptions
- `avatars` - User profile photos
- `insurance-docs` - Insurance documents
- `work_photos` / `work-photos` - Work portfolio
- `skills` - Master skill list
- `unclaimed_businesses` - Auto-created business profiles

---

## 15. SUPABASE CONFIGURATION (config.toml Details)

### Key Settings
- **Project ID:** `crewfinder-supabase`
- **Database Version:** PostgreSQL 17
- **API Port:** 54321
- **Database Port:** 54322
- **Max Rows:** 1000 (API limit)
- **Auth JWT Expiry:** 3600 seconds (1 hour)
- **Allow Signups:** Enabled
- **Anonymous Signins:** Disabled
- **Email Confirmations:** Disabled
- **SMS Provider:** Twilio (configured but disabled)
- **Edge Functions:** Enabled with Deno v2

---

## 16. DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] Replace embedded Supabase anon key with environment variables
- [ ] Enable Row Level Security (RLS) on all Supabase tables
- [ ] Set up proper CORS headers
- [ ] Configure Twilio credentials as Supabase secrets
- [ ] Enable email verification in Supabase Auth config
- [ ] Set up real email provider (SendGrid, AWS SES, etc.)
- [ ] Add error logging/monitoring (Sentry, Datadog, etc.)
- [ ] Add analytics (Mixpanel, Plausible, etc.)
- [ ] Remove `app_1.html` and old code
- [ ] Minify CSS/JS for production
- [ ] Test PWA offline mode thoroughly
- [ ] Set up staging environment
- [ ] Document API endpoints
- [ ] Create database backup strategy
- [ ] Set up CI/CD pipeline
- [ ] Configure Netlify environment variables
- [ ] Test all Twilio features
- [ ] Set up push notification messaging service
- [ ] Create admin user roles
- [ ] Document deployment process

---

## 17. RESOURCES & LINKS

### Supabase Documentation
- **Supabase Project:** `https://mhatwlmbwikvrlcgfojt.supabase.co`
- **Supabase Docs:** https://supabase.com/docs
- **Edge Functions:** https://supabase.com/docs/guides/functions
- **Auth:** https://supabase.com/docs/guides/auth

### Twilio Documentation
- **Voice Docs:** https://www.twilio.com/docs/voice
- **TwiML:** https://www.twilio.com/docs/voice/twiml
- **Programmable Voice Client:** https://www.twilio.com/docs/voice/sdks/javascript

### Technology Stack
- **MDN Web Docs:** https://developer.mozilla.org
- **Service Worker API:** https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- **Web Push Notifications:** https://developer.mozilla.org/en-US/docs/Web/API/Push_API
- **Netlify Docs:** https://docs.netlify.com

---

## 18. CONTACT & MAINTENANCE

**Project Owner:** CrewFinder (Medway, MA based tree service company)
**Last Verified:** March 3, 2026
**Maintainer:** [To be determined]

### Key Contacts
- Email: [Not provided in docs]
- Website: [Not provided in docs]

### Known Issues to Track
1. [ ] app.html too large - needs refactoring
2. [ ] Supabase key exposure - needs fixing
3. [ ] Twilio credentials - verify setup
4. [ ] Admin dashboard - clarify purpose
5. [ ] Messaging UI - complete implementation

---

## 19. VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Mar 3, 2026 | Initial consolidated reference document |

---

**END OF DOCUMENT**

This reference document consolidates all CrewFinder project files and architecture into a single source of truth. Use this as the starting point for any new work on the project.
