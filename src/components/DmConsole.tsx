import React, { useState } from 'react';
import { DmLogMessage, Monster } from '../types';
import { Terminal, Send, Code, Sparkles } from 'lucide-react';

interface DmConsoleProps {
  logs: DmLogMessage[];
  currentMonster: Monster | null;
  onSendCustomDmPrompt: (promptTheme: string) => void;
  loadingCustomPrompt: boolean;
}

export const DmConsole: React.FC<DmConsoleProps> = ({
  logs,
  currentMonster,
  onSendCustomDmPrompt,
  loadingCustomPrompt
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [showJsonInspector, setShowJsonInspector] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim() || loadingCustomPrompt) return;
    onSendCustomDmPrompt(customPrompt.trim());
    setCustomPrompt('');
  };

  return (
    <div className="w-full bg-slate-950/90 border-2 border-cyan-500/30 rounded-2xl p-4 shadow-xl flex flex-col gap-3 backdrop-blur-md">
      {/* Console Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <h3 className="font-mono font-bold text-sm text-cyan-300 uppercase tracking-wider">
            DUNGEON MASTER AI CONSOLE
          </h3>
        </div>

        <button
          onClick={() => setShowJsonInspector(!showJsonInspector)}
          className="bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-300 text-xs font-mono px-2.5 py-1 rounded transition-all flex items-center gap-1.5"
          title="Inspect Dungeon Master JSON Response"
        >
          <Code className="w-3.5 h-3.5 text-cyan-400" />
          <span>{showJsonInspector ? 'Hide JSON' : 'Inspect JSON'}</span>
        </button>
      </div>

      {/* JSON Inspector Modal or Collapsible View */}
      {showJsonInspector && currentMonster && (
        <div className="bg-black/90 border border-cyan-500/40 rounded-xl p-3 font-mono text-[11px] text-cyan-300 overflow-x-auto max-h-48">
          <div className="text-[10px] text-slate-500 uppercase mb-1">// Active Dungeon Master Monster Payload</div>
          <pre>{JSON.stringify({
            name: currentMonster.name,
            hp: currentMonster.maxHp,
            flavor_text: currentMonster.flavor_text,
            ability: currentMonster.ability,
            loot_item: currentMonster.loot_item,
            color_hex: currentMonster.color_hex
          }, null, 2)}</pre>
        </div>
      )}

      {/* Live DM Terminal Chat Log */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 font-mono text-xs max-h-40 overflow-y-auto flex flex-col gap-1.5 shadow-inner">
        {logs.length === 0 ? (
          <div className="text-slate-500 italic text-[11px]">Dungeon Master is observing the arcade arena...</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="leading-relaxed flex items-start gap-1.5">
              <span className="text-cyan-500 font-bold shrink-0">[DM]:</span>
              <span className={log.sender === 'LOOT' ? 'text-amber-300 font-bold' : 'text-slate-200'}>
                {log.text}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Prompt DM to Generate Custom Monster */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Order DM to create a monster (e.g. 'a sentient toaster on roller skates')..."
          className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 text-slate-100 font-mono text-xs rounded-xl px-3 py-2 focus:outline-none placeholder:text-slate-600"
          disabled={loadingCustomPrompt}
        />
        <button
          type="submit"
          disabled={loadingCustomPrompt || !customPrompt.trim()}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-mono text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow"
        >
          {loadingCustomPrompt ? (
            <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>Summon</span>
        </button>
      </form>
    </div>
  );
};
