import type { RoomAllocation, RoomMix } from '../types';

interface Props {
  allocation: RoomAllocation;
  roomMix: RoomMix;
  onChange: (alloc: RoomAllocation) => void;
}

/** Derive Studio King percentages (2 vs 3 per room); solo is 0 in this view. */
function getStudioPercentages(allocation: RoomAllocation, totalStudio: number): { pct2: number; pct3: number } {
  if (totalStudio <= 0) return { pct2: 50, pct3: 50 };
  const shared = allocation.studioKingShared;
  const three = allocation.studioKing3person;
  const denom = shared + three;
  if (denom === 0) return { pct2: 50, pct3: 50 };
  return {
    pct2: Math.round((shared / denom) * 100),
    pct3: Math.round((three / denom) * 100),
  };
}

/** Derive Penthouse percentages (3, 4, 5 per room); 2-person is 0 in this view. */
function getPenthousePercentages(allocation: RoomAllocation, totalPenthouse: number): { pct3: number; pct4: number; pct5: number } {
  if (totalPenthouse <= 0) return { pct3: 33, pct4: 34, pct5: 33 };
  const p3 = allocation.penthouse3person;
  const p4 = allocation.penthouse4person;
  const p5 = allocation.penthouse5person;
  const denom = p3 + p4 + p5;
  if (denom === 0) return { pct3: 33, pct4: 34, pct5: 33 };
  return {
    pct3: Math.round((p3 / denom) * 100),
    pct4: Math.round((p4 / denom) * 100),
    pct5: Math.round((p5 / denom) * 100),
  };
}

/** Allocate studio rooms by two percentages that sum to 100. */
function studioFromPercentages(total: number, pct2: number): { shared: number; three: number } {
  const shared = Math.round((total * pct2) / 100);
  const three = total - shared;
  return { shared, three };
}

/** Allocate penthouse rooms by three percentages that sum to 100; normalize so sum = total. */
function penthouseFromPercentages(total: number, pct3: number, pct4: number, pct5: number): { p3: number; p4: number; p5: number } {
  if (total <= 0) return { p3: 0, p4: 0, p5: 0 };
  let p3 = Math.round((total * pct3) / 100);
  let p4 = Math.round((total * pct4) / 100);
  let p5 = Math.round((total * pct5) / 100);
  const diff = total - (p3 + p4 + p5);
  p5 += diff;
  if (p5 < 0) {
    p4 += p5;
    p5 = 0;
    if (p4 < 0) {
      p3 += p4;
      p4 = 0;
      p3 = Math.max(0, p3);
    }
  }
  return { p3, p4, p5 };
}

interface PercentSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled: boolean;
  color: 'indigo' | 'violet';
}

function PercentSlider({ label, value, onChange, disabled, color }: PercentSliderProps) {
  const accentClass = color === 'indigo' ? 'accent-indigo-500' : 'accent-violet-500';
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between gap-3 mb-1">
        <span className="text-sm text-slate-700">{label}</span>
        <span className="text-sm font-semibold text-slate-700 tabular-nums min-w-[2.5rem] text-right">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        disabled={disabled}
        className={`w-full h-2 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${accentClass}`}
      />
    </div>
  );
}

