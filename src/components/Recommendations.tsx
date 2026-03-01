import { useMemo, useState } from 'react';
import { CONTRACT } from '../constants';
import type { RoomAllocation, FixedCostConfig } from '../types';
import { computePricingTiers, fmt, totalHeadcount } from '../utils/pricing';

interface Props {
  fixedConfig: FixedCostConfig;
  currentAllocation: RoomAllocation;
  onApply: (allocation: RoomAllocation) => void;
}

// Maximum possible headcount with 60 rooms at full occupancy
const MAX_CAPACITY =
  CONTRACT.rooms.studioKing.total * CONTRACT.rooms.studioKing.maxOccupancy +
  CONTRACT.rooms.penthouse.total * CONTRACT.rooms.penthouse.maxOccupancy;

const TARGET_PRICE_MIN = 175;
const TARGET_PRICE_MAX = 450;

interface Scenario {
  id: string;
  name: string;
  description: string;
  tag: string;
  tagColor: string;
  allocation: RoomAllocation;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'max-capacity',
    name: 'Maximum Capacity',
    description: 'Every room filled to maximum occupancy. Achieves the highest headcount possible with 60 rooms. All prices fall within the target range.',
    tag: 'Most People',
    tagColor: 'bg-emerald-100 text-emerald-700',
    allocation: {
      studioKingSolo: 0,
      studioKingShared: 0,
      studioKing3person: 45,
      penthouse2person: 0,
      penthouse3person: 0,
      penthouse4person: 0,
      penthouse5person: 15,
    },
  },
  {
    id: 'best-balance',
    name: 'Best Balance',
    description: 'Mix of 2-person and 3-person rooms. Good for groups of friends and small families. High capacity while keeping prices affordable.',
    tag: 'Recommended',
    tagColor: 'bg-indigo-100 text-indigo-700',
    allocation: {
      studioKingSolo: 0,
      studioKingShared: 15,
      studioKing3person: 30,
      penthouse2person: 0,
      penthouse3person: 0,
      penthouse4person: 5,
      penthouse5person: 10,
    },
  },
  {
    id: 'budget-priority',
    name: 'Budget Priority',
    description: 'Maximizes use of lower-cost high-occupancy rooms. Best for a congregation that prefers affordability over privacy.',
    tag: 'Most Affordable',
    tagColor: 'bg-amber-100 text-amber-700',
    allocation: {
      studioKingSolo: 0,
      studioKingShared: 5,
      studioKing3person: 40,
      penthouse2person: 0,
      penthouse3person: 0,
      penthouse4person: 3,
      penthouse5person: 12,
    },
  },
  {
    id: 'comfort-mix',
    name: 'Comfort Mix',
    description: 'More private rooms for families and couples. Lower headcount but more comfortable. Good for a retreat focused on intimacy over crowd size.',
    tag: 'More Private',
    tagColor: 'bg-violet-100 text-violet-700',
    allocation: {
      studioKingSolo: 10,
      studioKingShared: 25,
      studioKing3person: 10,
      penthouse2person: 2,
      penthouse3person: 3,
      penthouse4person: 5,
      penthouse5person: 5,
    },
  },
];

