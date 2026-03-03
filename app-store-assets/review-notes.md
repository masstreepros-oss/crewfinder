# App Store Review Notes — CrewFinder

## Demo Account for Reviewers

**Email:** reviewer@crewfinder.com
**Password:** Cr3wF!nder_Rev2026

This account has pre-populated data for testing all features:
- Worker and business profiles with sample data
- Sample job listings (active and completed)
- Message threads with conversation history
- Ratings and reviews
- Equipment listings
- Storm board posts
- Calendar availability entries

## Feature Notes for Reviewers

### Voice Calling (Caller Portal)
The in-app voice calling feature is powered by Twilio WebRTC. This feature:
- Requires an active internet connection
- May not function in sandbox/review environments if Twilio services are restricted
- In production, allows businesses to call workers directly through the browser
- Calls are routed through Twilio's infrastructure (no direct phone number sharing)

### Subscription / Payments
- Subscription billing is handled via Stripe web checkout
- Per the U.S. District Court ruling on Apple v. Epic Games, we use an external payment processor for subscription management
- Workers can use the app for free — no payment required
- Business accounts require a subscription for premium features (unlimited messaging, caller portal, priority listing)
- Users can manage their subscription through the Stripe billing portal

### App Architecture
- CrewFinder is a Progressive Web App (PWA) wrapped with Capacitor for native distribution
- The app loads from https://crewfinder.pages.dev (hosted on Cloudflare Pages)
- Offline support is provided via service worker caching
- All data is stored in Supabase (PostgreSQL database with row-level security)

### Content & Moderation
- User-generated content includes: job listings, worker profiles, reviews, messages, work photos, equipment listings, storm board posts
- Content moderation is handled by admin users through the admin dashboard
- Admin can: view/edit/delete users, moderate reviews, manage companies, send announcements
- Reporting mechanisms allow users to flag inappropriate content

### Privacy & Data Handling
- Privacy Policy: https://crewfinder.pages.dev/privacy.html
- Terms of Service: https://crewfinder.pages.dev/terms.html
- Account deletion is available in-app (Settings > Delete My Account)
- Data handling complies with CCPA and GDPR requirements
- No data is sold to third parties

## App Category
- **Primary:** Business
- **Secondary:** Productivity

## Age Rating
- **Rating:** 4+ (no objectionable content)
- No gambling, contests, or simulated gambling
- No medical/treatment information
- No profanity or crude humor in app-provided content
- User-generated content is moderated

## App Store Metadata

### Title
CrewFinder - Tree Service Jobs

### Subtitle
Connect Crews & Companies

### Keywords (100 characters max)
tree service,arborist,tree crew,landscaping,jobs,hire,outdoor,trade,climber,hardscape,irrigation,work

### Description
CrewFinder is the #1 marketplace connecting tree service professionals with local businesses. Whether you're a skilled climber looking for work or a tree company needing reliable crews, CrewFinder makes it happen.

**For Workers:**
- Create your professional profile with skills, certifications, and work photos
- Browse tree service jobs in your area
- Set your availability and pay preferences
- Get hired by top tree service companies
- Free to join — no subscription required

**For Companies:**
- Find qualified, reliable tree service professionals
- Post jobs and manage your crew roster
- Message workers and make voice calls directly through the app
- Coordinate emergency storm damage response
- Buy and sell equipment in the marketplace
- Track crew availability with the calendar
- Subscription required for premium features

**Features:**
- Job board with real-time listings
- Professional profiles with ratings and reviews
- In-app messaging and voice calling
- Storm damage emergency crew coordination
- Equipment marketplace
- Crew availability calendar
- Industry news feed

### Short Description (Google Play — 80 chars)
Find tree service jobs & crews. Connect with arborists and outdoor trade pros.

### Support URL
https://crewfinder.pages.dev

### Privacy Policy URL
https://crewfinder.pages.dev/privacy.html

## Screenshots Needed

### iPhone 6.9" (1320x2868) — 5 screenshots:
1. **Home/Job Board** — Show the main job listing feed with active listings
2. **Worker Profile** — Show a worker profile with skills, ratings, and work photos
3. **Messaging** — Show a conversation thread between a worker and business
4. **Caller Portal** — Show the voice calling interface with call controls
5. **Storm Board** — Show the storm response coordination board

### iPad 13" (2064x2752) — Same 5 screens

### Google Play Phone (1080x1920) — Same 5 screens

### Feature Graphic (Google Play — 1024x500)
- CrewFinder logo on dark green (#0B1F14) background
- Tagline: "Connect Crews & Companies"
- Tree/outdoor trade imagery