export default function OccupantDistribution({ allocation, roomMix, onChange }: Props) {
  const totalStudio = roomMix.studio;
  const totalPenthouse = roomMix.penthouse;

  const studioPct = getStudioPercentages(allocation, totalStudio);
  const penthousePct = getPenthousePercentages(allocation, totalPenthouse);

  const handleStudioChange = (pct2: number) => {
    const pct3 = 100 - pct2;
    const { shared, three } = studioFromPercentages(totalStudio, pct2);
    onChange({
      ...allocation,
      studioKingSolo: 0,
      studioKingShared: shared,
      studioKing3person: three,
    });
  };

  const handlePenthouseChange = (which: 'pct3' | 'pct4' | 'pct5', value: number) => {
    const rest = 100 - value;
    let pct3 = penthousePct.pct3;
    let pct4 = penthousePct.pct4;
    let pct5 = penthousePct.pct5;
    if (which === 'pct3') {
      const otherSum = pct4 + pct5;
      if (otherSum > 0) {
        pct4 = Math.round((rest * pct4) / otherSum);
        pct5 = rest - pct4;
      } else {
        pct4 = Math.floor(rest / 2);
        pct5 = rest - pct4;
      }
      pct3 = value;
    } else if (which === 'pct4') {
      const otherSum = pct3 + pct5;
      if (otherSum > 0) {
        pct3 = Math.round((rest * pct3) / otherSum);
        pct5 = rest - pct3;
      } else {
        pct3 = Math.floor(rest / 2);
        pct5 = rest - pct3;
      }
      pct4 = value;
    } else {
      const otherSum = pct3 + pct4;
      if (otherSum > 0) {
        pct3 = Math.round((rest * pct3) / otherSum);
        pct4 = rest - pct3;
      } else {
        pct3 = Math.floor(rest / 2);
        pct4 = rest - pct3;
      }
      pct5 = value;
    }
    const { p3, p4, p5 } = penthouseFromPercentages(totalPenthouse, pct3, pct4, pct5);
    onChange({
      ...allocation,
      penthouse2person: 0,
      penthouse3person: p3,
      penthouse4person: p4,
      penthouse5person: p5,
    });
  };

  const studioDisabled = totalStudio <= 0;
  const penthouseDisabled = totalPenthouse <= 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">📊</span>
        <div>
          <h2 className="font-semibold text-slate-800">Occupant distribution</h2>
          <p className="text-xs text-slate-500">Adjust the mix of occupants per room type. Sliders sum to 100% — pricing updates in real time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* King Suite (Studio King) */}
        <div className="rounded-xl border-2 border-indigo-100 bg-indigo-50/40 p-4">
          <h3 className="font-semibold text-slate-700 mb-1">King Suite</h3>
          <p className="text-xs text-slate-500 mb-4">Studio King · 2 or 3 people per room</p>
          <PercentSlider
            label="2 occupants per room"
            value={studioPct.pct2}
            onChange={v => handleStudioChange(v)}
            disabled={studioDisabled}
            color="indigo"
          />
          <PercentSlider
            label="3 occupants per room"
            value={studioPct.pct3}
            onChange={v => handleStudioChange(100 - v)}
            disabled={studioDisabled}
            color="indigo"
          />
          {totalStudio > 0 && (
            <p className="mt-2 text-xs text-slate-400">
              {allocation.studioKingShared} rooms × 2 · {allocation.studioKing3person} rooms × 3
            </p>
          )}
        </div>

        {/* Penthouse */}
        <div className="rounded-xl border-2 border-violet-100 bg-violet-50/40 p-4">
          <h3 className="font-semibold text-slate-700 mb-1">Penthouse</h3>
          <p className="text-xs text-slate-500 mb-4">3, 4, or 5 people per room</p>
          <PercentSlider
            label="3 occupants per room"
            value={penthousePct.pct3}
            onChange={v => handlePenthouseChange('pct3', v)}
            disabled={penthouseDisabled}
            color="violet"
          />
          <PercentSlider
            label="4 occupants per room"
            value={penthousePct.pct4}
            onChange={v => handlePenthouseChange('pct4', v)}
            disabled={penthouseDisabled}
            color="violet"
          />
          <PercentSlider
            label="5 occupants per room"
            value={penthousePct.pct5}
            onChange={v => handlePenthouseChange('pct5', v)}
            disabled={penthouseDisabled}
            color="violet"
          />
          {totalPenthouse > 0 && (
            <p className="mt-2 text-xs text-slate-400">
              {allocation.penthouse3person} × 3 · {allocation.penthouse4person} × 4 · {allocation.penthouse5person} × 5
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
