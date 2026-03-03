# Google Play Data Safety Declaration — CrewFinder

Use this document when filling out the Google Play Console data safety form.

## Overview
- App collects user data: **Yes**
- All data encrypted in transit: **Yes** (HTTPS/TLS)
- Users can request data deletion: **Yes** (in-app account deletion)
- Committed to Play Families Policy: **No** (app is 18+)

## Data Collected

### Personal Info
| Data Type | Collected | Shared | Purpose | Required |
|-----------|-----------|--------|---------|----------|
| Name | Yes | No | App functionality — user profiles | Yes |
| Email address | Yes | With Stripe | App functionality, account management | Yes |
| Phone number | Yes | With Twilio | App functionality — voice calling | Yes |

### Financial Info
| Data Type | Collected | Shared | Purpose | Required |
|-----------|-----------|--------|---------|----------|
| Purchase history | Yes (status only) | No | App functionality — subscription management | No |

### Location
| Data Type | Collected | Shared | Purpose | Required |
|-----------|-----------|--------|---------|----------|
| Approximate location | Yes (city/state) | No | App functionality — job matching | Yes |

### Photos and Videos
| Data Type | Collected | Shared | Purpose | Required |
|-----------|-----------|--------|---------|----------|
| Photos | Yes | No | App functionality — work portfolio | No |

### Messages
| Data Type | Collected | Shared | Purpose | Required |
|-----------|-----------|--------|---------|----------|
| In-app messages | Yes | No | App functionality — user communication | No |

## Data Shared with Third Parties

### Twilio (Voice Calling Provider)
- **Data shared:** Phone numbers
- **Purpose:** Voice call routing between users
- **Twilio Privacy Policy:** https://www.twilio.com/legal/privacy

### Stripe (Payment Processor)
- **Data shared:** Email address
- **Purpose:** Subscription billing and payment processing
- **Stripe Privacy Policy:** https://stripe.com/privacy

### Supabase (Backend Infrastructure)
- **Data shared:** All user data
- **Purpose:** Database storage, authentication, realtime messaging
- **Supabase Privacy Policy:** https://supabase.com/privacy
- **Note:** Supabase is our data processor, not a data buyer/broker

## Security Practices
- Data encrypted in transit (HTTPS/TLS)
- Data encrypted at rest (Supabase/AWS managed encryption)
- Row-level security policies restrict data access
- Authentication via secure tokens
- Input sanitization prevents injection attacks

## Data Deletion
- Users can delete their account from within the app (Settings > Delete My Account)
- Account deletion removes all personal data from all tables
- Deletion is processed immediately
- Stripe subscription is cancelled automatically
- Some anonymized, aggregated analytics data may be retained

## Data Retention
- Active accounts: Data retained while account is active
- Deleted accounts: Personal data removed within 30 days
- Call logs: Metadata retained for 90 days
- Payment records: Retained for 7 years (tax compliance)
