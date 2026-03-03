import type { PricingTier } from '../types';
import { fmt } from '../utils/pricing';

interface Props {
  tiers: PricingTier[];
}

const TIER_COLORS: Record<string, { chip: string; bar: string; label: string }> = {
  studio: {
    chip: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    bar: 'bg-indigo-400',
    label: 'bg-indigo-100 text-indigo-700',
  },
  penthouse: {
    chip: 'bg-violet-50 border-violet-200 text-violet-800',
    bar: 'bg-violet-400',
    label: 'bg-violet-100 text-violet-700',
  },
};

export default function CurrentMix({ tiers }: Props) {
  const activeTiers = tiers.filter(t => t.roomCount > 0);
  const totalGuests = activeTiers.reduce((sum, t) => sum + t.headcount, 0);
  const totalRooms = activeTiers.reduce((sum, t) => sum + t.roomCount, 0);

  if (activeTiers.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👥</span>
          <div>
            <h2 className="font-semibold text-slate-800">Current Mix</h2>
            <p className="text-xs text-slate-500">Room distribution driving the numbers below</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-sm">
          <span className="text-slate-400 text-xs">Total</span>
          <span className="font-bold text-slate-700">{totalGuests} guests</span>
          <div className="w-px h-5 bg-slate-200" />
          <span className="font-bold text-slate-700">{totalRooms} rooms</span>
        </div>
      </div>

      {/* Tier chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {activeTiers.map(tier => {
          const colors = TIER_COLORS[tier.roomType];
          const pct = totalGuests > 0 ? Math.round((tier.headcount / totalGuests) * 100) : 0;
          return (
            <div
              key={tier.id}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${colors.chip}`}
            >
              <span className={`font-semibold px-1.5 py-0.5 rounded-md text-[10px] ${colors.label}`}>
                {tier.roomType === 'studio' ? 'Studio' : 'PH'}
              </span>
              <div>
                <p className="font-semibold leading-tight">{shortTierLabel(tier.label)}</p>
                <p className="opacity-70 leading-tight mt-0.5">
                  {tier.roomCount} rooms · {tier.headcount} guests · {fmt(tier.totalPerPerson)}/person
                </p>
              </div>
              <span className="ml-1 text-[10px] font-bold opacity-50">{pct}%</span>
            </div>
          );
        })}
      </div>

      {/* Stacked guest distribution bar */}
      <div>
        <p className="text-xs text-slate-400 mb-1.5">Guest share by tier</p>
        <div className="flex rounded-lg overflow-hidden h-5">
          {activeTiers.map(tier => {
            const colors = TIER_COLORS[tier.roomType];
            const pct = totalGuests > 0 ? (tier.headcount / totalGuests) * 100 : 0;
            return (
              <div
                key={tier.id}
                className={`${colors.bar} flex items-center justify-center text-white text-[10px] font-semibold transition-all duration-300`}
                style={{ width: `${pct}%`, minWidth: pct > 3 ? '1.5rem' : 0 }}
                title={`${tier.label}: ${tier.headcount} guests (${Math.round(pct)}%)`}
              >
                {pct > 6 && Math.round(pct) + '%'}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {activeTiers.map(tier => {
            const colors = TIER_COLORS[tier.roomType];
            const pct = totalGuests > 0 ? Math.round((tier.headcount / totalGuests) * 100) : 0;
            return (
              <span key={tier.id} className="flex items-center gap-1 text-[10px] text-slate-500">
                <span className={`inline-block w-2.5 h-2.5 rounded-sm ${colors.bar}`} />
                {shortTierLabel(tier.label)} — {tier.headcount} ({pct}%)
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function shortTierLabel(label: string): string {
  return label
    .replace('Studio King — ', '')
    .replace('Penthouse — ', '');
}
