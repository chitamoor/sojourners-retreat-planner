import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { FinancialSummary as FinancialSummaryType } from '../types';
import { fmt } from '../utils/pricing';

interface Props {
  summary: FinancialSummaryType;
}

export default function FinancialSummary({ summary }: Props) {
  const {
    totalRoomsUsed,
    totalRoomsCommitted,
    totalHeadcount,
    childrenUnder3,
    totalRevenueCollected,
    totalHotelBill,
    surplus,
    attritionRisk,
    attritionRoomsBelow,
    accommodationsCost,
    meetingCost,
    tierBreakdown,
    specialGuestRoomsCost,
    surchargePerPerson,
  } = summary;

  const hasSurplus = surplus >= 0;
  const attritionMin = Math.ceil(totalRoomsCommitted * 0.8);

  // Revenue breakdown pie data (base tier revenue + special guest surcharge as separate slice if present)
  const revenuePie = tierBreakdown
    .filter(t => t.roomCount > 0 && t.headcount > 0)
    .map(t => ({
      name: t.label,
      value: parseFloat((t.totalPerPerson * t.headcount).toFixed(2)),
    }));
  if (surchargePerPerson > 0 && totalHeadcount > 0) {
    revenuePie.push({
      name: 'Special guest rooms share',
      value: parseFloat((specialGuestRoomsCost).toFixed(2)),
    });
  }

  const PIE_COLORS = ['#6366f1', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd'];

  return (
    <div className="space-y-4">
      {/* Attrition warning — shown prominently if at risk */}
      {attritionRisk && (
        <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl mt-0.5">⚠️</span>
          <div>
            <h3 className="font-semibold text-orange-800">Attrition Risk</h3>
            <p className="text-sm text-orange-700 mt-0.5">
              You're using <strong>{totalRoomsUsed}</strong> of {totalRoomsCommitted} committed rooms.
              The hotel requires at least <strong>{attritionMin} rooms</strong> (80%) to avoid attrition fees.
              You need <strong>{attritionRoomsBelow} more room{attritionRoomsBelow !== 1 ? 's' : ''}</strong> to stay within the threshold.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">📊</span>
          <div>
            <h2 className="font-semibold text-slate-800">Financial Summary</h2>
            <p className="text-xs text-slate-500">Fees collected vs. hotel bill · break-even analysis</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Headcount"
            value={(totalHeadcount + childrenUnder3).toString()}
            sub={`${totalHeadcount} paying · ${childrenUnder3} children <3 (free)`}
            color="slate"
          />
          <StatCard
            label="Rooms Used"
            value={`${totalRoomsUsed} / ${totalRoomsCommitted}`}
            sub={attritionRisk ? `⚠ Below ${attritionMin} room minimum` : '✓ Attrition safe'}
            color={attritionRisk ? 'orange' : 'emerald'}
          />
          <StatCard
            label="Total Collected"
            value={fmt(totalRevenueCollected)}
            sub={surchargePerPerson > 0 ? `Includes ${fmt(surchargePerPerson)}/person for 2 special-guest rooms` : 'From all attendees'}
            color="indigo"
          />
          <StatCard
            label={hasSurplus ? 'Surplus' : 'Deficit'}
            value={fmt(Math.abs(surplus))}
            sub={hasSurplus ? 'Above break-even' : 'Below break-even'}
            color={hasSurplus ? 'emerald' : 'red'}
          />
        </div>

        {/* Special guest rooms note */}
        {surchargePerPerson > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 mb-4 text-sm text-amber-800">
            <strong>Special guest rooms:</strong> 3 rooms reserved (not charged to guests). 1 room is complimentary from the hotel; the cost of the other 2 rooms ({fmt(specialGuestRoomsCost)}) is shared by all paying attendees ({fmt(surchargePerPerson)}/person).
          </div>
        )}

        {/* Cost breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar breakdown */}
          <div>
            <h3 className="text-sm font-semibold text-slate-600 mb-4">Costs vs Fees Collected</h3>
            <div className="space-y-3">
              <BarRow
                label="Accommodations"
                value={accommodationsCost}
                max={totalRevenueCollected}
                color="bg-indigo-400"
              />
              <BarRow
                label="Meeting Rooms"
                value={meetingCost}
                max={totalRevenueCollected}
                color="bg-violet-400"
              />
              <div className="border-t border-slate-200 pt-3">
                <BarRow
                  label="Total Hotel Bill"
                  value={totalHotelBill}
                  max={Math.max(totalHotelBill, totalRevenueCollected)}
                  color="bg-slate-500"
                  bold
                />
                <BarRow
                  label="Total Fees Collected"
                  value={totalRevenueCollected}
                  max={Math.max(totalHotelBill, totalRevenueCollected)}
                  color={hasSurplus ? 'bg-emerald-400' : 'bg-red-400'}
                  bold
                />
              </div>
              <div className={`flex items-center justify-between rounded-xl p-3 mt-2 ${hasSurplus ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                <span className={`font-semibold text-sm ${hasSurplus ? 'text-emerald-700' : 'text-red-700'}`}>
                  {hasSurplus ? 'Surplus' : 'Deficit'}
                </span>
                <span className={`font-bold text-lg ${hasSurplus ? 'text-emerald-700' : 'text-red-700'}`}>
                  {hasSurplus ? '+' : '−'}{fmt(Math.abs(surplus))}
                </span>
              </div>
            </div>
          </div>

          {/* Pie chart of fees by tier */}
          <div>
            <h3 className="text-sm font-semibold text-slate-600 mb-4">Fees Collected by Tier</h3>
            {revenuePie.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={revenuePie}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {revenuePie.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [fmt(v as number), 'Fees Collected']}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {revenuePie.map((entry, i) => (
                    <div key={entry.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-slate-600">{entry.name}</span>
                      </div>
                      <span className="font-medium text-slate-700">{fmt(entry.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-slate-400 text-sm">
                Allocate rooms to see fee breakdown
              </div>
            )}
          </div>
        </div>

        {/* Tier headcount table */}
        {tierBreakdown.filter(t => t.roomCount > 0).length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-600 mb-3">Headcount by Tier</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                    <th className="pb-2 font-semibold">Tier</th>
                    <th className="pb-2 font-semibold text-right">Rooms</th>
                    <th className="pb-2 font-semibold text-right">People</th>
                    <th className="pb-2 font-semibold text-right">Per Person</th>
                    <th className="pb-2 font-semibold text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {tierBreakdown
                    .filter(t => t.roomCount > 0)
                    .map(t => (
                      <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-2 text-slate-700">
                          {t.label}
                          {t.isBestValue && (
                            <span className="ml-1.5 text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">Best</span>
                          )}
                        </td>
                        <td className="py-2 text-right text-slate-500">{t.roomCount}</td>
                        <td className="py-2 text-right text-slate-500">{t.headcount}</td>
                        <td className="py-2 text-right font-semibold text-slate-700">{fmt(t.totalPerPerson)}</td>
                        <td className="py-2 text-right text-slate-600">{fmt(t.totalPerPerson * t.headcount)}</td>
                      </tr>
                    ))}
                  {surchargePerPerson > 0 && totalHeadcount > 0 && (
                    <tr className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-2 text-slate-600">Special guest rooms share</td>
                      <td className="py-2 text-right text-slate-400">—</td>
                      <td className="py-2 text-right text-slate-500">{totalHeadcount}</td>
                      <td className="py-2 text-right font-semibold text-slate-700">{fmt(surchargePerPerson)}</td>
                      <td className="py-2 text-right text-slate-600">{fmt(specialGuestRoomsCost)}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200 font-semibold">
                    <td className="pt-2 text-slate-700">Total</td>
                    <td className="pt-2 text-right text-slate-600">{totalRoomsUsed}</td>
                    <td className="pt-2 text-right text-slate-600">{totalHeadcount + childrenUnder3}</td>
                    <td className="pt-2 text-right text-slate-400">—</td>
                    <td className="pt-2 text-right text-indigo-700">{fmt(totalRevenueCollected)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  color: 'slate' | 'indigo' | 'emerald' | 'red' | 'orange';
}

const colorMap: Record<string, string> = {
  slate: 'bg-slate-50 border-slate-200 text-slate-700',
  indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  red: 'bg-red-50 border-red-200 text-red-700',
  orange: 'bg-orange-50 border-orange-200 text-orange-700',
};

function StatCard({ label, value, sub, color }: StatCardProps) {
  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-1 opacity-70">{sub}</p>
    </div>
  );
}

interface BarRowProps {
  label: string;
  value: number;
  max: number;
  color: string;
  bold?: boolean;
}

function BarRow({ label, value, max, color, bold }: BarRowProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className={bold ? 'font-semibold text-slate-700' : 'text-slate-500'}>{label}</span>
        <span className={bold ? 'font-semibold text-slate-700' : 'text-slate-600'}>{fmt(value)}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-300`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
