import { DEFAULTS } from '../constants';
import type { FixedCostConfig } from '../types';
import { fmt } from '../utils/pricing';

interface Props {
  config: FixedCostConfig;
  onChange: (config: FixedCostConfig) => void;
  /** Max headcount (from current allocation) to cap early bird input. */
  maxHeadcount: number;
}

export default function FixedCosts({ config, onChange, maxHeadcount }: Props) {

  function set<K extends keyof FixedCostConfig>(key: K, value: FixedCostConfig[K]) {
    onChange({ ...config, [key]: value });
  }

  const earlyBirdMax = Math.max(0, maxHeadcount);
  const earlyBirdValue = Math.min(config.earlyBirdHeadcount, earlyBirdMax);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">💰</span>
        <div>
          <h2 className="font-semibold text-slate-800">Fixed Retreat Costs</h2>
          <p className="text-xs text-slate-500">Program &amp; operational costs added to each attendee's price</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        {/* Retreat cost per person */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Retreat Program Cost
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Per paying attendee
          </p>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs text-slate-400">{fmt(DEFAULTS.fixedCostMin)}</span>
            <input
              type="range"
              min={DEFAULTS.fixedCostMin}
              max={DEFAULTS.fixedCostMax}
              step={1}
              value={config.retreatCostPerPerson}
              onChange={e => set('retreatCostPerPerson', Number(e.target.value))}
              className="flex-1 accent-amber-500"
            />
            <span className="text-xs text-slate-400">{fmt(DEFAULTS.fixedCostMax)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-amber-700">{fmt(config.retreatCostPerPerson)}</span>
            <span className="text-xs text-slate-500">per person</span>
          </div>
          <div className="mt-3 flex gap-2">
            {[50, 55, 60, 65, 70].map(v => (
              <button
                key={v}
                onClick={() => set('retreatCostPerPerson', v)}
                className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors ${config.retreatCostPerPerson === v ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
              >
                ${v}
              </button>
            ))}
          </div>
        </div>

        {/* Early bird registrations + discount */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Early bird
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Number of early bird registrations and discount per person
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">Registrations</p>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={earlyBirdMax}
                  value={earlyBirdValue}
                  onChange={e => set('earlyBirdHeadcount', Math.min(Number(e.target.value), earlyBirdMax))}
                  className="flex-1 accent-emerald-500"
                />
                <span className="text-base font-bold text-emerald-700 tabular-nums w-10 text-right">{earlyBirdValue}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">of {earlyBirdMax} paying attendees</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">Discount per person</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-6">{fmt(DEFAULTS.earlyBirdDiscountMin)}</span>
                <input
                  type="range"
                  min={DEFAULTS.earlyBirdDiscountMin}
                  max={DEFAULTS.earlyBirdDiscountMax}
                  step={1}
                  value={config.earlyBirdDiscountPerPerson}
                  onChange={e => set('earlyBirdDiscountPerPerson', Number(e.target.value))}
                  className="flex-1 accent-emerald-500"
                />
                <span className="text-xs text-slate-400 w-6">{fmt(DEFAULTS.earlyBirdDiscountMax)}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                <span className="font-bold text-emerald-700">{fmt(config.earlyBirdDiscountPerPerson)}</span> off regular price
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
