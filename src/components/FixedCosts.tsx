import { CONTRACT, DEFAULTS } from '../constants';
import type { FixedCostConfig } from '../types';
import { fmt, meetingCostPerPerson } from '../utils/pricing';

interface Props {
  config: FixedCostConfig;
  payingAttendees: number;
  onChange: (config: FixedCostConfig) => void;
}

export default function FixedCosts({ config, payingAttendees, onChange }: Props) {
  const autoCost = meetingCostPerPerson(payingAttendees);

  function set<K extends keyof FixedCostConfig>(key: K, value: FixedCostConfig[K]) {
    onChange({ ...config, [key]: value });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">💰</span>
        <div>
          <h2 className="font-semibold text-slate-800">Fixed Retreat Costs</h2>
          <p className="text-xs text-slate-500">Program &amp; operational costs added to each attendee's price</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Retreat cost per person */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Retreat Program Cost
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Per paying attendee · children &lt; 3 yrs exempt
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

        {/* Children under 3 */}
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Children Under 3 Years
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Exempt from the fixed retreat program cost
          </p>
          <div className="flex items-center justify-between">
            <button
              onClick={() => set('childrenUnder3', Math.max(0, config.childrenUnder3 - 1))}
              className="w-10 h-10 rounded-full bg-green-200 hover:bg-green-300 text-green-800 text-xl font-bold flex items-center justify-center transition-colors"
              disabled={config.childrenUnder3 <= 0}
            >−</button>
            <div className="text-center">
              <span className="text-4xl font-bold text-green-700">{config.childrenUnder3}</span>
              <p className="text-xs text-slate-400 mt-1">children</p>
            </div>
            <button
              onClick={() => set('childrenUnder3', config.childrenUnder3 + 1)}
              className="w-10 h-10 rounded-full bg-green-200 hover:bg-green-300 text-green-800 text-xl font-bold flex items-center justify-center transition-colors"
            >+</button>
          </div>
          <p className="text-xs text-slate-500 mt-3 text-center">
            Savings: {fmt(config.childrenUnder3 * config.retreatCostPerPerson)}
          </p>
        </div>

        {/* Meeting room cost spread */}
        <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Meeting Room Cost (shared)
          </label>
          <p className="text-xs text-slate-500 mb-3">
            {fmt(CONTRACT.meetingRooms.totalEstimated)} total ÷ paying attendees
          </p>

          <div className="flex items-center gap-2 mb-3">
            <label className="text-xs text-slate-600 flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={config.overrideMeetingCostPerPerson}
                onChange={e => set('overrideMeetingCostPerPerson', e.target.checked)}
                className="accent-sky-500"
              />
              Override auto-calculation
            </label>
          </div>

          {config.overrideMeetingCostPerPerson ? (
            <div>
              <input
                type="number"
                min={0}
                step={0.01}
                value={config.meetingCostOverride}
                onChange={e => set('meetingCostOverride', Number(e.target.value))}
                className="w-full border border-sky-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
              <p className="text-xs text-slate-400 mt-1">Manual override per person</p>
            </div>
          ) : (
            <div className="text-center">
              <span className="text-2xl font-bold text-sky-700">{fmt(autoCost)}</span>
              <p className="text-xs text-slate-400 mt-1">per paying attendee ({payingAttendees} people)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
