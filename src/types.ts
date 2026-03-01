export interface RoomMix {
  studio: number;    // how many of the 60 rooms are Studio King
  penthouse: number; // how many are Penthouse (always 60 - studio)
}

export interface RoomAllocation {
  studioKingSolo: number;       // studio king rooms with 1 occupant
  studioKingShared: number;     // studio king rooms with 2 occupants sharing king bed
  studioKing3person: number;    // studio king rooms with 3 occupants (king + sofa bed)
  penthouse2person: number;     // penthouse rooms with 2 occupants
  penthouse3person: number;     // penthouse rooms with 3 occupants
  penthouse4person: number;     // penthouse rooms with 4 occupants
  penthouse5person: number;     // penthouse rooms with 5 occupants (includes loft)
}

export interface FixedCostConfig {
  retreatCostPerPerson: number; // $50–$70 program/operational cost
  childrenUnder3: number;       // informational only — attend free, no cost impact
}

export interface PricingTier {
  id: string;
  label: string;
  roomType: 'studio' | 'penthouse';
  occupants: number;
  roomCostPerPerson: number;    // room + tax share per person
  fixedCostPerPerson: number;   // retreat program cost
  totalPerPerson: number;       // room + fixed
  roomCount: number;            // how many rooms in this tier
  headcount: number;            // total people in this tier
  isBestValue: boolean;
}

export interface FinancialSummary {
  totalRoomsUsed: number;
  totalRoomsCommitted: number;
  totalHeadcount: number;        // paying attendees from room allocation only
  childrenUnder3: number;        // informational only — not counted in any cost
  totalRevenueCollected: number;
  totalHotelBill: number;
  surplus: number;               // positive = surplus, negative = deficit
  attritionRisk: boolean;
  attritionRoomsBelow: number;   // how many rooms below the 80% threshold
  accommodationsCost: number;
  meetingCost: number;
  tierBreakdown: PricingTier[];
}
