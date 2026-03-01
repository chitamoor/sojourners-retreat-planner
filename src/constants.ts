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
      total: 45,
      ratePerNight: 169,
      description: '1 king bed + sofa bed, full kitchen',
      maxOccupancy: 3,
    },
    penthouse: {
      label: 'Penthouse Suite',
      total: 15,
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
    // Pre-calculated from estimates.pdf
    subtotalBeforeTax: 22680,
    totalWithTax: 25899.43,
  },

  grandTotal: 31807.66,

  attritionThreshold: 0.80, // Hotel requires 80% room usage or attrition fees apply
} as const;

export const TOTAL_ROOMS =
  45 + 15; // 60 committed rooms — Studio King + Penthouse

export const DEFAULTS = {
  fixedCostPerPerson: 60,    // midpoint of $50–$70 range
  fixedCostMin: 50,
  fixedCostMax: 70,
  expectedAttendees: 250,
  childrenUnder3: 0,

  // Default room allocation split
  studioKingSolo: 5,
  studioKingShared: 35,
  studioKing3person: 5,
  penthouse2person: 2,
  penthouse3person: 3,
  penthouse4person: 8,
  penthouse5person: 2,
} as const;
