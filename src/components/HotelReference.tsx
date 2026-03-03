import { useState } from 'react';
import { CONTRACT } from '../constants';
import type { RoomMix, FinancialSummary } from '../types';
import { fmt } from '../utils/pricing';

interface Props {
  roomMix: RoomMix;
  summary: FinancialSummary;
}

export default function HotelReference({ roomMix, summary }: Props) {
  const [open, setOpen] = useState(false);
  const taxPct = (CONTRACT.taxes.total * 100).toFixed(3);

  const contractedStudio = CONTRACT.rooms.studioKing.total;
  const contractedPenthouse = CONTRACT.rooms.penthouse.total;
  const mixIsHypothetical =
    roomMix.studio !== contractedStudio || roomMix.penthouse !== contractedPenthouse;

  const totalCommitted = roomMix.studio + roomMix.penthouse;
  const attritionMin = Math.ceil(totalCommitted * CONTRACT.attritionThreshold);
  const accommodationsPreTax = summary.accommodationsCost / (1 + CONTRACT.taxes.total);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏨</span>
          <div>
            <h2 className="font-semibold text-slate-800 text-base">Hotel Contract Reference</h2>
            <p className="text-xs text-slate-500">Staybridge Suites Oxnard River Ridge · Oct 9–11, 2026</p>
          </div>
        </div>
        <span className="text-slate-400 text-sm">{open ? '▲ Collapse' : '▼ Expand'}</span>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Room rates */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Room Rates (2 Nights)</h3>
            <div className="space-y-2">
              <RoomRow
                label="Studio King Suite"
                sub="1 king bed, full kitchen"
                rate={CONTRACT.rooms.studioKing.ratePerNight}
                count={roomMix.studio}
                contractCount={contractedStudio}
              />
              <RoomRow
                label="Penthouse Suite"
                sub="2 queen beds, 2 bathrooms"
                rate={CONTRACT.rooms.penthouse.ratePerNight}
                count={roomMix.penthouse}
                contractCount={contractedPenthouse}
              />
            </div>
          </div>

          {/* Taxes */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Applicable Taxes</h3>
            <div className="space-y-1 text-sm">
              <TaxRow label="Occupancy Tax" pct={10} />
              <TaxRow label="Oxnard Tourism" pct={2} />
              <TaxRow label="Ventura County" pct={2} />
              <TaxRow label="CA State Tourism" pct={0.195} />
              <div className="pt-1 border-t border-slate-100 flex justify-between font-semibold text-slate-700">
                <span>Total Tax Rate</span>
                <span>{taxPct}%</span>
              </div>
            </div>
          </div>

          {/* Totals */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Estimated Hotel Bill</h3>
              {mixIsHypothetical && (
                <span className="text-xs text-amber-700 font-medium bg-amber-100 px-2 py-0.5 rounded-full">
                  ⚠ Hypothetical mix
                </span>
              )}
            </div>
            <div className="space-y-1 text-sm">
              <BillRow label="Accommodations (pre-tax)" value={accommodationsPreTax} />
              <BillRow label="Accommodations (with tax)" value={summary.accommodationsCost} />
              <BillRow label="Meeting Rooms (3 days)" value={summary.meetingCost} />
              <div className="pt-1 border-t border-slate-100 flex justify-between font-semibold text-slate-700">
                <span>Grand Total</span>
                <span>{fmt(summary.totalHotelBill)}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              80% attrition minimum = {attritionMin} rooms/night
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function RoomRow({ label, sub, rate, count, contractCount }: { label: string; sub: string; rate: number; count: number; contractCount: number }) {
  const isHypothetical = count !== contractCount;
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm font-semibold text-indigo-600">{fmt(rate)}<span className="text-xs font-normal text-slate-400">/night</span></span>
      </div>
      <p className="text-xs text-slate-400 mt-0.5">
        {sub} · {count} rooms
        {isHypothetical && (
          <span className="ml-1 text-amber-600">(contract: {contractCount})</span>
        )}
      </p>
    </div>
  );
}

function TaxRow({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex justify-between text-slate-600">
      <span>{label}</span>
      <span>{pct}%</span>
    </div>
  );
}

function BillRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-slate-600">
      <span>{label}</span>
      <span>{fmt(value)}</span>
    </div>
  );
}
