export interface RoomAllocation {
  studioKingSolo: number;       // studio king rooms with 1 occupant
  studioKingShared: number;     // studio king rooms with 2 occupants sharing king bed
  penthouse2person: number;     // penthouse rooms with 2 occupants
  penthouse3person: number;     // penthouse rooms with 3 occupants
  penthouse4person: number;     // penthouse rooms with 4 occupants
}

export interface FixedCostConfig {
  retreatCostPerPerson: number; // $50–$70 program/operational cost
  childrenUnder3: number;       // children exempt from fixed cost
  overrideMeetingCostPerPerson: boolean;
  meetingCostOverride: number;  // if overriding auto-calculated meeting cost spread
}

export interface PricingTier {
  id: string;
  label: string;
  roomType: 'studio' | 'penthouse';
  occupants: number;
  roomCostPerPerson: number;    // room + tax share per person
  fixedCostPerPerson: number;   // retreat program cost
  meetingCostPerPerson: number; // shared meeting room cost
  totalPerPerson: number;       // sum of all above
  roomCount: number;            // how many rooms in this tier
  headcount: number;            // total people in this tier
  isBestValue: boolean;
}

export interface FinancialSummary {
  totalRoomsUsed: number;
  totalRoomsCommitted: number;
  totalHeadcount: number;
  payingAttendees: number;       // excludes children under 3
  totalRevenueCollected: number;
  totalHotelBill: number;
  surplus: number;               // positive = surplus, negative = deficit
  attritionRisk: boolean;
  attritionRoomsBelow: number;   // how many rooms below the 80% threshold
  accommodationsCost: number;
  meetingCost: number;
  tierBreakdown: PricingTier[];
}
