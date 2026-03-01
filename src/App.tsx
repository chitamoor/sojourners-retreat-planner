import { useState, useMemo } from 'react';
import { DEFAULTS } from './constants';
import type { RoomAllocation, FixedCostConfig } from './types';
import { computePricingTiers, computeFinancialSummary, totalHeadcount, meetingCostPerPerson } from './utils/pricing';
import HotelReference from './components/HotelReference';
import RoomAllocator from './components/RoomAllocator';
import FixedCosts from './components/FixedCosts';
import PricingTiers from './components/PricingTiers';
import FinancialSummary from './components/FinancialSummary';
import PasswordGate from './components/PasswordGate';

const AUTH_ENABLED = !!(import.meta.env.VITE_APP_USERNAME && import.meta.env.VITE_APP_PASSWORD);

const DEFAULT_ALLOCATION: RoomAllocation = {
  studioKingSolo: DEFAULTS.studioKingSolo,
  studioKingShared: DEFAULTS.studioKingShared,
  penthouse2person: DEFAULTS.penthouse2person,
  penthouse3person: DEFAULTS.penthouse3person,
  penthouse4person: DEFAULTS.penthouse4person,
};

const DEFAULT_FIXED_CONFIG: FixedCostConfig = {
  retreatCostPerPerson: DEFAULTS.fixedCostPerPerson,
  childrenUnder3: DEFAULTS.childrenUnder3,
  overrideMeetingCostPerPerson: false,
  meetingCostOverride: 0,
};

export default function App() {
  const [unlocked, setUnlocked] = useState(!AUTH_ENABLED);
  const [allocation, setAllocation] = useState<RoomAllocation>(DEFAULT_ALLOCATION);
  const [fixedConfig, setFixedConfig] = useState<FixedCostConfig>(DEFAULT_FIXED_CONFIG);

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />;
  }

  const headcount = useMemo(() => totalHeadcount(allocation), [allocation]);
  const payingAttendees = useMemo(
    () => Math.max(0, headcount - fixedConfig.childrenUnder3),
    [headcount, fixedConfig.childrenUnder3]
  );

  const tiers = useMemo(() => computePricingTiers(allocation, fixedConfig), [allocation, fixedConfig]);
  const summary = useMemo(() => computeFinancialSummary(allocation, fixedConfig), [allocation, fixedConfig]);

  function handleReset() {
    setAllocation(DEFAULT_ALLOCATION);
    setFixedConfig(DEFAULT_FIXED_CONFIG);
  }

  const autoCost = meetingCostPerPerson(payingAttendees);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow">
              S
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">Sojourners Retreat Planner</h1>
              <p className="text-xs text-slate-500">October 9–11, 2026 · Staybridge Suites Oxnard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-4 text-sm">
              <HeadlineStat label="Headcount" value={headcount.toString()} />
              <div className="w-px h-8 bg-slate-200" />
              <HeadlineStat label="Rooms Used" value={`${summary.totalRoomsUsed} / 60`} />
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* Surplus / Deficit badge — sticky below header */}
      <div className={`sticky top-[73px] z-10 border-b ${summary.surplus >= 0 ? 'bg-emerald-600' : 'bg-red-600'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
          <span className="text-white text-xs font-medium opacity-80">
            {summary.surplus >= 0 ? '✓ Break-even achieved' : '✗ Below break-even — adjust allocation'}
          </span>
          <span className="text-white text-sm font-bold">
            {summary.surplus >= 0 ? '+' : '−'}${Math.abs(summary.surplus).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs font-normal opacity-75 ml-1">
              {summary.surplus >= 0 ? 'surplus' : 'deficit'}
            </span>
          </span>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <HotelReference />
        <RoomAllocator allocation={allocation} onChange={setAllocation} />
        <FixedCosts
          config={fixedConfig}
          payingAttendees={payingAttendees}
          onChange={setFixedConfig}
        />
        <PricingTiers tiers={tiers} />
        <FinancialSummary summary={summary} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-slate-400">
          Sojourners Retreat · Pricing Planner · Based on contract dated Feb 23, 2026
          <span className="mx-2">·</span>
          Meeting room cost auto-spread: ${autoCost.toFixed(2)} per paying attendee
        </div>
      </footer>
    </div>
  );
}

function HeadlineStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-bold text-slate-700">{value}</p>
    </div>
  );
}
