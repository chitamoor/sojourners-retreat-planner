// Contract data from Staybridge Suites Oxnard River Ridge
// Sales Agreement dated February 23, 2026 — Sojourners Retreat

export const CONTRACT = {
  event: {
    name: 'Sojourners Retreat',
    venue: 'Staybridge Suites Oxnard River Ridge',
    checkIn: 'Friday, October 9, 2026',
    checkOut: 'Sunday, October 11, 2026',
    nights: 2,
  },

  rooms: {
    studioKing: {
      label: 'Studio King Suite',
      total: 30,
      ratePerNight: 169,
      description: '1 king bed + sofa bed, full kitchen',
      maxOccupancy: 3,
    },
    penthouse: {
      label: 'Penthouse Suite',
      total: 30,
      ratePerNight: 249,
      description: '2 queen beds + loft, 2 bathrooms, full kitchen',
      maxOccupancy: 5,
    },
  },

  taxes: {
    occupancy: 0.10,          // 10% Occupancy Tax
    oxnardTourism: 0.02,      // 2% Oxnard Tourism Marketing District
    venturaCounty: 0.02,      // 2% Ventura County Tourism Assessment
    californiaTourism: 0.00195, // 0.195% California State Tourism Assessment
    get total() {
      return this.occupancy + this.oxnardTourism + this.venturaCounty + this.californiaTourism;
    },
  },

  meetingRooms: {
    rentalSubtotal: 4500,     // 3 days × $1,500
    fbServiceCharge: 0.23,    // 23% F&B service charge
    stateSalesTax: 0.0925,    // 9.25% state sales tax (applied to taxable portion + service charge)
    // Taxable meeting room days: Fri + Sat = $3,000; Non-taxable: Sun = $1,500
    taxableRental: 3000,
    nonTaxableRental: 1500,
    // Pre-calculated total from estimates.pdf
    totalEstimated: 5908.24,
  },

  accommodations: {
    // Pre-calculated: 29 Studio + 30 Penthouse paid (1 Studio comp), 2 nights, with tax
    subtotalBeforeTax: 24742,   // 29×169×2 + 30×249×2
    totalWithTax: 28246.72,     // subtotal × (1 + taxes.total)
  },

  grandTotal: 34154.96,         // accommodations.totalWithTax + meetingRooms.totalEstimated

  attritionThreshold: 0.80, // Hotel requires 80% room usage or attrition fees apply
} as const;

export const TOTAL_ROOMS =
  30 + 30; // 60 contracted — Studio King + Penthouse

/** Bookable rooms for paying participants (3 reserved for special guests, not charged to them). */
export const BOOKABLE_STUDIO = 28;
export const BOOKABLE_PENTHOUSE = 29;
export const BOOKABLE_TOTAL = BOOKABLE_STUDIO + BOOKABLE_PENTHOUSE; // 57

/** Rooms we pay the hotel for: 1 Studio is complimentary from the hotel; we pay for 29 Studio + 30 Penthouse = 59. */
export const PAID_STUDIO = 29;
export const PAID_PENTHOUSE = 30;

export const DEFAULTS = {
  fixedCostPerPerson: 60,    // midpoint of $50–$70 range
  fixedCostMin: 50,
  fixedCostMax: 70,
  expectedAttendees: 250,
  childrenUnder3: 0,
  earlyBirdHeadcount: 0,
  earlyBirdDiscountMin: 25,
  earlyBirdDiscountMax: 75,
  earlyBirdDiscountPerPerson: 50,

  // Default room allocation split (28 studio + 29 penthouse bookable). Solo and Penthouse 2-person not offered.
  studioKingSolo: 0,
  studioKingShared: 18,
  studioKing3person: 10,
  penthouse2person: 0,
  penthouse3person: 5,
  penthouse4person: 14,
  penthouse5person: 10,
} as const;
