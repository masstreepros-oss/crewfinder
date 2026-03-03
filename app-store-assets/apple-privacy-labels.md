# Apple App Privacy Labels — CrewFinder

Use this document when filling out the App Store Connect privacy questionnaire.

## Data Used to Track You
**NONE** — CrewFinder does not track users across other companies' apps or websites.

## Data Linked to You

### Contact Info
| Data Type | Purpose | Required |
|-----------|---------|----------|
| Name | App Functionality — user profiles and job matching | Yes |
| Email Address | App Functionality — authentication, notifications, account recovery | Yes |
| Phone Number | App Functionality — in-app voice calling via Twilio | Yes |

### User Content
| Data Type | Purpose | Required |
|-----------|---------|----------|
| Photos | App Functionality — work portfolio uploads | No |
| Other User Content | App Functionality — job posts, messages, reviews, equipment listings | Yes |

### Identifiers
| Data Type | Purpose | Required |
|-----------|---------|----------|
| User ID | App Functionality — Supabase auth user identifier | Yes |

### Usage Data
| Data Type | Purpose | Required |
|-----------|---------|----------|
| Product Interaction | Analytics — feature usage to improve the service | No |

### Financial Info
| Data Type | Purpose | Required |
|-----------|---------|----------|
| Payment Info | App Functionality — Stripe processes payments; we store subscription status only | No (workers are free) |

### Location
| Data Type | Purpose | Required |
|-----------|---------|----------|
| Coarse Location | App Functionality — job matching by geographic area | Yes |

## Data Not Linked to You

### Diagnostics
| Data Type | Purpose |
|-----------|---------|
| Crash Data | App Functionality — identifying and fixing bugs |
| Performance Data | App Functionality — optimizing load times |

### Usage Data
| Data Type | Purpose |
|-----------|---------|
| Product Interaction | Analytics — anonymized, aggregated usage patterns |

## Data Collection Purposes
- **App Functionality** — Required for core features (profiles, messaging, job matching, calling)
- **Analytics** — Anonymized usage data to improve the service
- **Product Personalization** — Matching relevant jobs based on skills and location

## Data Retention
- Active accounts: Data retained while account is active
- Deleted accounts: All personal data removed within 30 days
- Users can request deletion at any time through the app

## Third-Party SDKs
- **Supabase** — Database, authentication, realtime messaging
- **Twilio** — Voice calling (phone numbers shared for call routing only)
- **Stripe** — Payment processing (email shared for billing only)
