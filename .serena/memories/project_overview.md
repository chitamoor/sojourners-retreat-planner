# Retreat Pricing — Project Overview

## Purpose
A React + TypeScript web app for planning and pricing the **Sojourners Retreat** (Oct 9–11, 2026) at Staybridge Suites Oxnard River Ridge. It helps church retreat organizers interactively model room allocation, per-person pricing tiers, and financial break-even analysis based on a real hotel contract.

## Event Details
- **Venue:** Staybridge Suites Oxnard River Ridge
- **Dates:** Friday Oct 9 – Sunday Oct 11, 2026 (2 nights)
- **Contract signed:** Feb 23, 2026
- **Grand total contracted:** $34,542.35
- **Attrition threshold:** 80% of 60 rooms (≥ 48 rooms/night required)

## Room Types (contracted)
- **30 Studio King Suites** — $169/night, max 3 occupants (king + sofa bed, full kitchen)
- **30 Penthouse Suites** — $249/night, max 5 occupants (2 queen beds + loft, 2 bath, full kitchen)
- **Total: 60 committed rooms**

## Taxes
- 10% Occupancy Tax + 2% Oxnard Tourism + 2% Ventura County + 0.195% CA State = ~14.195% total

## Meeting Rooms
- 3 days × $1,500 = $4,500 base → $5,908.24 with F&B service charge (23%) and sales tax (9.25%)

## Key Business Logic
- Users allocate rooms across 7 occupancy tiers (Studio×1/2/3, Penthouse×2/3/4/5)
- Per-person price = room cost share (with tax) + fixed retreat cost ($50–$70/person program cost)
- Target price range: $175–$450/person
- Financial summary shows surplus/deficit vs. total hotel bill
- 6 planning scenarios with strategic trade-offs; 4 preset "apply" scenarios
- Children under 3 attend free (informational only, no cost impact)

## Architecture
- `src/constants.ts` — all hotel contract data (single source of truth)
- `src/types.ts` — TypeScript interfaces: RoomMix, RoomAllocation, FixedCostConfig, PricingTier, FinancialSummary
- `src/utils/pricing.ts` — pure computation functions (no side effects)
- `src/utils/exportPdf.ts` — jsPDF + html2canvas PDF export
- `src/App.tsx` — root state: allocation, fixedConfig, roomMix; uses useMemo for derived data
- `src/components/` — 7 components: HotelReference, RoomAllocator, FixedCosts, PricingTiers, FinancialSummary, PasswordGate, Recommendations

## Auth
- Optional password gate: enabled only if both `VITE_APP_USERNAME` and `VITE_APP_PASSWORD` env vars are set
- Persists in localStorage as `retreat_auth`
