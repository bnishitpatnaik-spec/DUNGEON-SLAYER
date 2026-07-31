import React from 'react';
import { Volume2, VolumeX, Monitor, ShieldAlert, Sparkles, Trophy, Coins, Flame, User, LogOut } from 'lucide-react';

interface ArcadeHeaderProps {
  level: number;
  isBoss: boolean;
  gold: number;
  totalDps: number;
  clickPower: number;
  dmFavor: number;
  highScore: number;
  soundEnabled: boolean;
  crtEnabled: boolean;
  selectedTheme: string;
  battleName?: string;
  onLogout?: () => void;
  onOpenLeaderboard?: () => void;
  onToggleSound: () => void;
  onToggleCrt: () => void;
  onSelectTheme: (theme: string) => void;
}

export const ArcadeHeader: React.FC<ArcadeHeaderProps> = ({
  level,
  isBoss,
  gold,
  totalDps,
  clickPower,
  dmFavor,
  highScore,
  soundEnabled,
  crtEnabled,
  selectedTheme,
  battleName,
  onLogout,
  onOpenLeaderboard,
  onToggleSound,
  onToggleCrt,
  onSelectTheme
}) => {
  const formatNum = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <header className="w-full bg-slate-950/90 border-b-2 border-emerald-500/40 p-3 shadow-xl backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Title & Stage Level */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black px-3 py-1 rounded text-xs uppercase tracking-widest flex items-center gap-1 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            <Sparkles className="w-4 h-4 animate-spin" /> DUNGEON SLASHER
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-xs">DUNGEON FLOOR:</span>
            <span className={`font-mono font-bold text-lg ${isBoss ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
              #{level} {isBoss && '⚠️ BOSS FLOOR!'}
            </span>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="flex items-center gap-4 flex-wrap justify-center bg-slate-900/80 px-4 py-1.5 rounded-lg border border-slate-800">
          {/* Gold Balance */}
          <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold" title="Arcade Gold Coins">
            <Coins className="w-4 h-4 text-amber-300" />
            <span>{formatNum(gold)}</span>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          {/* Click Damage */}
          <div className="flex items-center gap-1 text-emerald-400 font-mono text-xs" title="Damage per tap">
            <Flame className="w-3.5 h-3.5" />
            <span className="text-slate-400">TAP:</span>
            <span className="font-bold">{formatNum(clickPower)}</span>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          {/* Auto DPS */}
          <div className="flex items-center gap-1 text-cyan-400 font-mono text-xs" title="Auto Party Damage / sec">
            <span className="text-slate-400">DPS:</span>
            <span className="font-bold">{formatNum(totalDps)}/s</span>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          {/* DM Favor */}
          <div className="flex items-center gap-1 text-purple-400 font-mono text-xs" title="DM Favor Luck Bonus">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="text-slate-400">FAVOR:</span>
            <span className="font-bold">+{dmFavor}%</span>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          {/* High Score */}
          <div className="flex items-center gap-1 text-rose-400 font-mono text-xs" title="Highest Stage Reached">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span className="font-bold">HIGH: {highScore}</span>
          </div>
        </div>

        {/* Controls: Player Tag, Theme Selector, Audio Toggle, CRT Toggle, Logout */}
        <div className="flex items-center gap-2 flex-wrap">
          {battleName && (
            <div className="flex items-center gap-2 bg-[#131828] border border-[#20273F] px-2.5 py-1 text-slate-200 font-mono text-xs">
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#38EF7D]" />
                <span className="font-bold text-[#38EF7D] uppercase">{battleName}</span>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  id="btn-logout"
                  title="Log Out & Switch Battle Name"
                  className="flex items-center gap-1 text-xs bg-red-950/60 border border-red-500/40 hover:bg-red-900/80 text-red-300 px-2 py-0.5 rounded transition-all ml-1 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="font-bold tracking-wide">LOG OUT</span>
                </button>
              )}
            </div>
          )}

          {/* DM Monster Theme Picker */}
          <select
            value={selectedTheme}
            onChange={(e) => onSelectTheme(e.target.value)}
            className="bg-slate-900 border border-emerald-500/30 text-emerald-300 font-mono text-xs rounded px-2 py-1.5 focus:outline-none focus:border-emerald-400"
            title="Choose Dungeon Master Theme Generator"
          >
            <option value="random">🎲 Theme: Random Chaos</option>
            <option value="Glitched Technology">👾 Glitched Technology</option>
            <option value="Mutated Fast Food">🍔 Mutated Fast Food</option>
            <option value="Sentient Office Supplies">📎 Office Supplies</option>
            <option value="80s B-Movie Creatures">📼 80s B-Movie</option>
            <option value="Cosmic Cafe Weirdos">☕ Cosmic Cafe</option>
          </select>

          {/* Leaderboard Button */}
          {onOpenLeaderboard && (
            <button
              onClick={onOpenLeaderboard}
              id="btn-open-leaderboard"
              title="Open Global Leaderboard"
              className="flex items-center gap-1.5 bg-amber-950/80 hover:bg-amber-900 border border-yellow-500/60 text-yellow-300 px-2.5 py-1 rounded font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(234,179,8,0.3)] hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span>LEADERBOARD</span>
            </button>
          )}

          {/* Audio Toggle */}
          <button
            onClick={onToggleSound}
            id="btn-toggle-sound"
            className={`p-1.5 rounded border transition-all ${
              soundEnabled
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-400'
                : 'bg-slate-900 border-slate-700 text-slate-500'
            }`}
            title={soundEnabled ? 'Mute 8-bit Sound FX' : 'Enable 8-bit Sound FX'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* CRT Effect Toggle */}
          <button
            onClick={onToggleCrt}
            id="btn-toggle-crt"
            className={`p-1.5 rounded border transition-all ${
              crtEnabled
                ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-400'
                : 'bg-slate-900 border-slate-700 text-slate-500'
            }`}
            title={crtEnabled ? 'Disable CRT Scanlines' : 'Enable CRT Scanlines'}
          >
            <Monitor className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
