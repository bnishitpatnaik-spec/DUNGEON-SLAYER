import React, { useState, useEffect } from 'react';
import { Trophy, X, RefreshCw, UserCheck, Flame, Coins, ShieldCheck, Crown, Medal, Search, Sparkles, Clock } from 'lucide-react';
import { LeaderboardEntry } from '../types';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBattleName: string;
  currentHighScore: number;
  currentGold: number;
  currentTimeTaken?: number;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentBattleName,
  currentHighScore,
  currentGold,
  currentTimeTaken = 0
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [playerRankInfo, setPlayerRankInfo] = useState<{ rank: number; total: number } | null>(null);

  // Format time helper
  const formatTimeTaken = (totalSec?: number) => {
    if (!totalSec || totalSec <= 0) return '0s';
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = Math.floor(totalSec % 60);

    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  // Fetch or sync leaderboard from server + fallback to localStorage
  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // First sync current player score
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: currentBattleName,
          highestFloor: currentHighScore,
          totalGold: currentGold,
          timeTaken: currentTimeTaken
        })
      });

      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
        if (data.playerRank) {
          setPlayerRankInfo({ rank: data.playerRank, total: data.totalPlayers });
        }
        // Save copy to local storage as fallback
        localStorage.setItem('dungeon_clicker_leaderboard_cache', JSON.stringify(data.leaderboard));
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      console.warn('Falling back to local leaderboard cache/calculation:', err);
      // Fallback calculation using local cache + current player
      const cached = localStorage.getItem('dungeon_clicker_leaderboard_cache');
      let list: LeaderboardEntry[] = cached ? JSON.parse(cached) : [
        { id: '1', playerName: 'Valeros_The_Undying', highestFloor: 50, totalGold: 250000, timeTaken: 1850, title: 'Dungeon Overlord', updatedAt: new Date().toISOString() },
        { id: '2', playerName: 'Glitched_Goblin_Slayer', highestFloor: 38, totalGold: 140000, timeTaken: 1240, title: 'Mythic Executioner', updatedAt: new Date().toISOString() },
        { id: '3', playerName: 'Pixel_Vanquisher', highestFloor: 27, totalGold: 78000, timeTaken: 820, title: 'Floor Master', updatedAt: new Date().toISOString() },
        { id: '4', playerName: 'Aether_Warlock', highestFloor: 19, totalGold: 35000, timeTaken: 510, title: 'Spellblade Veteran', updatedAt: new Date().toISOString() }
      ];

      // Add/Update current player
      const pIndex = list.findIndex((e) => e.playerName.toLowerCase() === currentBattleName.toLowerCase());
      if (pIndex >= 0) {
        list[pIndex].highestFloor = Math.max(list[pIndex].highestFloor, currentHighScore);
        list[pIndex].totalGold = Math.max(list[pIndex].totalGold, currentGold);
        list[pIndex].timeTaken = Math.max(list[pIndex].timeTaken || 0, currentTimeTaken);
      } else {
        list.push({
          id: Math.random().toString(36).substring(2, 9),
          playerName: currentBattleName,
          highestFloor: currentHighScore,
          totalGold: currentGold,
          timeTaken: currentTimeTaken,
          title: currentHighScore >= 20 ? 'Floor Master' : currentHighScore >= 10 ? 'Spellblade Veteran' : 'Novice Adventurer',
          updatedAt: new Date().toISOString()
        });
      }

      list.sort((a, b) => b.highestFloor - a.highestFloor || b.totalGold - a.totalGold);
      const ranked = list.map((e, idx) => ({ ...e, rank: idx + 1 }));
      setLeaderboard(ranked);

      const myRankIndex = ranked.findIndex((e) => e.playerName.toLowerCase() === currentBattleName.toLowerCase());
      if (myRankIndex >= 0) {
        setPlayerRankInfo({ rank: myRankIndex + 1, total: ranked.length });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentBattleName) {
      fetchLeaderboard();
    }
  }, [isOpen, currentBattleName, currentHighScore, currentGold, currentTimeTaken]);

  if (!isOpen) return null;

  const filteredList = leaderboard.filter((entry) =>
    entry.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentPlayerEntry = leaderboard.find(
    (e) => e.playerName.toLowerCase() === currentBattleName.toLowerCase()
  );

  const formatNum = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md font-mono animate-fadeIn">
      <div className="w-full max-w-3xl bg-[#131828] border-2 border-yellow-500/60 rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.25)] flex flex-col max-h-[90vh] overflow-hidden text-slate-100 relative">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-yellow-500/40 p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 border border-amber-400/50 rounded-lg text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <Trophy className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="font-extrabold text-base md:text-lg text-amber-300 tracking-wider flex items-center gap-2 uppercase">
                HALL OF HEROES <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-slate-400 text-xs">GLOBAL DUNGEON ADVENTURER LEADERBOARD</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLeaderboard}
              disabled={loading}
              title="Refresh Leaderboard"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-red-950 hover:text-red-400 text-slate-300 border border-slate-700 rounded-lg transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current Player Rank Spotlight Card */}
        {currentPlayerEntry && (
          <div className="p-4 bg-[#0F1422] border-b border-slate-800 shrink-0">
            <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-emerald-950/70 border-2 border-[#38EF7D]/60 rounded-xl p-3.5 shadow-[0_0_20px_rgba(56,239,125,0.2)] flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-[#38EF7D]/20 border border-[#38EF7D] px-3 py-1.5 rounded-lg text-center shrink-0">
                  <span className="text-[10px] text-slate-400 block uppercase">YOUR RANK</span>
                  <span className="font-extrabold text-lg text-[#38EF7D] tracking-wide">
                    #{playerRankInfo?.rank || currentPlayerEntry.rank || '?'}
                  </span>
                  <span className="text-[9px] text-slate-400 block">OF {playerRankInfo?.total || leaderboard.length}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#38EF7D]" />
                    <span className="font-bold text-sm text-[#38EF7D] uppercase tracking-wide">
                      {currentPlayerEntry.playerName}
                    </span>
                    <span className="text-[10px] bg-[#38EF7D]/20 text-[#38EF7D] border border-[#38EF7D]/40 px-1.5 py-0.5 rounded font-bold">
                      YOU
                    </span>
                  </div>
                  <span className="text-xs text-amber-300 font-medium block mt-0.5">
                    TITLE: {currentPlayerEntry.title}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 text-xs bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800">
                <div className="text-center">
                  <span className="text-slate-400 text-[10px] block uppercase">HIGHEST FLOOR</span>
                  <span className="font-bold text-emerald-400 text-sm flex items-center justify-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> #{currentPlayerEntry.highestFloor}
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div className="text-center">
                  <span className="text-slate-400 text-[10px] block uppercase">TIME TAKEN</span>
                  <span className="font-bold text-cyan-300 text-sm flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" /> {formatTimeTaken(currentPlayerEntry.timeTaken)}
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div className="text-center">
                  <span className="text-slate-400 text-[10px] block uppercase">BEST GOLD</span>
                  <span className="font-bold text-amber-400 text-sm flex items-center justify-center gap-1">
                    <Coins className="w-3.5 h-3.5" /> {formatNum(currentPlayerEntry.totalGold)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="p-3 bg-[#111625] border-b border-slate-800 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 ml-1" />
          <input
            type="text"
            placeholder="Search adventurers by name or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Leaderboard Table / Scrollable List */}
        <div className="p-3 md:p-4 overflow-y-auto flex-1 space-y-2 custom-scrollbar">
          {filteredList.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No adventurers found matching "{searchQuery}".
            </div>
          ) : (
            filteredList.map((entry, idx) => {
              const rank = entry.rank || idx + 1;
              const isCurrentPlayer = entry.playerName.toLowerCase() === currentBattleName.toLowerCase();

              return (
                <div
                  key={entry.id || entry.playerName}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    isCurrentPlayer
                      ? 'bg-[#182620] border-[#38EF7D] shadow-[0_0_15px_rgba(56,239,125,0.25)]'
                      : rank === 1
                      ? 'bg-amber-950/30 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                      : rank === 2
                      ? 'bg-slate-800/40 border-slate-400/50'
                      : rank === 3
                      ? 'bg-amber-950/20 border-amber-700/40'
                      : 'bg-[#0E121E] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Rank Badge & Icon */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0">
                      {rank === 1 ? (
                        <div className="p-1 bg-amber-500/20 text-amber-400 border border-amber-400 rounded-lg flex items-center justify-center" title="1st Place Champion">
                          <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400/30" />
                        </div>
                      ) : rank === 2 ? (
                        <div className="p-1 bg-slate-400/20 text-slate-300 border border-slate-400 rounded-lg flex items-center justify-center" title="2nd Place">
                          <Medal className="w-5 h-5 text-slate-300" />
                        </div>
                      ) : rank === 3 ? (
                        <div className="p-1 bg-amber-800/20 text-amber-600 border border-amber-600 rounded-lg flex items-center justify-center" title="3rd Place">
                          <Medal className="w-5 h-5 text-amber-500" />
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">#{rank}</span>
                      )}
                    </div>

                    {/* Name and Title */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm uppercase ${isCurrentPlayer ? 'text-[#38EF7D]' : 'text-slate-100'}`}>
                          {entry.playerName}
                        </span>
                        {isCurrentPlayer && (
                          <span className="text-[9px] bg-[#38EF7D]/20 text-[#38EF7D] border border-[#38EF7D]/40 px-1 py-0.2 rounded font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-amber-400/90 font-medium block">
                        {entry.title}
                      </span>
                    </div>
                  </div>

                  {/* Floor, Time & Gold Stats */}
                  <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block uppercase">FLOOR</span>
                      <span className="font-bold text-emerald-400">#{entry.highestFloor}</span>
                    </div>
                    <div className="h-5 w-px bg-slate-800" />
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block uppercase">TIME</span>
                      <span className="font-bold text-cyan-300">{formatTimeTaken(entry.timeTaken)}</span>
                    </div>
                    <div className="h-5 w-px bg-slate-800" />
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block uppercase">GOLD</span>
                      <span className="font-bold text-amber-400">{formatNum(entry.totalGold)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-[11px] text-slate-500 flex justify-between items-center">
          <span>⚔️ Total Registered Adventurers: {leaderboard.length}</span>
          <span>Updated Real-Time</span>
        </div>
      </div>
    </div>
  );
};
