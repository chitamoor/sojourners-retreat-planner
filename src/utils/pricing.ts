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

/** Total cost for one room for the full stay (no tax — early bird) */
export function roomTotalCostNoTax(ratePerNight: number): number {
  return ratePerNight * NIGHTS;
}

/** Per-person room cost for a given occupancy level (with tax) */
export function roomCostPerPerson(ratePerNight: number, occupants: number): number {
  return roomTotalCost(ratePerNight) / occupants;
}

/** Per-person room cost for a given occupancy level (no tax — early bird) */
export function roomCostPerPersonNoTax(ratePerNight: number, occupants: number): number {
  return roomTotalCostNoTax(ratePerNight) / occupants;
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

/** Build pricing tiers from current config. Studio King Solo and Penthouse 2-person are not offered. */
export function computePricingTiers(
  alloc: RoomAllocation,
  fixedConfig: FixedCostConfig
): PricingTier[] {
  const tiers: PricingTier[] = [
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
      earlyBirdRoomCostPerPerson: 0,
      earlyBirdTotalPerPerson: 0,
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
      earlyBirdRoomCostPerPerson: 0,
      earlyBirdTotalPerPerson: 0,
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
      earlyBirdRoomCostPerPerson: 0,
      earlyBirdTotalPerPerson: 0,
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
      earlyBirdRoomCostPerPerson: 0,
      earlyBirdTotalPerPerson: 0,
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
      earlyBirdRoomCostPerPerson: 0,
      earlyBirdTotalPerPerson: 0,
    },
  ];

  // Compute totals: regular (room + tax + fixed); early bird = regular − discount
  tiers.forEach(t => {
    t.totalPerPerson = t.roomCostPerPerson + t.fixedCostPerPerson;
    t.earlyBirdTotalPerPerson = Math.max(0, t.totalPerPerson - fixedConfig.earlyBirdDiscountPerPerson);
    t.earlyBirdRoomCostPerPerson = t.earlyBirdTotalPerPerson - t.fixedCostPerPerson;
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

/** Cost of the 2 special-guest rooms we pay for (1 studio + 1 penthouse); spread across all paying occupants. */
export function specialGuestRoomsCost(): number {
  return roomTotalCost(STUDIO_RATE) + roomTotalCost(PENTHOUSE_RATE);
}

/** Compute full financial summary.
 *
 * @param committedRooms  When provided (from the main app), the hotel bill uses these PAID room counts
 *   (29 Studio + 30 Penthouse; 1 Studio is comp). Revenue includes base tier fees plus a per-person
 *   surcharge for the 2 special-guest rooms. When absent, falls back to allocation-based billing.
 */
export function computeFinancialSummary(
  alloc: RoomAllocation,
  fixedConfig: FixedCostConfig,
  committedRooms?: { studio: number; penthouse: number }
): FinancialSummary {
  const tiers = computePricingTiers(alloc, fixedConfig);
  const headcount = totalHeadcount(alloc);
  const roomsUsed = totalRoomsUsed(alloc);

  // Cap early bird at headcount and prorate across tiers
  const earlyBirdTotal = Math.min(fixedConfig.earlyBirdHeadcount, headcount);
  const earlyCountByTier: number[] = [];
  if (headcount > 0 && earlyBirdTotal > 0) {
    let sum = 0;
    tiers.forEach((t, i) => {
      const earlyCount = Math.round((earlyBirdTotal * t.headcount) / headcount);
      earlyCountByTier[i] = Math.min(earlyCount, t.headcount);
      sum += earlyCountByTier[i];
    });
    // Normalize: adjust largest tier so sum === earlyBirdTotal
    const diff = earlyBirdTotal - sum;
    if (diff !== 0) {
      let idx = 0;
      for (let i = 1; i < tiers.length; i++) {
        if (tiers[i].headcount > tiers[idx].headcount) idx = i;
      }
      earlyCountByTier[idx] = Math.max(0, Math.min(tiers[idx].headcount, earlyCountByTier[idx] + diff));
    }
  } else {
    tiers.forEach(() => earlyCountByTier.push(0));
  }

  // Base revenue: early bird pay earlyBirdTotalPerPerson, rest pay totalPerPerson
  const baseRevenue = tiers.reduce((sum, t, i) => {
    if (t.roomCount === 0) return sum;
    const earlyCount = earlyCountByTier[i] ?? 0;
    const regularCount = t.headcount - earlyCount;
    return sum + earlyCount * t.earlyBirdTotalPerPerson + regularCount * t.totalPerPerson;
  }, 0);

  const specialGuestCost = specialGuestRoomsCost();
  const surchargePerPerson = headcount > 0 ? specialGuestCost / headcount : 0;
  const totalRevenueCollected = baseRevenue + surchargePerPerson * headcount;

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
    specialGuestRoomsCost: specialGuestCost,
    surchargePerPerson,
  };
}

export function fmt(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}