export default function Recommendations({ fixedConfig, currentAllocation, onApply }: Props) {
  const [targetHeadcount, setTargetHeadcount] = useState(250);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const currentHeadcount = totalHeadcount(currentAllocation);

  function handleApply(scenario: Scenario) {
    onApply(scenario.allocation);
    setAppliedId(scenario.id);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">💡</span>
        <div>
          <h2 className="font-semibold text-slate-800">Recommendations</h2>
          <p className="text-xs text-slate-500">Preset room distributions to hit capacity and pricing goals</p>
        </div>
      </div>

      {/* Capacity Analysis */}
      <div className="mb-6 rounded-xl border border-slate-200 p-4 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Capacity Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <CapacityStat
            label="Your Target"
            value={
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={targetHeadcount}
                  onChange={e => setTargetHeadcount(Number(e.target.value))}
                  className="w-16 text-xl font-bold text-indigo-700 bg-transparent border-b-2 border-indigo-300 focus:outline-none focus:border-indigo-500 text-center"
                />
                <span className="text-xs text-slate-400">guests</span>
              </div>
            }
            sub="Edit to set your goal"
            color="indigo"
          />
          <CapacityStat
            label="Max Possible"
            value={<span className={`text-xl font-bold ${MAX_CAPACITY < targetHeadcount ? 'text-red-600' : 'text-slate-700'}`}>{MAX_CAPACITY}</span>}
            sub="With 60 rooms at full capacity"
            color={MAX_CAPACITY < targetHeadcount ? 'red' : 'slate'}
          />
          <CapacityStat
            label="Current Allocation"
            value={<span className={`text-xl font-bold ${currentHeadcount >= targetHeadcount ? 'text-emerald-600' : 'text-slate-700'}`}>{currentHeadcount}</span>}
            sub="Based on your slider settings"
            color={currentHeadcount >= targetHeadcount ? 'emerald' : 'slate'}
          />
          <CapacityStat
            label={currentHeadcount >= targetHeadcount ? 'Surplus' : 'Gap to Target'}
            value={
              <span className={`text-xl font-bold ${currentHeadcount >= targetHeadcount ? 'text-emerald-600' : 'text-amber-600'}`}>
                {currentHeadcount >= targetHeadcount ? '+' : ''}{currentHeadcount - targetHeadcount}
              </span>
            }
            sub={currentHeadcount >= targetHeadcount ? 'Above target' : 'Below target'}
            color={currentHeadcount >= targetHeadcount ? 'emerald' : 'amber'}
          />
        </div>

        {/* Capacity warning */}
        {MAX_CAPACITY < targetHeadcount && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
            <p className="font-semibold mb-0.5">Target exceeds maximum capacity</p>
            <p>
              With 60 contracted rooms at full occupancy (45 studios × 3 + 15 penthouses × 5), the absolute
              maximum is <strong>{MAX_CAPACITY} people</strong>. To accommodate {targetHeadcount}, you would need
              to negotiate approximately <strong>{Math.ceil((targetHeadcount - MAX_CAPACITY) / 3)} additional rooms</strong> with the hotel,
              subject to availability.
            </p>
          </div>
        )}
      </div>

      {/* Price range guide */}
      <PriceRangeGuide fixedConfig={fixedConfig} />

      {/* Preset scenario cards */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Preset Scenarios — click Apply to load</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SCENARIOS.map(scenario => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              fixedConfig={fixedConfig}
              targetHeadcount={targetHeadcount}
              isApplied={appliedId === scenario.id}
              onApply={() => handleApply(scenario)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Price Range Guide ────────────────────────────────────────────────────────

function PriceRangeGuide({ fixedConfig }: { fixedConfig: FixedCostConfig }) {
  // Use a "full allocation" to generate prices for all 7 tiers
  const allActiveTiers = useMemo(() => {
    const dummyAlloc: RoomAllocation = {
      studioKingSolo: 1, studioKingShared: 1, studioKing3person: 1,
      penthouse2person: 1, penthouse3person: 1, penthouse4person: 1, penthouse5person: 1,
    };
    return computePricingTiers(dummyAlloc, fixedConfig);
  }, [fixedConfig]);

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700">Price Range Guide</h3>
        <span className="text-xs text-slate-400">Target: {fmt(TARGET_PRICE_MIN)} – {fmt(TARGET_PRICE_MAX)} per person</span>
      </div>
      <div className="space-y-2">
        {allActiveTiers.map(tier => {
          const inRange = tier.totalPerPerson >= TARGET_PRICE_MIN && tier.totalPerPerson <= TARGET_PRICE_MAX;
          const nearRange = tier.totalPerPerson < TARGET_PRICE_MIN && tier.totalPerPerson >= TARGET_PRICE_MIN * 0.93;
          return (
            <div key={tier.id} className="flex items-center gap-3">
              <div className="w-40 shrink-0">
                <span className="text-xs text-slate-600">{tier.label}</span>
              </div>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${inRange ? 'bg-emerald-400' : nearRange ? 'bg-amber-400' : 'bg-slate-300'}`}
                  style={{ width: `${Math.min(100, (tier.totalPerPerson / TARGET_PRICE_MAX) * 100)}%` }}
                />
              </div>
              <div className="w-20 text-right shrink-0">
                <span className={`text-xs font-semibold ${inRange ? 'text-emerald-700' : nearRange ? 'text-amber-700' : 'text-slate-400'}`}>
                  {fmt(tier.totalPerPerson)}
                </span>
              </div>
              <div className="w-14 shrink-0">
                {inRange && <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">✓ In range</span>}
                {nearRange && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">≈ Close</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100">
        <CoupleNote fixedConfig={fixedConfig} />
      </div>
    </div>
  );
}

function CoupleNote({ fixedConfig }: { fixedConfig: FixedCostConfig }) {
  const dummyAlloc: RoomAllocation = {
    studioKingSolo: 0, studioKingShared: 1, studioKing3person: 0,
    penthouse2person: 0, penthouse3person: 0, penthouse4person: 0, penthouse5person: 0,
  };
  const tiers = computePricingTiers(dummyAlloc, fixedConfig);
  const studioSharedTier = tiers.find(t => t.id === 'studio-shared')!;
  const coupleTotal = studioSharedTier.totalPerPerson * 2;
  const gap = coupleTotal - 450;

  return (
    <div className="text-xs text-slate-500 space-y-1">
      <p>
        <span className="font-semibold text-slate-700">Couple in private studio (shared, 2 people): </span>
        {fmt(coupleTotal)} total for 2
        {gap > 0 ? (
          <span className="ml-1 text-amber-700 font-medium">— {fmt(gap)} above the ${450} couple target. A church subsidy of {fmt(gap / 2)}/person would close this gap.</span>
        ) : (
          <span className="ml-1 text-emerald-700 font-medium">— within target!</span>
        )}
      </p>
    </div>
  );
}

// ─── Scenario Card ────────────────────────────────────────────────────────────

interface ScenarioCardProps {
  scenario: Scenario;
  fixedConfig: FixedCostConfig;
  targetHeadcount: number;
  isApplied: boolean;
  onApply: () => void;
}

function ScenarioCard({ scenario, fixedConfig, targetHeadcount, isApplied, onApply }: ScenarioCardProps) {
  const tiers = useMemo(
    () => computePricingTiers(scenario.allocation, fixedConfig),
    [scenario.allocation, fixedConfig]
  );
  const headcount = totalHeadcount(scenario.allocation);
  const activeTiers = tiers.filter(t => t.roomCount > 0);
  const minPrice = Math.min(...activeTiers.map(t => t.totalPerPerson));
  const maxPrice = Math.max(...activeTiers.map(t => t.totalPerPerson));
  const meetsTarget = headcount >= targetHeadcount;
  const roomsUsed = Object.values(scenario.allocation).reduce((a, b) => a + b, 0);

  return (
    <div className={`rounded-xl border-2 p-4 transition-all ${isApplied ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-indigo-200'}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-slate-800 text-sm">{scenario.name}</h4>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${scenario.tagColor}`}>{scenario.tag}</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">{scenario.description}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 my-3">
        <div className="text-center bg-white rounded-lg p-2 border border-slate-100">
          <p className={`text-lg font-bold ${meetsTarget ? 'text-emerald-600' : 'text-slate-700'}`}>{headcount}</p>
          <p className="text-xs text-slate-400">guests</p>
          {meetsTarget && <p className="text-xs text-emerald-600 font-medium">✓ hits target</p>}
        </div>
        <div className="text-center bg-white rounded-lg p-2 border border-slate-100">
          <p className="text-xs text-slate-400 mb-1">Price range</p>
          <p className="text-xs font-semibold text-slate-700">{fmt(minPrice)}</p>
          <p className="text-xs text-slate-400">to {fmt(maxPrice)}</p>
        </div>
        <div className="text-center bg-white rounded-lg p-2 border border-slate-100">
          <p className="text-lg font-bold text-slate-700">{roomsUsed}</p>
          <p className="text-xs text-slate-400">rooms used</p>
        </div>
      </div>

      {/* Tier breakdown */}
      <div className="space-y-1 mb-3">
        {activeTiers.map(t => (
          <div key={t.id} className="flex items-center justify-between text-xs">
            <span className="text-slate-500">{t.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">{t.roomCount} rooms · {t.headcount} people</span>
              <span className={`font-semibold ${t.totalPerPerson >= TARGET_PRICE_MIN && t.totalPerPerson <= TARGET_PRICE_MAX ? 'text-emerald-700' : 'text-amber-700'}`}>
                {fmt(t.totalPerPerson)}/person
              </span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onApply}
        className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
          isApplied
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700'
        }`}
      >
        {isApplied ? '✓ Applied' : 'Apply this scenario'}
      </button>
    </div>
  );
}

// ─── Helper components ────────────────────────────────────────────────────────

interface CapacityStatProps {
  label: string;
  value: React.ReactNode;
  sub: string;
  color: 'indigo' | 'emerald' | 'red' | 'amber' | 'slate';
}

const colorMap: Record<string, string> = {
  indigo: 'border-indigo-200 bg-indigo-50',
  emerald: 'border-emerald-200 bg-emerald-50',
  red: 'border-red-200 bg-red-50',
  amber: 'border-amber-200 bg-amber-50',
  slate: 'border-slate-200 bg-white',
};

function CapacityStat({ label, value, sub, color }: CapacityStatProps) {
  return (
    <div className={`rounded-lg border p-3 ${colorMap[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
      <div className="mb-1">{value}</div>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  );
}
