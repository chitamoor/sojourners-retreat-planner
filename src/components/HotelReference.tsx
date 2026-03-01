import { useState } from 'react';
import { CONTRACT } from '../constants';
import { fmt } from '../utils/pricing';

export default function HotelReference() {
  const [open, setOpen] = useState(false);
  const taxPct = (CONTRACT.taxes.total * 100).toFixed(3);

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
                count={CONTRACT.rooms.studioKing.total}
              />
              <RoomRow
                label="Penthouse Suite"
                sub="2 queen beds, 2 bathrooms"
                rate={CONTRACT.rooms.penthouse.ratePerNight}
                count={CONTRACT.rooms.penthouse.total}
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
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Estimated Hotel Bill</h3>
            <div className="space-y-1 text-sm">
              <BillRow label="Accommodations (pre-tax)" value={CONTRACT.accommodations.subtotalBeforeTax} />
              <BillRow label="Accommodations (with tax)" value={CONTRACT.accommodations.totalWithTax} />
              <BillRow label="Meeting Rooms (3 days)" value={CONTRACT.meetingRooms.totalEstimated} />
              <div className="pt-1 border-t border-slate-100 flex justify-between font-semibold text-slate-700">
                <span>Grand Total</span>
                <span>{fmt(CONTRACT.grandTotal)}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              80% attrition minimum = {Math.ceil((CONTRACT.rooms.studioKing.total + CONTRACT.rooms.penthouse.total) * 0.8)} rooms/night
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function RoomRow({ label, sub, rate, count }: { label: string; sub: string; rate: number; count: number }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm font-semibold text-indigo-600">{fmt(rate)}<span className="text-xs font-normal text-slate-400">/night</span></span>
      </div>
      <p className="text-xs text-slate-400 mt-0.5">{sub} · {count} rooms</p>
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
