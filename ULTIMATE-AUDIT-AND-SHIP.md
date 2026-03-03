# CrewFinder: Ultimate Audit + App Store Ship Prompts

> **How to use:** Open a fresh Claude Opus session. Copy-paste ONE prompt per agent. Run Prompts 1–5 in parallel (they're independent). Then run Prompt 6 (verification). Then run Prompts 7–9 sequentially (app store packaging).
>
> Replace `[REPO_PATH]` with your actual repo path.

---

## PROMPT 1 — SECURITY FORTRESS (Write Fixes)

```
You are a senior security engineer performing a ZERO-TOLERANCE security audit and fix pass on CrewFinder at [REPO_PATH].

Read EVERY file. Fix EVERYTHING you find. Do NOT just report — apply fixes directly.

## XSS (Cross-Site Scripting)
- Every innerHTML assignment MUST use DOMPurify.sanitize()
- Every onclick="" that interpolates user data → replace with data-attributes + addEventListener
- Every template literal `${variable}` inside HTML strings → wrap in DOMPurify.sanitize()
- Every document.write() → remove entirely
- Every eval() → remove entirely
- Every img src= with user-controlled URLs → validate with safeUrl() function (must start with https:// or data: or /)
- Every href= with user data → validate no javascript: protocol
- Every window.open() with user data → validate URL

## Injection
- Every Supabase .eq() .like() .ilike() → ensure values are sanitized
- TwiML XML generation → escape all interpolated values with XML entity encoding
- Any SQL template strings → parameterize

## Authentication & Authorization
- Every page must check auth state on load (except index.html, waitlist.html, demo.html, 404.html, offline.html, privacy.html, terms.html)
- Admin page must whitelist specific email addresses
- Session tokens must not be logged to console
- No sensitive data in localStorage (move to sessionStorage or memory)
- Check that Supabase anon key is used (NOT service role key) in all frontend files

## CORS & Headers
- Edge functions: restrict Access-Control-Allow-Origin from "*" to ["https://crewfinder.pages.dev", "http://localhost:3000"]
- netlify.toml security headers:
  - Content-Security-Policy (script-src 'self' cdn sources; style-src 'self' 'unsafe-inline' fonts.googleapis.com; img-src 'self' data: https:; connect-src 'self' *.supabase.co wss://*.supabase.co)
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: camera=(), microphone=(self), geolocation=(self)
  - Strict-Transport-Security: max-age=31536000; includeSubDomains

## Rate Limiting
- Add client-side rate limiting to all form submissions (debounce, disable button after click)
- Add rate limiting comments/TODO for edge functions (server-side)

## Secrets Audit
- Grep for any hardcoded passwords, tokens, API keys that shouldn't be in source
- Verify Supabase anon key is the SAME across ALL files
- Verify no service role keys in frontend code
- Check for exposed Twilio credentials

## Subresource Integrity (SRI)
- All CDN script/link tags must have integrity= and crossorigin= attributes
- Generate SRI hashes for: DOMPurify, any Google Fonts, any other CDN resources

## Open Redirect Prevention
- Any window.location = userInput or window.open(userInput) → validate against whitelist
- Any <a href="${userInput}"> → validate protocol

Output a summary of every fix applied with file:line references.
```

---

## PROMPT 2 — SEO + STRUCTURED DATA + SOCIAL (Write Fixes)

```
You are an SEO specialist making CrewFinder at [REPO_PATH] rank #1 for "tree service jobs" and related keywords.

Read EVERY .html file and apply ALL fixes.

## Meta Tags (EVERY page must have ALL of these)
- <html lang="en">
- <meta charset="UTF-8">
- <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
- <meta name="description" content="[unique 150-160 char description per page]">
- <meta name="keywords" content="[relevant keywords: tree service, arborist, crew, jobs, etc.]">
- <link rel="canonical" href="https://crewfinder.pages.dev/[page]">
- <meta name="robots" content="index, follow"> (except admin.html, caller.html → "noindex, nofollow")
- <meta name="author" content="CrewFinder">
- <meta name="theme-color" content="#0B1F14">

## Open Graph (EVERY page)
- og:type, og:site_name, og:title, og:description, og:url, og:image (use /icon-512.png as fallback)
- og:locale = "en_US"

## Twitter Cards (EVERY page)
- twitter:card = "summary_large_image"
- twitter:title, twitter:description, twitter:image

## Structured Data (JSON-LD)
Add to index.html:
- Organization schema (name, url, logo, description, sameAs social links)
- WebSite schema (name, url, potentialAction SearchAction)

Add to app.html:
- JobPosting schema template (will be dynamic, but add the base structure)

Add to equipment.html:
- Product schema template

## Sitemap.xml
Rewrite sitemap.xml to include ALL public pages with:
- Proper <priority> values (1.0 for index, 0.9 for app, 0.8 for features, 0.5 for legal)
- <changefreq> values
- <lastmod> dates
- Exclude: admin.html, caller.html, 404.html, offline.html

## Robots.txt
- Allow all public pages
- Disallow: /admin.html, /caller.html
- Sitemap: https://crewfinder.pages.dev/sitemap.xml

## Semantic HTML
- Ensure every page has exactly ONE <h1>
- Heading hierarchy: h1 → h2 → h3 (no skipping)
- Use <main>, <nav>, <footer>, <article>, <section>, <aside> where appropriate
- Add <header> and <footer> landmark elements

## Performance SEO
- Add <link rel="preconnect" href="https://fonts.googleapis.com">
- Add <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
- Add <link rel="dns-prefetch" href="https://mhatwlmbwikvrlcgfojt.supabase.co">
- Add loading="lazy" to all images below the fold
- Add fetchpriority="high" to hero/above-fold images
- Add <link rel="preload"> for critical fonts

## Favicon Set
Verify these exist (create if missing):
- /favicon.ico (from icon-192.png)
- <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
- <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
- <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
```

---

## PROMPT 3 — iOS/PWA + ACCESSIBILITY + PERFORMANCE (Write Fixes)

```
You are making CrewFinder at [REPO_PATH] score 95+ on Lighthouse across ALL categories.

Read EVERY file. Apply ALL fixes.

## iOS/PWA — EVERY .html file
- viewport: width=device-width, initial-scale=1.0, viewport-fit=cover (NO user-scalable=no)
- <meta name="apple-mobile-web-app-capable" content="yes">
- <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
- <meta name="apple-mobile-web-app-title" content="CrewFinder">
- <link rel="apple-touch-icon" href="/icon-192.png">
- <meta name="mobile-web-app-capable" content="yes">
- Safe-area CSS on body: padding with env(safe-area-inset-*)
- input/select/textarea font-size: 16px minimum (prevents iOS zoom)
- Service worker registration on EVERY page
- Add to homescreen prompt (beforeinstallprompt handler) on index.html

## Service Worker (sw.js)
- Cache ALL HTML pages (index, app, storm, calendar, equipment, news, admin, caller, demo, waitlist, 404, offline, privacy, terms)
- Cache ALL icons (icon-192.png, icon-512.png, favicon.ico)
- Cache critical CSS/fonts
- Implement stale-while-revalidate for HTML pages
- Implement cache-first for static assets (icons, fonts)
- Implement network-first for API calls
- Offline fallback to /offline.html
- Cache versioning with CACHE_VERSION constant
- Self-update mechanism (skipWaiting + clients.claim)

## Manifest.json
- name, short_name, description, start_url, display: "standalone"
- scope: "/"
- theme_color: "#0B1F14", background_color: "#0B1F14"
- orientation: "any"
- Icons: 192x192 (purpose: any), 192x192 (purpose: maskable), 512x512 (purpose: any), 512x512 (purpose: maskable)
- screenshots array (for richer install prompt)
- categories: ["business", "productivity"]
- shortcuts array (quick actions: "Find Jobs", "Post a Job", "My Messages")

## ACCESSIBILITY (WCAG 2.1 AA) — EVERY page
- Skip-to-content link after <body>
- id="main-content" on main content container
- ARIA labels on ALL icon-only buttons (close, menu, search, back, call, hangup)
- ARIA labels on ALL form inputs
- role="navigation" on nav elements, role="main" on main content
- aria-live="polite" on toast/notification containers
- aria-expanded on all toggle buttons (accordion, dropdown, modal triggers)
- aria-hidden="true" on decorative SVGs/icons
- Focus trap in modals (tab cycling within modal when open)
- Focus restoration when modal closes (return to trigger element)
- Escape key closes modals
- Color contrast: ALL text must meet 4.5:1 ratio (check footer text especially)
- Touch targets: minimum 44x44px for all interactive elements
- No autoplay audio/video
- Reduced motion: @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }

## PERFORMANCE — EVERY page
- Defer non-critical JS: <script defer>
- Async where possible: <script async>
- Inline critical CSS (above-fold styles) in <style> tag
- Move non-critical CSS to loaded stylesheet with media="print" onload trick
- Remove any unused CSS rules
- Minimize DOM depth (no more than 15 levels)
- Use will-change: transform on animated elements
- Add loading="lazy" to all below-fold images
- Add decoding="async" to all images
- Debounce scroll/resize event handlers
- Use passive event listeners: { passive: true }
- Clean up intervals/timeouts on page unload
- Remove console.log statements from production code
```

---

## PROMPT 4 — LINKS + DATABASE + API + ERROR HANDLING (Write Fixes)

```
You are doing a complete link, database, API, and error handling audit of CrewFinder at [REPO_PATH].

Read EVERY file. Fix EVERYTHING.

## LINK AUDIT — check EVERY link in EVERY file
- Internal navigation: verify every href="/page.html" target exists
- External CDN links: verify URLs are valid and current versions
- Footer links: all point to real pages (not href="#")
- Social links: validate or remove if placeholder
- mailto: and tel: links: properly formatted
- Anchor links (#section): target IDs exist on the page
- Image src: all referenced images exist
- Script src: all referenced scripts exist
- Manifest and SW paths are correct

## SUPABASE CONSISTENCY
- Extract the Supabase URL from EVERY file — they must ALL be identical
- Extract the Supabase anon key from EVERY file — they must ALL be identical
- If any mismatch, fix to match the correct production values
- Check that realtime subscriptions are properly cleaned up on page unload
- Add .unsubscribe() in beforeunload handlers

## API ERROR HANDLING — every fetch/Supabase call must have:
- try/catch wrapper
- Loading state shown to user
- Error state shown to user (toast notification, not console.log)
- Network offline detection (navigator.onLine check before fetch)
- Timeout handling (AbortController with 10s timeout for API calls)
- Retry logic for transient failures (1 retry with exponential backoff)
- Graceful degradation when Supabase is unreachable

## FORM VALIDATION — every form/input must have:
- Client-side validation before submission
- Required field indicators
- Email format validation
- Phone number format validation
- Max length limits on text inputs
- Disabled submit button during submission (prevent double-submit)
- Success confirmation after submission
- Error message display on failure

## EMPTY STATES
- Every data list (jobs, workers, messages, equipment, etc.) must show a friendly empty state message when no data exists
- Use helpful text like "No jobs posted yet. Be the first!" not just blank space

## LOADING STATES
- Every async data fetch must show a loading spinner/skeleton
- Skeleton screens preferred over spinners for lists

## OFFLINE HANDLING
- Show banner when user goes offline: "You're offline. Some features may be unavailable."
- Queue form submissions for retry when back online (or show clear message)
- Hide/disable features that require network when offline
```

---

## PROMPT 5 — LEGAL + CONTENT + UX + ANALYTICS (Write Fixes)

```
You are a product manager + legal compliance officer auditing CrewFinder at [REPO_PATH].

Read EVERY file. Fix EVERYTHING.

## LEGAL COMPLIANCE

### Privacy Policy (privacy.html) — must cover ALL of these:
- What data is collected (name, email, phone, location, photos, messages, call logs)
- How data is used (matching workers to jobs, communication, analytics)
- Third-party services and their data access:
  - Supabase (database, auth, realtime)
  - Twilio (voice calls, phone numbers)
  - Google Fonts (font loading, IP logged by Google)
  - Cloudflare (hosting, CDN, analytics)
  - Stripe (payment processing — add this section)
- Data retention periods
- User rights (access, correction, deletion, portability)
- CCPA compliance (California users: right to know, delete, opt-out of sale)
- GDPR compliance (EU users: consent, right to be forgotten, data portability)
- Cookie/localStorage usage disclosure
- Children's privacy (COPPA — must state "not intended for children under 13")
- How to contact for privacy concerns (email address)
- Last updated date

### Terms of Service (terms.html) — must cover ALL of these:
- Acceptance of terms
- Description of service
- User accounts and responsibilities
- Prohibited conduct (harassment, fraud, fake listings)
- Payment terms and membership fees (ADD Stripe billing section)
- Cancellation and refund policy
- Intellectual property
- User-generated content license
- Limitation of liability
- Indemnification
- Dispute resolution (arbitration clause)
- Governing law (state)
- Modification of terms
- Termination of accounts
- Contact information
- Last updated date

### Cookie Consent
- Banner on ALL pages (not just index.html) for GDPR compliance
- Must appear before any tracking/analytics loads
- Must have Accept and Decline options
- Declining must actually prevent non-essential storage
- Consent stored and not re-asked

### Data Collection Disclosure
- At every point where user data is collected (signup, profile edit, job post, message send), there should be a link to privacy policy

## CONTENT QUALITY
- Spell-check ALL user-facing text in every HTML file
- Remove any "Lorem ipsum", "TODO", "test", placeholder content
- Consistent branding: always "CrewFinder" (not "Crew Finder" or "crewfinder")
- Professional tone in all copy
- Clear CTAs on every page
- Error messages are user-friendly (no raw error objects, stack traces, or "undefined")

## UX POLISH
- Consistent button styles across all pages
- Consistent color scheme (dark theme: #0B1F14 background, #E8F5E9 text, #4CAF50 accent)
- Consistent font usage (Outfit for headings, system fonts for body)
- Consistent spacing/padding
- Consistent border-radius
- Smooth transitions on state changes (fade in/out, slide)
- Confirmation dialogs before destructive actions (delete job, remove worker, etc.)
- Toast notifications for success/error (consistent position: top-right or bottom-center)

## ANALYTICS READINESS
- Add a lightweight analytics snippet placeholder (comment block showing where to add Google Analytics, Plausible, or similar)
- Add event tracking comments for key actions: signup, login, job_post, job_apply, message_send, call_made, equipment_listed
- Track pageviews via service worker (offline-capable)
```

---

## PROMPT 6 — VERIFICATION AGENT (Run After Prompts 1–5)

```
You are the final QA gate for CrewFinder at [REPO_PATH].

Read EVERY file. Report PASS or FAIL for EVERY check. Fix any FAIL.

## SECURITY ✓
- [ ] No onclick="" with interpolated user data in ANY file
- [ ] DOMPurify.sanitize() on every innerHTML with user data
- [ ] safeUrl() function exists and is used for all user-provided image URLs
- [ ] No eval(), document.write(), or javascript: protocol anywhere
- [ ] Supabase anon key (not service role) in all frontend files
- [ ] Supabase URL identical across all files
- [ ] Supabase anon key identical across all files
- [ ] CORS restricted in edge functions (not "*")
- [ ] netlify.toml has security headers (CSP, X-Frame-Options, HSTS, etc.)
- [ ] No hardcoded secrets/passwords/tokens in source
- [ ] SRI hashes on CDN scripts

## SEO ✓
- [ ] meta description on ALL 14 HTML files
- [ ] og:title on ALL 14 HTML files
- [ ] twitter:card on ALL 14 HTML files
- [ ] rel="canonical" on ALL 14 HTML files
- [ ] lang="en" on ALL html tags
- [ ] Exactly one h1 per page
- [ ] robots.txt does NOT block public pages
- [ ] sitemap.xml has ALL public pages (7+)
- [ ] JSON-LD structured data on index.html
- [ ] Preconnect hints for fonts.googleapis.com and fonts.gstatic.com

## iOS/PWA ✓
- [ ] viewport-fit=cover on ALL pages
- [ ] user-scalable=no NOT present anywhere
- [ ] apple-mobile-web-app-capable on ALL pages
- [ ] env(safe-area-inset) on ALL pages
- [ ] Service worker registration on ALL pages
- [ ] sw.js caches ALL pages (14 HTML files)
- [ ] manifest.json has all required fields + shortcuts
- [ ] Icons exist: icon-192.png, icon-512.png

## ACCESSIBILITY ✓
- [ ] Skip-to-content link on ALL pages
- [ ] id="main-content" on ALL pages
- [ ] ARIA labels on all icon-only buttons
- [ ] No images without alt attribute
- [ ] Color contrast meets 4.5:1 ratio
- [ ] Touch targets minimum 44x44px
- [ ] Focus visible on all interactive elements
- [ ] Modals trap focus and close on Escape

## LINKS ✓
- [ ] Every internal href points to an existing file
- [ ] Every CDN URL loads successfully (no 403/404)
- [ ] Footer links on ALL pages point to real pages (not "#")
- [ ] mailto: and tel: links properly formatted
- [ ] Image src references exist

## LEGAL ✓
- [ ] privacy.html covers: data collection, third parties, CCPA, GDPR, children, contact
- [ ] terms.html covers: acceptance, conduct, payments, liability, disputes, termination
- [ ] Cookie consent banner present
- [ ] Privacy policy linked at data collection points

## ERROR HANDLING ✓
- [ ] Every fetch/Supabase call has try/catch
- [ ] Every form has validation
- [ ] Loading states shown during data fetch
- [ ] Empty states for all data lists
- [ ] Offline detection and messaging

## CONTENT ✓
- [ ] No placeholder text (Lorem ipsum, TODO, test)
- [ ] Consistent "CrewFinder" branding
- [ ] No raw error objects shown to users
- [ ] Professional copy throughout

Output: A final scorecard with PASS/FAIL counts and overall percentage.
```

---

## PROMPT 7 — STRIPE PAYMENT INTEGRATION (Sequential — after audit)

```
You are integrating Stripe subscription billing into CrewFinder at [REPO_PATH].

CrewFinder charges membership dues for businesses to access the platform. Workers sign up free.

## Supabase Edge Function: stripe-checkout
Create [REPO_PATH]/supabase/functions/stripe-checkout/index.ts:
- Accept POST with { priceId, userId, userEmail }
- Validate auth (check Supabase JWT)
- Create Stripe Checkout Session with:
  - mode: "subscription"
  - success_url: https://crewfinder.pages.dev/app.html?payment=success
  - cancel_url: https://crewfinder.pages.dev/app.html?payment=cancelled
  - customer_email: userEmail
  - metadata: { userId, plan }
- Return { url: session.url }
- Env vars needed: STRIPE_SECRET_KEY, STRIPE_PRICE_ID_MONTHLY, STRIPE_PRICE_ID_ANNUAL

## Supabase Edge Function: stripe-webhook
Create [REPO_PATH]/supabase/functions/stripe-webhook/index.ts:
- Verify Stripe webhook signature (STRIPE_WEBHOOK_SECRET env var)
- Handle events:
  - checkout.session.completed → update profiles table: subscription_status = 'active', stripe_customer_id, subscription_id
  - invoice.paid → update subscription_status = 'active', current_period_end
  - invoice.payment_failed → update subscription_status = 'past_due'
  - customer.subscription.deleted → update subscription_status = 'cancelled'
- Return 200 for all events

## Supabase Edge Function: stripe-portal
Create [REPO_PATH]/supabase/functions/stripe-portal/index.ts:
- Accept POST with { customerId }
- Create Stripe Billing Portal session
- Return { url: portalSession.url }
- This lets users manage their subscription (cancel, update payment method)

## Frontend: Pricing/Subscription UI in app.html
- Add a "Membership" section or modal accessible from the main nav
- Show pricing tiers:
  - Monthly: $XX/month
  - Annual: $XX/year (save XX%)
- "Subscribe" button calls stripe-checkout edge function
- Redirect to Stripe Checkout
- On return, show success/cancelled message
- "Manage Subscription" button calls stripe-portal for existing subscribers
- Gate premium features behind subscription_status check:
  - Free tier: browse jobs, basic profile
  - Paid tier: unlimited messaging, caller portal, priority listing, crew management

## Database: Add subscription columns to profiles table
Create SQL migration file [REPO_PATH]/supabase/migrations/add_stripe_fields.sql:
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_period_end timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_type text DEFAULT 'free';

## Subscription Gate Helper
Add a JS helper function used across pages:
function checkSubscription(profile) {
  if (profile.subscription_status === 'active') return true;
  if (profile.subscription_status === 'free' && profile.role === 'worker') return true; // workers are free
  showPaywall(); // show upgrade prompt
  return false;
}
```

---

## PROMPT 8 — CAPACITOR iOS/ANDROID APP WRAPPER (Sequential)

```
You are packaging CrewFinder (a PWA at [REPO_PATH]) as native iOS and Android apps using Capacitor.

## Initialize Capacitor
Create the Capacitor project structure:
- npm init -y (if no package.json)
- npm install @capacitor/core @capacitor/cli
- npx cap init "CrewFinder" "com.crewfinder.app" --web-dir "."
- npm install @capacitor/ios @capacitor/android
- npx cap add ios
- npx cap add android

## Capacitor Config (capacitor.config.ts)
{
  appId: 'com.crewfinder.app',
  appName: 'CrewFinder',
  webDir: '.',
  server: {
    url: 'https://crewfinder.pages.dev',  // point to live site
    cleartext: false
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0B1F14',
    preferredContentMode: 'mobile',
    scheme: 'CrewFinder'
  },
  android: {
    backgroundColor: '#0B1F14',
    allowMixedContent: false,
    captureInput: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0B1F14',
      showSpinner: false
    }
  }
}

## Native Plugins to Install
npm install @capacitor/push-notifications @capacitor/splash-screen @capacitor/status-bar @capacitor/keyboard @capacitor/haptics @capacitor/browser @capacitor/app @capacitor/network

## iOS-Specific Setup
- Add NSCameraUsageDescription, NSMicrophoneUsageDescription, NSLocationWhenInUseUsageDescription to Info.plist
- Configure APNs for push notifications
- Add launch storyboard / splash screen with CrewFinder branding
- Set deployment target: iOS 15.0+
- Configure app icons (generate all sizes from icon-512.png)

## Android-Specific Setup
- Configure Firebase for push notifications (google-services.json)
- Set minSdkVersion: 24
- Configure app icons (adaptive icons from icon-512.png)
- Add splash screen theme
- Configure deep links

## App Store Assets to Generate
Create a folder [REPO_PATH]/app-store-assets/ containing instructions for:

### Apple App Store:
- App icon: 1024x1024 (no rounded corners, no alpha)
- Screenshots needed:
  - iPhone 6.9" (1320x2868): Home, Job Board, Messaging, Caller, Profile — 5 screenshots
  - iPad 13" (2064x2752): same 5 screens
- App description (4000 char max)
- Keywords (100 char max)
- Category: Business
- Subcategory: Productivity
- Privacy policy URL: https://crewfinder.pages.dev/privacy.html
- Support URL: https://crewfinder.pages.dev
- Age rating: 4+ (no objectionable content)

### Google Play:
- App icon: 512x512 PNG
- Feature graphic: 1024x500
- Screenshots: 1080x1920 (phone), same 5 screens
- Short description (80 char)
- Full description (4000 char)
- Category: Business
- Content rating: Everyone
- Privacy policy URL
- Data safety declaration

## Write the App Store Description
Title: CrewFinder - Tree Service Jobs
Subtitle: Connect Crews & Companies

Description:
CrewFinder is the #1 marketplace connecting tree service professionals with local businesses. Whether you're a skilled climber looking for work or a tree company needing reliable crews, CrewFinder makes it happen.

Features:
• Browse and post tree service jobs in your area
• Build your professional profile with skills, certifications, and work photos
• Message workers and companies directly
• Make voice calls through the app
• Storm damage emergency crew coordination
• Equipment marketplace for buying and selling gear
• Crew availability calendar
• Industry news feed

For Workers: Create your profile, showcase your skills, and get hired by top tree service companies. Free to join.

For Companies: Find qualified, reliable tree service professionals. Post jobs, manage your crew, and grow your business. Subscription required.
```

---

## PROMPT 9 — APPLE PRIVACY + GOOGLE DATA SAFETY + FINAL COMPLIANCE (Sequential)

```
You are preparing all compliance documents for CrewFinder at [REPO_PATH] for App Store and Play Store submission.

## Apple Privacy Nutrition Labels
Create [REPO_PATH]/app-store-assets/apple-privacy-labels.md documenting:

### Data Used to Track You: NONE (we don't track across apps)

### Data Linked to You:
- Contact Info: Name, Email Address, Phone Number (for account & communication)
- User Content: Photos (work portfolio), Other User Content (job posts, messages, reviews)
- Identifiers: User ID (Supabase auth ID)
- Usage Data: Product Interaction (feature usage for improving the service)
- Financial Info: Payment Info (Stripe processes this, we store subscription status only)
- Location: Coarse Location (for job matching by area)

### Data Not Linked to You:
- Diagnostics: Crash Data, Performance Data
- Usage Data: Product Interaction (anonymized analytics)

### Data Collection Purposes:
- App Functionality, Analytics, Product Personalization

## Google Play Data Safety
Create [REPO_PATH]/app-store-assets/google-data-safety.md documenting:

### Data Collected:
- Personal info: Name, Email, Phone (required for account)
- Financial info: Purchase history (subscription status)
- Location: Approximate location (job matching)
- Photos and videos: Photos (work portfolio uploads)
- Messages: In-app messages between users

### Data Shared:
- With Twilio: Phone numbers (for voice calling)
- With Stripe: Email (for payment processing)
- With Supabase: All user data (database provider)

### Security:
- Data encrypted in transit (HTTPS/TLS)
- Data encrypted at rest (Supabase managed)
- Users can request data deletion (account deletion flow)

## Account Deletion Flow (REQUIRED by both stores)
Add to app.html Settings/Profile section:
- "Delete My Account" button
- Confirmation dialog: "This will permanently delete your account and all data. This cannot be undone."
- On confirm:
  1. Call Supabase edge function that:
     - Cancels Stripe subscription if active
     - Deletes all user data from all tables (messages, reviews, jobs, photos, etc.)
     - Deletes Supabase auth user
  2. Sign out and redirect to index.html
  3. Show confirmation: "Your account has been deleted."

Create [REPO_PATH]/supabase/functions/delete-account/index.ts:
- Verify auth
- Cancel Stripe subscription (if exists)
- Delete from: messages, reviews, saved_workers, work_photos, crew_availability, job_responses, call_log, equipment_listings, storm_board entries, profiles
- Delete auth user via Supabase admin API
- Return success

## App Store Review Preparation
Create [REPO_PATH]/app-store-assets/review-notes.md:
- Demo account credentials for Apple reviewer:
  - Email: reviewer@crewfinder.com
  - Password: [generate secure password]
  - Note: This account has pre-populated data for testing all features
- Explain the calling feature requires Twilio (works in production, may not work in reviewer sandbox)
- Explain subscription is handled via Stripe web checkout (per U.S. external payment ruling)
- Explain the app is a marketplace connecting tree service professionals with businesses
```

---

## QUICK REFERENCE: Complete File Inventory

After all prompts are complete, the repo should contain:

```
crewfinder-repo/
├── index.html          (landing page)
├── app.html            (main application)
├── storm.html          (storm response board)
├── calendar.html       (crew calendar)
├── equipment.html      (equipment marketplace)
├── news.html           (industry news)
├── admin.html          (admin dashboard)
├── caller.html         (voice calling portal)
├── demo.html           (interactive demo)
├── waitlist.html       (waitlist signup)
├── privacy.html        (privacy policy — FULL legal)
├── terms.html          (terms of service — FULL legal)
├── 404.html            (error page)
├── offline.html        (offline fallback)
├── manifest.json       (PWA manifest with shortcuts)
├── sw.js               (service worker — full caching)
├── robots.txt          (SEO)
├── sitemap.xml         (SEO — all public pages)
├── netlify.toml        (security headers + config)
├── icon-192.png        (app icon)
├── icon-512.png        (app icon)
├── capacitor.config.ts (native app config)
├── package.json        (Capacitor + plugins)
├── supabase/
│   └── functions/
│       ├── twilio-token/index.ts     (voice call tokens)
│       ├── twilio-voice/index.ts     (TwiML webhook)
│       ├── stripe-checkout/index.ts  (subscription checkout)
│       ├── stripe-webhook/index.ts   (payment events)
│       ├── stripe-portal/index.ts    (manage subscription)
│       └── delete-account/index.ts   (GDPR account deletion)
├── supabase/
│   └── migrations/
│       └── add_stripe_fields.sql
├── app-store-assets/
│   ├── apple-privacy-labels.md
│   ├── google-data-safety.md
│   └── review-notes.md
├── ios/                (generated by Capacitor)
└── android/            (generated by Capacitor)
```

## Environment Variables Needed (Supabase Secrets)

```
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_API_KEY_SID=xxx
TWILIO_API_KEY_SECRET=xxx
TWILIO_TWIML_APP_SID=AP42cbc9d7e3e574e21469b7f8812de9e1
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID_MONTHLY=price_xxx
STRIPE_PRICE_ID_ANNUAL=price_xxx
SUPABASE_SERVICE_ROLE_KEY=xxx (for delete-account function only)
```
