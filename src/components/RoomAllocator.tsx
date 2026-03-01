import { useState } from 'react';
import { CONTRACT, TOTAL_ROOMS } from '../constants';
import type { RoomAllocation, RoomMix } from '../types';
import { studioRoomsUsed, penthouseRoomsUsed } from '../utils/pricing';

interface Props {
  allocation: RoomAllocation;
  roomMix: RoomMix;
  onChange: (alloc: RoomAllocation) => void;
  onMixChange: (mix: RoomMix) => void;
}

export default function RoomAllocator({ allocation, roomMix, onChange, onMixChange }: Props) {
  const [showHelp, setShowHelp] = useState(false);

  const studioUsed = studioRoomsUsed(allocation);
  const penthouseUsed = penthouseRoomsUsed(allocation);
  const studioMax = roomMix.studio;
  const penthouseMax = roomMix.penthouse;
  const contractedStudio = CONTRACT.rooms.studioKing.total;
  const contractedPenthouse = CONTRACT.rooms.penthouse.total;
  const mixChanged = roomMix.studio !== contractedStudio;
  const studioRemaining = studioMax - studioUsed;
  const penthouseRemaining = penthouseMax - penthouseUsed;
  const studioOver = studioUsed > studioMax;
  const penthouseOver = penthouseUsed > penthouseMax;

  function set(key: keyof RoomAllocation, value: number) {
    onChange({ ...allocation, [key]: Math.max(0, value) });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛏️</span>
          <div>
            <h2 className="font-semibold text-slate-800">Room Allocation</h2>
            <p className="text-xs text-slate-500">Distribute the 60 committed rooms across occupancy preferences</p>
          </div>
        </div>
        <button
          onClick={() => setShowHelp(h => !h)}
          className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 px-3 py-1.5 rounded-lg transition-colors"
        >
          <span>?</span>
          <span>{showHelp ? 'Hide help' : 'How do these work?'}</span>
        </button>
      </div>

      {/* Instruction panel */}
      {showHelp && (
        <div className="mb-5 bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-slate-600 space-y-2">
          <p className="font-semibold text-indigo-800 mb-1">How to use the room sliders</p>
          <ul className="space-y-1.5 text-xs">
            <li className="flex gap-2">
              <span className="text-indigo-400 mt-0.5">▸</span>
              <span>Each row represents a <strong>room configuration</strong> — how many people will share one room of that type. The number badge shows how many rooms are assigned to that configuration.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-400 mt-0.5">▸</span>
              <span>Sliders are <strong>independent</strong> — they don't auto-balance. You must ensure the rows add up to no more than the available rooms (45 Studio, 15 Penthouse).</span>
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-400 mt-0.5">▸</span>
              <span>A <strong>red warning</strong> appears if the total exceeds available rooms. Reduce another row to clear it.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-400 mt-0.5">▸</span>
              <span>Use the <strong>− and + buttons</strong> for precise one-room adjustments, or drag the slider for quick changes.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-400 mt-0.5">▸</span>
              <span><strong>Unallocated rooms</strong> still cost the church money. Leaving more than 12 rooms empty (below 48 total) triggers hotel attrition fees.</span>
            </li>
          </ul>
          <div className="mt-3 pt-3 border-t border-indigo-100 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white rounded-lg p-2.5 border border-indigo-100">
              <p className="font-semibold text-slate-700 mb-1">Studio King Suite</p>
              <p className="text-slate-500">1 king bed + pull-out sofa bed</p>
              <p className="text-slate-500">Max <strong>3 people</strong> per room</p>
            </div>
            <div className="bg-white rounded-lg p-2.5 border border-indigo-100">
              <p className="font-semibold text-slate-700 mb-1">Penthouse Suite</p>
              <p className="text-slate-500">2 queen beds + loft space</p>
              <p className="text-slate-500">Max <strong>5 people</strong> per room</p>
            </div>
          </div>
        </div>
      )}

      {/* Room Mix Slider */}
      <div className={`mb-5 rounded-xl border-2 p-4 ${mixChanged ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Room Mix</h3>
            <p className="text-xs text-slate-500">Split the 60 rooms between Studio King and Penthouse</p>
          </div>
          {mixChanged && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-700 font-medium bg-amber-100 px-2 py-0.5 rounded-full">
                ⚠ Hypothetical — actual contract is {contractedStudio}/{contractedPenthouse}
              </span>
              <button
                onClick={() => onMixChange({ studio: contractedStudio, penthouse: contractedPenthouse })}
                className="text-xs text-slate-500 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 px-2 py-0.5 rounded-lg transition-colors"
              >
                Reset mix
              </button>
            </div>
          )}
        </div>

        {/* Visual split bar */}
        <div className="flex rounded-lg overflow-hidden h-8 mb-3 text-xs font-semibold">
          <div
            className="bg-indigo-500 flex items-center justify-center text-white transition-all duration-200"
            style={{ width: `${(roomMix.studio / TOTAL_ROOMS) * 100}%`, minWidth: roomMix.studio > 0 ? '2rem' : 0 }}
          >
            {roomMix.studio > 0 && `${roomMix.studio}`}
          </div>
          <div
            className="bg-violet-500 flex items-center justify-center text-white transition-all duration-200"
            style={{ width: `${(roomMix.penthouse / TOTAL_ROOMS) * 100}%`, minWidth: roomMix.penthouse > 0 ? '2rem' : 0 }}
          >
            {roomMix.penthouse > 0 && `${roomMix.penthouse}`}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-indigo-600 font-semibold w-24">
            Studio: {roomMix.studio}
          </span>
          <input
            type="range"
            min={0}
            max={TOTAL_ROOMS}
            value={roomMix.studio}
            onChange={e => {
              const studio = Number(e.target.value);
              onMixChange({ studio, penthouse: TOTAL_ROOMS - studio });
            }}
            className="flex-1 accent-indigo-500"
          />
          <span className="text-xs text-violet-600 font-semibold w-28 text-right">
            Penthouse: {roomMix.penthouse}
          </span>
        </div>

        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>← More Studio (cheaper, less capacity per room)</span>
          <span>More Penthouse (pricier, more capacity per room) →</span>
        </div>

        {/* Max capacity indicator */}
        <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-400 inline-block" />
            Studio max: <strong className="ml-1">{roomMix.studio * CONTRACT.rooms.studioKing.maxOccupancy} people</strong>
            <span className="text-slate-400">({roomMix.studio} × {CONTRACT.rooms.studioKing.maxOccupancy})</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-violet-400 inline-block" />
            Penthouse max: <strong className="ml-1">{roomMix.penthouse * CONTRACT.rooms.penthouse.maxOccupancy} people</strong>
            <span className="text-slate-400">({roomMix.penthouse} × {CONTRACT.rooms.penthouse.maxOccupancy})</span>
          </span>
          <span className="font-semibold text-slate-700 ml-auto">
            Total max: {roomMix.studio * CONTRACT.rooms.studioKing.maxOccupancy + roomMix.penthouse * CONTRACT.rooms.penthouse.maxOccupancy} people
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Studio King */}
        <div className={`rounded-xl border-2 p-4 ${studioOver ? 'border-red-300 bg-red-50' : 'border-indigo-100 bg-indigo-50/40'}`}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-slate-700">Studio King Suites</h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${studioOver ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'}`}>
              {studioUsed} / {studioMax} rooms
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">1 king bed + sofa bed · max 3 occupants</p>

          <SliderRow
            label="Solo (1 person per room)"
            value={allocation.studioKingSolo}
            max={studioMax}
            onChange={v => set('studioKingSolo', v)}
            color="indigo"
            note="Private room — highest per-person cost"
          />
          <SliderRow
            label="Shared (2 people, 1 king bed)"
            value={allocation.studioKingShared}
            max={studioMax}
            onChange={v => set('studioKingShared', v)}
            color="indigo"
          />
          <SliderRow
            label="3 people (king bed + sofa bed)"
            value={allocation.studioKing3person}
            max={studioMax}
            onChange={v => set('studioKing3person', v)}
            color="indigo"
            note="Best value for studio rooms"
          />

          {studioOver && (
            <p className="mt-2 text-xs text-red-600 font-medium">
              ⚠ Over by {studioUsed - studioMax} room{studioUsed - studioMax > 1 ? 's' : ''} — reduce another row
            </p>
          )}
          {!studioOver && studioRemaining > 0 && (
            <p className="mt-2 text-xs text-slate-400">{studioRemaining} studio room{studioRemaining > 1 ? 's' : ''} unallocated</p>
          )}
        </div>

        {/* Penthouse */}
        <div className={`rounded-xl border-2 p-4 ${penthouseOver ? 'border-red-300 bg-red-50' : 'border-violet-100 bg-violet-50/40'}`}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-slate-700">Penthouse Suites</h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${penthouseOver ? 'bg-red-100 text-red-700' : 'bg-violet-100 text-violet-700'}`}>
              {penthouseUsed} / {penthouseMax} rooms
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">2 queen beds + loft · max 5 occupants</p>

          <SliderRow
            label="2 people (separate queen beds)"
            value={allocation.penthouse2person}
            max={penthouseMax}
            onChange={v => set('penthouse2person', v)}
            color="violet"
            note="Couple or friends wanting privacy"
          />
          <SliderRow
            label="3 people"
            value={allocation.penthouse3person}
            max={penthouseMax}
            onChange={v => set('penthouse3person', v)}
            color="violet"
          />
          <SliderRow
            label="4 people (2 per queen bed)"
            value={allocation.penthouse4person}
            max={penthouseMax}
            onChange={v => set('penthouse4person', v)}
            color="violet"
          />
          <SliderRow
            label="5 people (includes loft)"
            value={allocation.penthouse5person}
            max={penthouseMax}
            onChange={v => set('penthouse5person', v)}
            color="violet"
            note="Best value overall"
          />

          {penthouseOver && (
            <p className="mt-2 text-xs text-red-600 font-medium">
              ⚠ Over by {penthouseUsed - penthouseMax} room{penthouseUsed - penthouseMax > 1 ? 's' : ''} — reduce another row
            </p>
          )}
          {!penthouseOver && penthouseRemaining > 0 && (
            <p className="mt-2 text-xs text-slate-400">{penthouseRemaining} penthouse room{penthouseRemaining > 1 ? 's' : ''} unallocated</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface SliderRowProps {
  label: string;
  value: number;
  max: number;
  onChange: (v: number) => void;
  color: 'indigo' | 'violet';
  note?: string;
}

function SliderRow({ label, value, max, onChange, color, note }: SliderRowProps) {
  const accentClass = color === 'indigo' ? 'accent-indigo-500' : 'accent-violet-500';
  const badgeClass = color === 'indigo'
    ? 'bg-indigo-600 text-white'
    : 'bg-violet-600 text-white';

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="text-sm text-slate-700">{label}</span>
          {note && <p className="text-xs text-slate-400">{note}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange(value - 1)}
            className="w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 text-sm flex items-center justify-center transition-colors"
            disabled={value <= 0}
          >−</button>
          <span className={`text-sm font-bold px-2 py-0.5 rounded-md min-w-[2rem] text-center ${badgeClass}`}>{value}</span>
          <button
            onClick={() => onChange(value + 1)}
            className="w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 text-sm flex items-center justify-center transition-colors"
          >+</button>
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className={`w-full h-1.5 rounded-full ${accentClass}`}
      />
    </div>
  );
}
