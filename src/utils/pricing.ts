import { CONTRACT } from '../constants';
import type { RoomAllocation, FixedCostConfig, PricingTier, FinancialSummary } from '../types';

const NIGHTS = CONTRACT.event.nights;
const TAX = CONTRACT.taxes.total;
const STUDIO_RATE = CONTRACT.rooms.studioKing.ratePerNight;
const PENTHOUSE_RATE = CONTRACT.rooms.penthouse.ratePerNight;

/** Total cost for one room for the full stay (with tax) */
export function roomTotalCost(ratePerNight: number): number {
  return ratePerNight * NIGHTS * (1 + TAX);
}

/** Per-person room cost for a given occupancy level */
export function roomCostPerPerson(ratePerNight: number, occupants: number): number {
  return roomTotalCost(ratePerNight) / occupants;
}

/** Total headcount from a given room allocation */
export function totalHeadcount(alloc: RoomAllocation): number {
  return (
    alloc.studioKingSolo * 1 +
    alloc.studioKingShared * 2 +
    alloc.studioKing3person * 3 +
    alloc.penthouse2person * 2 +
    alloc.penthouse3person * 3 +
    alloc.penthouse4person * 4 +
    alloc.penthouse5person * 5
  );
}

/** Total rooms used */
export function totalRoomsUsed(alloc: RoomAllocation): number {
  return (
    alloc.studioKingSolo +
    alloc.studioKingShared +
    alloc.studioKing3person +
    alloc.penthouse2person +
    alloc.penthouse3person +
    alloc.penthouse4person +
    alloc.penthouse5person
  );
}

export function studioRoomsUsed(alloc: RoomAllocation): number {
  return alloc.studioKingSolo + alloc.studioKingShared + alloc.studioKing3person;
}

export function penthouseRoomsUsed(alloc: RoomAllocation): number {
  return alloc.penthouse2person + alloc.penthouse3person + alloc.penthouse4person + alloc.penthouse5person;
}

/** Build all pricing tiers from current config */
export function computePricingTiers(
  alloc: RoomAllocation,
  fixedConfig: FixedCostConfig
): PricingTier[] {
  const tiers: PricingTier[] = [
    {
      id: 'studio-solo',
      label: 'Studio King — Solo',
      roomType: 'studio',
      occupants: 1,
      roomCostPerPerson: roomCostPerPerson(STUDIO_RATE, 1),
      fixedCostPerPerson: fixedConfig.retreatCostPerPerson,
      totalPerPerson: 0,
      roomCount: alloc.studioKingSolo,
      headcount: alloc.studioKingSolo * 1,
      isBestValue: false,
    },
    {
      id: 'studio-shared',
      label: 'Studio King — Shared',
      roomType: 'studio',
      occupants: 2,
      roomCostPerPerson: roomCostPerPerson(STUDIO_RATE, 2),
      fixedCostPerPerson: fixedConfig.retreatCostPerPerson,
      totalPerPerson: 0,
      roomCount: alloc.studioKingShared,
      headcount: alloc.studioKingShared * 2,
      isBestValue: false,
    },
    {
      id: 'studio-3',
      label: 'Studio King — 3 People',
      roomType: 'studio',
      occupants: 3,
      roomCostPerPerson: roomCostPerPerson(STUDIO_RATE, 3),
      fixedCostPerPerson: fixedConfig.retreatCostPerPerson,
      totalPerPerson: 0,
      roomCount: alloc.studioKing3person,
      headcount: alloc.studioKing3person * 3,
      isBestValue: false,
    },
    {
      id: 'penthouse-2',
      label: 'Penthouse — 2 People',
      roomType: 'penthouse',
      occupants: 2,
      roomCostPerPerson: roomCostPerPerson(PENTHOUSE_RATE, 2),
      fixedCostPerPerson: fixedConfig.retreatCostPerPerson,
      totalPerPerson: 0,
      roomCount: alloc.penthouse2person,
      headcount: alloc.penthouse2person * 2,
      isBestValue: false,
    },
    {
      id: 'penthouse-3',
      label: 'Penthouse — 3 People',
      roomType: 'penthouse',
      occupants: 3,
      roomCostPerPerson: roomCostPerPerson(PENTHOUSE_RATE, 3),
      fixedCostPerPerson: fixedConfig.retreatCostPerPerson,
      totalPerPerson: 0,
      roomCount: alloc.penthouse3person,
      headcount: alloc.penthouse3person * 3,
      isBestValue: false,
    },
    {
      id: 'penthouse-4',
      label: 'Penthouse — 4 People',
      roomType: 'penthouse',
      occupants: 4,
      roomCostPerPerson: roomCostPerPerson(PENTHOUSE_RATE, 4),
      fixedCostPerPerson: fixedConfig.retreatCostPerPerson,
      totalPerPerson: 0,
      roomCount: alloc.penthouse4person,
      headcount: alloc.penthouse4person * 4,
      isBestValue: false,
    },
    {
      id: 'penthouse-5',
      label: 'Penthouse — 5 People',
      roomType: 'penthouse',
      occupants: 5,
      roomCostPerPerson: roomCostPerPerson(PENTHOUSE_RATE, 5),
      fixedCostPerPerson: fixedConfig.retreatCostPerPerson,
      totalPerPerson: 0,
      roomCount: alloc.penthouse5person,
      headcount: alloc.penthouse5person * 5,
      isBestValue: false,
    },
  ];

  // Compute totals: room share + fixed retreat cost only
  tiers.forEach(t => {
    t.totalPerPerson = t.roomCostPerPerson + t.fixedCostPerPerson;
  });

  // Mark best value (lowest total among tiers with at least 1 room)
  const activeTiers = tiers.filter(t => t.roomCount > 0);
  if (activeTiers.length > 0) {
    const minTotal = Math.min(...activeTiers.map(t => t.totalPerPerson));
    activeTiers.forEach(t => {
      t.isBestValue = t.totalPerPerson === minTotal;
    });
  }

  return tiers;
}

