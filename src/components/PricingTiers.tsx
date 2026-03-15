import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import type { PricingTier } from '../types';
import { fmt } from '../utils/pricing';
import { CONTRACT } from '../constants';

interface Props {
  tiers: PricingTier[];
  /** When > 0, show early bird price alongside regular. */
  earlyBirdHeadcount: number;
}

const ROOM_COLORS: Record<string, { card: string; badge: string; bar: string }> = {
  studio: {
    card: 'border-indigo-200 bg-indigo-50/50',
    badge: 'bg-indigo-100 text-indigo-700',
    bar: '#6366f1',
  },
  penthouse: {
    card: 'border-violet-200 bg-violet-50/50',
    badge: 'bg-violet-100 text-violet-700',
    bar: '#7c3aed',
  },
};

export default function PricingTiers({ tiers, earlyBirdHeadcount }: Props) {
  const activeTiers = tiers.filter(t => t.roomCount > 0);
  const chartData = tiers.map(t => ({
    name: shortLabel(t.label),
    total: parseFloat(t.totalPerPerson.toFixed(2)),
    room: parseFloat(t.roomCostPerPerson.toFixed(2)),
    fixed: parseFloat(t.fixedCostPerPerson.toFixed(2)),
    type: t.roomType,
    active: t.roomCount > 0,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏷️</span>
          <div>
            <h2 className="font-semibold text-slate-800">Per-Person Pricing Tiers</h2>
            <p className="text-xs text-slate-500">Cost per individual based on their room preference</p>
          </div>
        </div>
        <span className="text-xs text-slate-400 italic hidden sm:block">Hover any price for a step-by-step breakdown</span>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 mb-8">
        {tiers.map(tier => {
          const colors = ROOM_COLORS[tier.roomType];
          const isActive = tier.roomCount > 0;

          return (
            <div
              key={tier.id}
              className={`relative rounded-xl border-2 p-4 transition-opacity ${colors.card} ${!isActive ? 'opacity-40' : ''}`}
            >
              {tier.isBestValue && isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    Best Value
                  </span>
                </div>
              )}

              <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${colors.badge}`}>
                {tier.roomType === 'studio' ? 'Studio King' : 'Penthouse'}
              </span>

              <p className="text-xs font-semibold text-slate-600 mb-3">
                {occupantLabel(tier.occupants)}
              </p>

              <div className="relative group/price mb-3 inline-flex items-baseline gap-1 cursor-help">
                {earlyBirdHeadcount > 0 ? (
                  <div className="space-y-0.5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-800">{fmt(tier.totalPerPerson)}</span>
                      <span className="text-xs text-slate-400 select-none">ⓘ</span>
                      {isActive && <PriceBreakdownTooltip tier={tier} showEarlyBird />}
                    </div>
                    <p className="text-xs text-slate-600">
                      <span className="font-medium text-emerald-700">Early bird:</span> {fmt(tier.earlyBirdTotalPerPerson)}
                      <span className="text-slate-400 mx-1">·</span>
                      <span className="text-slate-500">Regular:</span> {fmt(tier.totalPerPerson)}
                    </p>
                  </div>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-slate-800">{fmt(tier.totalPerPerson)}</span>
                    <span className="text-xs text-slate-400 select-none">ⓘ</span>
                    {isActive && <PriceBreakdownTooltip tier={tier} showEarlyBird={false} />}
                  </>
                )}
              </div>

              <div className="space-y-1 text-xs text-slate-500 border-t border-slate-200 pt-2">
                <CostRow label="Room share" value={tier.roomCostPerPerson} />
                <CostRow label="Retreat cost" value={tier.fixedCostPerPerson} />
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between text-xs text-slate-400">
                <span>{tier.roomCount} room{tier.roomCount !== 1 ? 's' : ''}</span>
                <span>{tier.headcount} {tier.headcount === 1 ? 'person' : 'people'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bar chart comparison */}
      {activeTiers.length > 0 && (
        <div id="pricing-tiers-chart">
          <h3 className="text-sm font-semibold text-slate-600 mb-3">Total Cost Comparison</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={v => `$${v}`}
                width={55}
              />
              <Tooltip
                formatter={(value, name) => [fmt(value as number), labelMap[name as string] ?? name]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={ROOM_COLORS[entry.type].bar}
                    opacity={entry.active ? 1 : 0.25}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            <Legend color={ROOM_COLORS.studio.bar} label="Studio King" />
            <Legend color={ROOM_COLORS.penthouse.bar} label="Penthouse" />
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-slate-300" />
              Unallocated tier
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

const labelMap: Record<string, string> = {
  total: 'Total per person',
  room: 'Room share',
  fixed: 'Retreat cost',
};

function CostRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="font-medium text-slate-600">{fmt(value)}</span>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="text-xs text-slate-500 flex items-center gap-1">
      <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function shortLabel(label: string): string {
  return label
    .replace('Studio King — ', 'Studio\n')
    .replace('Penthouse — ', 'PH\n');
}

function occupantLabel(n: number): string {
  if (n === 1) return 'Solo — 1 person';
  return `Shared — ${n} people`;
}

function PriceBreakdownTooltip({ tier, showEarlyBird }: { tier: PricingTier; showEarlyBird?: boolean }) {
  const rate =
    tier.roomType === 'studio'
      ? CONTRACT.rooms.studioKing.ratePerNight
      : CONTRACT.rooms.penthouse.ratePerNight;
  const nights = CONTRACT.event.nights;
  const taxRate = CONTRACT.taxes.total;
  const roomSubtotal = rate * nights;
  const taxAmount = roomSubtotal * taxRate;
  const roomTotal = roomSubtotal + taxAmount;
  const roomShare = roomTotal / tier.occupants;

  return (
    <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-3 w-60 -translate-x-1/2 rounded-xl bg-slate-800 p-3 text-xs text-white opacity-0 shadow-2xl transition-opacity duration-150 group-hover/price:opacity-100">
      <p className="mb-2 font-semibold text-slate-100">Price breakdown</p>
      <div className="space-y-1 font-mono">
        <CalcRow label={`$${rate} × ${nights} nights`} value={fmt(roomSubtotal)} />
        <CalcRow label={`+ ${(taxRate * 100).toFixed(3)}% tax`} value={`+ ${fmt(taxAmount)}`} muted />
        <div className="my-1.5 border-t border-slate-600" />
        <CalcRow label="Room total" value={fmt(roomTotal)} bold />
        <CalcRow
          label={`÷ ${tier.occupants} ${tier.occupants === 1 ? 'person' : 'people'}`}
          value={fmt(roomShare)}
        />
        <CalcRow label="+ retreat cost" value={`+ ${fmt(tier.fixedCostPerPerson)}`} muted />
        <div className="my-1.5 border-t border-slate-600" />
        <CalcRow label="Regular per person" value={fmt(tier.totalPerPerson)} bold highlight />
      </div>
      {showEarlyBird && (
        <>
          <div className="my-1.5 border-t border-slate-600" />
          <p className="text-emerald-300 font-semibold mb-1">Early bird (discount off regular)</p>
          <div className="space-y-1 font-mono text-slate-200">
            <CalcRow label="Regular per person" value={fmt(tier.totalPerPerson)} />
            <CalcRow label="− discount" value={`− ${fmt(tier.totalPerPerson - tier.earlyBirdTotalPerPerson)}`} muted />
            <CalcRow label="Early bird per person" value={fmt(tier.earlyBirdTotalPerPerson)} bold />
          </div>
        </>
      )}
      <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
    </div>
  );
}

function CalcRow({
  label,
  value,
  bold,
  muted,
  highlight,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-3 ${bold ? 'font-semibold' : ''} ${
        highlight ? 'text-white' : muted ? 'text-slate-400' : 'text-slate-200'
      }`}
    >
      <span>{label}</span>
      <span className="shrink-0">{value}</span>
    </div>
  );
}
