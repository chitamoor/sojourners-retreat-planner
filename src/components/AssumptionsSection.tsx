import { useState } from 'react';

export default function AssumptionsSection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📋</span>
          <div>
            <h2 className="font-semibold text-slate-800 text-base">Assumptions &amp; constraints</h2>
            <p className="text-xs text-slate-500">Pricing and room options are based on the following</p>
          </div>
        </div>
        <span className="text-slate-400 text-sm">{open ? '▲ Collapse' : '▼ Expand'}</span>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-6 py-4 space-y-3">
          <div className="flex gap-3">
            <span className="text-slate-400 shrink-0">•</span>
            <p className="text-sm text-slate-700">
              <strong>Studio King</strong> rooms are offered for <strong>2 or 3 people</strong> only. We do not offer solo (1 person per room) for Studio King.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-slate-400 shrink-0">•</span>
            <p className="text-sm text-slate-700">
              <strong>Penthouse</strong> rooms are offered for <strong>3, 4, or 5 people</strong> only. We do not offer 2-person Penthouse configurations.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-slate-400 shrink-0">•</span>
            <p className="text-sm text-slate-700">
              <strong>3 rooms</strong> are reserved for special guests (not charged to them). One of these is <strong>complimentary from the hotel</strong>; the cost of the other 2 rooms is added to the total and shared by all paying attendees.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-slate-400 shrink-0">•</span>
            <p className="text-sm text-slate-700">
              <strong>Bookable rooms</strong> for participants: <strong>28 Studio King</strong> and <strong>29 Penthouse</strong> (57 total). The hotel is paid for 29 Studio + 30 Penthouse (59 rooms; 1 Studio comp).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
