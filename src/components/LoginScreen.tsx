import React, { useState, useEffect } from 'react';
import { BarChart3, User, Trophy, Flame, Coins, Sparkles, Clock } from 'lucide-react';
import { LeaderboardEntry } from '../types';

interface LoginScreenProps {
  onLogin: (battleName: string) => void;
  highScore?: number;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, highScore = 1 }) => {
  const [battleName, setBattleName] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((res) => res.json())
      .then((data) => {
        if (data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
      })
      .catch(() => {
        // Fallback
        setLeaderboard([
          { id: '1', playerName: 'Valeros_The_Undying', highestFloor: 50, totalGold: 250000, title: 'Dungeon Overlord', updatedAt: '' },
          { id: '2', playerName: 'Glitched_Goblin_Slayer', highestFloor: 38, totalGold: 140000, title: 'Mythic Executioner', updatedAt: '' },
          { id: '3', playerName: 'Pixel_Vanquisher', highestFloor: 27, totalGold: 78000, title: 'Floor Master', updatedAt: '' }
        ]);
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = battleName.trim() || 'HERO_42';
    onLogin(finalName);
  };

  const formatTime = (totalSec?: number) => {
    if (!totalSec || totalSec <= 0) return '0s';
    const mins = Math.floor(totalSec / 60);
    const secs = Math.floor(totalSec % 60);
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const formatNum = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0E1B] text-slate-100 flex flex-col items-center justify-center p-4 select-none font-mono">
      {/* Top Title Section */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="relative inline-block mb-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-mono tracking-[0.15em] text-slate-100 uppercase font-light relative z-10 px-4 py-1 flex items-center justify-center gap-2">
            DUNGEON SLASHER
          </h1>
          {/* Underline accent glow effect */}
          <div className="w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-400 mt-1 shadow-[0_0_12px_rgba(129,140,248,0.8)]" />
        </div>

        <span className="text-[#38EF7D] font-mono text-xs sm:text-sm tracking-[0.35em] uppercase font-bold mt-2 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#38EF7D]" /> INFINITE CHALLENGE
        </span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-[460px] bg-[#131828] border-2 border-[#20273F] p-6 sm:p-8 shadow-2xl relative mb-6 rounded-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Battle Name Field */}
          <div>
            <label className="block text-[#8A95B2] font-mono text-xs font-semibold tracking-wider uppercase mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#38EF7D]" />
              ENTER YOUR BATTLE NAME
            </label>
            <input
              type="text"
              value={battleName}
              onChange={(e) => setBattleName(e.target.value)}
              placeholder="e.g. HERO_SLAYER"
              className="w-full bg-[#232B43] text-slate-100 placeholder-[#5A6585] border border-[#2D3758] px-4 py-3 font-mono text-sm uppercase focus:outline-none focus:border-[#38EF7D] transition-colors rounded-xl"
            />
          </div>

          {/* Enter Button */}
          <button
            type="submit"
            id="btn-enter-dungeon"
            className="w-full bg-[#38EF7D] hover:bg-[#32D970] active:bg-[#2CBF62] text-[#0B0E1B] font-mono font-black text-sm tracking-[0.2em] uppercase py-3.5 px-4 transition-all mt-2 cursor-pointer rounded-xl shadow-[0_0_20px_rgba(56,239,125,0.3)] hover:shadow-[0_0_25px_rgba(56,239,125,0.5)]"
          >
            ENTER THE DUNGEON
          </button>
        </form>
      </div>

      {/* Global Leaderboard Hall of Champions Preview Card */}
      <div className="w-full max-w-[460px] bg-[#131828]/90 border border-yellow-500/40 p-4 text-left rounded-2xl shadow-lg">
        <div className="flex items-center justify-between font-mono text-xs font-bold text-amber-300 tracking-wider mb-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>TOP ADVENTURERS LEADERBOARD</span>
          </div>
          <span className="text-[10px] text-slate-400 font-normal">{leaderboard.length} MEMBERS</span>
        </div>

        <div className="space-y-2">
          {leaderboard.slice(0, 4).map((entry, index) => (
            <div
              key={entry.id || entry.playerName}
              className="flex items-center justify-between font-mono text-xs bg-[#0E121E] border border-slate-800 p-2 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <span className={`font-bold text-xs ${index === 0 ? 'text-amber-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-600' : 'text-slate-500'}`}>
                  #{index + 1}
                </span>
                <span className="text-slate-200 font-bold uppercase">{entry.playerName}</span>
              </div>

              <div className="flex items-center gap-2.5 text-[11px]">
                <span className="text-emerald-400 flex items-center gap-0.5">
                  <Flame className="w-3 h-3" /> F#{entry.highestFloor}
                </span>
                <span className="text-cyan-300 flex items-center gap-0.5">
                  <Clock className="w-3 h-3 text-cyan-400" /> {formatTime(entry.timeTaken)}
                </span>
                <span className="text-amber-400 flex items-center gap-0.5">
                  <Coins className="w-3 h-3" /> {formatNum(entry.totalGold)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