/** Compute full financial summary.
 *
 * @param committedRooms  The total rooms committed to the hotel (studio + penthouse).
 *   When provided (from the main app), the hotel bill is based on ALL committed rooms
 *   regardless of how many have occupants assigned in the sliders — because the hotel
 *   charges for every contracted room. When absent (e.g. Recommendations scenarios where
 *   every room is fully allocated), falls back to the rooms used in the allocation.
 */
export function computeFinancialSummary(
  alloc: RoomAllocation,
  fixedConfig: FixedCostConfig,
  committedRooms?: { studio: number; penthouse: number }
): FinancialSummary {
  const tiers = computePricingTiers(alloc, fixedConfig);
  const headcount = totalHeadcount(alloc); // paying adults only; children under 3 excluded
  const roomsUsed = totalRoomsUsed(alloc);

  // Revenue from each tier (only rooms with allocations)
  const totalRevenueCollected = tiers.reduce((sum, t) => {
    if (t.roomCount === 0) return sum;
    return sum + t.totalPerPerson * t.headcount;
  }, 0);

  // Hotel bills for ALL committed rooms — unallocated rooms still cost money.
  const billedStudio = committedRooms?.studio ?? studioRoomsUsed(alloc);
  const billedPenthouse = committedRooms?.penthouse ?? penthouseRoomsUsed(alloc);
  const totalCommitted = billedStudio + billedPenthouse;

  const accommodationsCost =
    billedStudio * STUDIO_RATE * NIGHTS * (1 + TAX) +
    billedPenthouse * PENTHOUSE_RATE * NIGHTS * (1 + TAX);

  const meetingCost = CONTRACT.meetingRooms.totalEstimated;
  const totalHotelBill = accommodationsCost + meetingCost;

  const attritionThreshold = Math.ceil(totalCommitted * CONTRACT.attritionThreshold);
  const attritionRisk = roomsUsed < attritionThreshold;
  const attritionRoomsBelow = Math.max(0, attritionThreshold - roomsUsed);

  return {
    totalRoomsUsed: roomsUsed,
    totalRoomsCommitted: totalCommitted,
    totalHeadcount: headcount,
    childrenUnder3: fixedConfig.childrenUnder3,
    totalRevenueCollected,
    totalHotelBill,
    surplus: totalRevenueCollected - totalHotelBill,
    attritionRisk,
    attritionRoomsBelow,
    accommodationsCost,
    meetingCost,
    tierBreakdown: tiers,
  };
}

export function fmt(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}
