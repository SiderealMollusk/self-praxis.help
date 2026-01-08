import React, { useState, useEffect } from 'react';
import { getNextShiftDays, TIME_SLOTS } from './constants';
import type { ShiftData } from './types';

const App: React.FC = () => {
  // State for shifts and config (initialized empty, fetched on mount)
  const [shifts, setShifts] = useState<ShiftData>({});
  const [config, setConfig] = useState({ set: "SET", from: "FROM", config: "CONFIG" });

  const [days] = useState(() => getNextShiftDays());
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // Editing states
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editingHeader, setEditingHeader] = useState<string | null>(null);
  const [tempText, setTempText] = useState("");

  // Fetch initial data
  useEffect(() => {
    fetch('/shift-signups/api/data')
      .then(res => res.json())
      .then(data => {
        if (data.shifts) setShifts(data.shifts);
        if (data.config) setConfig(data.config);
      })
      .catch(err => console.error("Failed to load data:", err));
  }, []);

  const startEditingCell = (key: string) => {
    setEditingCell(key);
    setTempText(shifts[key] || "");
  };

  const saveEditCell = () => {
    if (editingCell) {
      // Optimistic Update
      const newShifts = { ...shifts, [editingCell]: tempText };
      setShifts(newShifts);

      // API Call
      fetch('/shift-signups/api/shift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: editingCell, value: tempText })
      }).catch(err => console.error("Save failed:", err));

      setEditingCell(null);
    }
  };

  const startEditingHeader = (key: string) => {
    setEditingHeader(key);
    setTempText(config[key as keyof typeof config] || "");
  };

  const saveEditHeader = () => {
    if (editingHeader) {
      // Optimistic Update
      const newConfig = { ...config, [editingHeader]: tempText.trim() };
      setConfig(newConfig);

      // API Call
      fetch('/shift-signups/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: editingHeader, value: tempText.trim() })
      }).catch(err => console.error("Save failed:", err));

      setEditingHeader(null);
    }
  };

  const currentDay = days[selectedDayIdx];

  if (!currentDay) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        No upcoming Tuesday/Thursday shifts found in the next {4} weeks.
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-screen flex flex-col select-none">
      {/* Header Section */}
      <header className="border-b-4 border-black pb-4 mb-6">
        <h1 className="text-5xl font-extrabold uppercase tracking-tighter italic">
          ShiftSignup
        </h1>
        <div className="flex justify-between items-center mt-2 font-mono-custom text-[10px] tracking-widest text-zinc-500 uppercase">
          <div className="flex gap-1 items-center">
            {['set', 'from', 'config'].map((part, i) => (
              <React.Fragment key={part}>
                <div className="inline-block relative">
                  {editingHeader === part ? (
                    <input
                      autoFocus
                      className="bg-black text-white px-1 outline-none lowercase min-w-[4ch]"
                      style={{ width: `${Math.max(tempText.length, 4)}ch` }}
                      value={tempText}
                      onChange={(e) => setTempText(e.target.value)}
                      onBlur={saveEditHeader}
                      onKeyDown={(e) => e.key === 'Enter' && saveEditHeader()}
                    />
                  ) : (
                    <span
                      className="cursor-pointer hover:text-black hover:underline inline-block min-w-[2ch]"
                      onClick={() => startEditingHeader(part)}
                    >
                      {config[part as keyof typeof config] || "___"}
                    </span>
                  )}
                </div>
                {i < 2 && <span className="mx-1 text-zinc-300">|</span>}
              </React.Fragment>
            ))}
          </div>

        </div>
      </header>

      {/* Day Selector Navigation */}
      <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar mb-4">
        {days.map((day, idx) => {
          const isSelected = selectedDayIdx === idx;
          const isTuesday = day.dayName === 'TUESDAY';

          return (
            <button
              key={idx}
              onClick={() => setSelectedDayIdx(idx)}
              className={`flex-shrink-0 px-4 py-2 border-2 border-black font-mono-custom text-[10px] uppercase transition-all
                ${isSelected ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]' : isTuesday ? 'bg-zinc-100 text-black' : 'bg-white text-black'}
                hover:scale-[1.02] active:scale-95
              `}
            >
              <div className="opacity-60">{day.dayName.substring(0, 3)}</div>
              <div className="font-bold text-xs">{day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
            </button>
          );
        })}
      </div>

      <div className="flex-grow">
        {/* Table View */}
        <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="bg-zinc-100 border-b-2 border-black p-3 font-mono-custom text-[10px] tracking-widest flex justify-between items-center uppercase font-bold">
            <span>Showing Day: {currentDay.dayName}</span>
            <span className="text-zinc-400">{currentDay.dateStr}</span>
          </div>
          <table className="w-full border-collapse font-mono-custom text-sm">
            <tbody>
              {TIME_SLOTS.map((slot) => {
                const key = `${currentDay.dateStr}_${slot.label}`;
                const isEditing = editingCell === key;
                const value = shifts[key] || "";

                return (
                  <tr key={slot.hour} className="group border-b border-zinc-200 last:border-0">
                    <td className="w-24 border-r border-black p-3 bg-zinc-50 font-bold text-center text-[10px] tracking-tight text-zinc-600">
                      {slot.label}
                    </td>
                    <td
                      className={`p-0 transition-colors cursor-pointer hover:bg-zinc-50 ${value ? 'bg-zinc-50/80' : ''}`}
                      onClick={() => !isEditing && startEditingCell(key)}
                    >
                      {isEditing ? (
                        <div className="relative p-0 m-0 w-full h-full">
                          <textarea
                            autoFocus
                            rows={3}
                            className="w-full h-full p-3 bg-black text-white outline-none resize-none font-mono-custom text-sm leading-snug block"
                            value={tempText}
                            onChange={(e) => setTempText(e.target.value)}
                            onBlur={saveEditCell}
                            placeholder="Enter Handle..."
                          />
                        </div>
                      ) : (
                        <div className="p-3 min-h-[64px] flex items-start whitespace-pre-wrap break-words leading-snug">
                          {value ? (
                            <span className="font-bold uppercase tracking-tight w-full">{value}</span>
                          ) : (
                            <span className="text-zinc-200 uppercase text-[8px] tracking-[0.2em] opacity-0 group-hover:opacity-100 self-center mx-auto">
                              [ OPEN SLOT ]
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 py-8 border-t border-black border-dashed">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="text-[8px] font-mono-custom text-zinc-400 uppercase tracking-[0.4em]">
            Njal.la Domain | Finish Data Sovereign VPS | Tailscale {'->'} On Prem Server
          </div>
          <div className="w-24 h-[1px] bg-zinc-200"></div>
          <div className="text-[7px] font-mono-custom text-zinc-300 uppercase">
            &copy; Maintainer: Virgil (signal app )// unvetted.posting359@passmail.com
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
