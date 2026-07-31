import React from 'react';
import { Monster, FloatingText, ActiveSpell } from '../types';
import { MonsterSprite } from './MonsterSprite';
import { Zap, Skull, RefreshCw, Gift, Sparkles, Clock, AlertTriangle, RotateCcw, Trophy, Play, Shield, CheckCircle2, User } from 'lucide-react';

interface MonsterBattleArenaProps {
  monster: Monster | null;
  loadingMonster: boolean;
  isHit: boolean;
  floatingTexts: FloatingText[];
  spells: ActiveSpell[];
  timeRemaining: number;
  maxTime: number;
  isGameOver: boolean;
  highScore: number;
  isRunActive: boolean;
  isIntermission: boolean;
  inventoryCount?: number;
  level: number;
  battleName: string;
  onStartRun: () => void;
  onStartNextFloor: () => void;
  onMonsterTap: (e: React.MouseEvent<HTMLDivElement>) => void;
  onCastSpell: (spellId: string) => void;
  onRequestNewMonster: () => void;
  onTryAgain: () => void;
}

export const MonsterBattleArena: React.FC<MonsterBattleArenaProps> = ({
  monster,
  loadingMonster,
  isHit,
  floatingTexts,
  spells,
  timeRemaining,
  maxTime,
  isGameOver,
  highScore,
  isRunActive,
  isIntermission,
  inventoryCount = 0,
  level,
  battleName,
  onStartRun,
  onStartNextFloor,
  onMonsterTap,
  onCastSpell,
  onRequestNewMonster,
  onTryAgain
}) => {
  // Case 1: Pre-Battle Start Screen (Prompt player to click START)
  if (!isRunActive) {
    return (
      <div className="w-full min-h-[420px] bg-[#131828] border-2 border-[#38EF7D]/40 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center backdrop-blur-xl relative overflow-hidden shadow-[0_0_40px_rgba(56,239,125,0.15)] font-mono">
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#38EF7D]/10 via-transparent to-transparent pointer-events-none" />

        <div className="z-10 flex flex-col items-center max-w-lg w-full">
          <div className="p-4 bg-[#232B43] border border-[#38EF7D]/50 rounded-full mb-4 text-[#38EF7D] shadow-[0_0_20px_rgba(56,239,125,0.3)]">
            <User className="w-12 h-12" />
          </div>

          <span className="text-[#38EF7D] font-bold text-xs uppercase tracking-[0.2em] mb-1">
            HERO READY FOR BATTLE
          </span>

          <h2 className="text-3xl md:text-4xl font-black text-slate-100 uppercase tracking-wide mb-2">
            WELCOME, {battleName}!
          </h2>

          <p className="text-slate-400 text-xs md:text-sm max-w-md mb-6">
            The Dungeon Master awaits on Floor #1 with bizarre monsters and absurd battle loot!
          </p>

          <div className="w-full bg-[#0B0E1B] border border-[#20273F] rounded-xl p-4 mb-6 text-left text-xs space-y-2.5">
            <div className="flex justify-between items-center border-b border-[#20273F] pb-2">
              <span className="text-slate-400">STARTING FLOOR:</span>
              <span className="text-[#38EF7D] font-bold">FLOOR #1</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#20273F] pb-2">
              <span className="text-slate-400">ALL-TIME HIGH SCORE:</span>
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-yellow-400" /> FLOOR #{highScore}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">EQUIPMENT CHECK RULE:</span>
              <span className="text-cyan-300 font-bold">REST UNTIL YOU PRESS START</span>
            </div>
          </div>

          <button
            onClick={onStartRun}
            id="btn-start-dungeon-run"
            className="w-full bg-[#38EF7D] hover:bg-[#32D970] active:bg-[#2CBF62] text-[#0B0E1B] font-mono font-black text-lg py-4 px-6 rounded-xl transition-all shadow-[0_0_30px_rgba(56,239,125,0.4)] hover:scale-105 active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-current" />
            <span className="tracking-[0.15em] uppercase">START BATTLE (ENTER FLOOR 1)</span>
          </button>
        </div>
      </div>
    );
  }

  // Case 2: Equipment Check Intermission Screen (Stays until player presses START)
  if (isIntermission) {
    const isVaultOverflow = inventoryCount > 6;
    const excessItems = inventoryCount - 6;

    return (
      <div className={`w-full min-h-[420px] bg-[#131828] border-2 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center backdrop-blur-xl relative overflow-hidden transition-all font-mono ${
        isVaultOverflow
          ? 'border-rose-500/80 shadow-[0_0_40px_rgba(244,63,94,0.3)]'
          : 'border-[#38EF7D]/50 shadow-[0_0_40px_rgba(56,239,125,0.2)]'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#38EF7D]/10 via-transparent to-transparent pointer-events-none" />

        <div className="z-10 flex flex-col items-center max-w-lg w-full">
          <div className={`p-3 border rounded-full mb-3 shadow-lg ${
            isVaultOverflow
              ? 'bg-rose-950/80 border-rose-500/80 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
              : 'bg-[#13281C] border-[#38EF7D]/60 text-[#38EF7D] shadow-[0_0_20px_rgba(56,239,125,0.4)]'
          }`}>
            {isVaultOverflow ? (
              <AlertTriangle className="w-12 h-12 animate-bounce text-rose-400" />
            ) : (
              <CheckCircle2 className="w-12 h-12 animate-bounce" />
            )}
          </div>

          <span className="text-[#38EF7D] font-bold text-xs uppercase tracking-[0.25em] mb-1">
            🎉 FLOOR #{level - 1} CLEARED!
          </span>

          <h2 className="text-2xl md:text-3xl font-black text-slate-100 uppercase tracking-wide mb-1">
            EQUIPMENT CHECK
          </h2>

          <p className="text-slate-300 text-xs md:text-sm max-w-md mb-4">
            Review your vault and equip your best battle gear below. Click START when you are ready to fight the next monster!
          </p>

          {/* Vault Overflow Alert Banner if items > 6 */}
          {isVaultOverflow && (
            <div className="w-full bg-rose-950/90 border-2 border-rose-500/80 rounded-xl p-3.5 mb-5 text-left text-xs space-y-1 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse">
              <div className="font-black text-sm text-rose-300 flex items-center gap-1.5 uppercase">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                VAULT OVERFLOW ({inventoryCount}/6 ITEMS)
              </div>
              <p>
                Your Absurd Loot Vault can only hold a <strong>maximum of 6 items</strong>! You must sell or delete <strong>{excessItems} item{excessItems > 1 ? 's' : ''}</strong> in your vault below to unlock Floor #{level}.
              </p>
            </div>
          )}

          <div className="w-full bg-[#0B0E1B] border border-[#20273F] rounded-xl p-4 mb-6 text-left text-xs space-y-2.5">
            <div className="flex justify-between items-center border-b border-[#20273F] pb-2">
              <span className="text-slate-400">NEXT STAGE:</span>
              <span className="text-[#38EF7D] font-bold text-sm">FLOOR #{level}</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#20273F] pb-2">
              <span className="text-slate-400">VAULT CAPACITY:</span>
              <span className={`font-bold text-sm ${isVaultOverflow ? 'text-rose-400' : 'text-cyan-300'}`}>
                {inventoryCount}/6 ITEMS {isVaultOverflow && `(OVERFLOW +${excessItems})`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">EQUIPMENT REST:</span>
              <span className="text-cyan-300 font-bold">PAUSED UNTIL YOU CLICK START</span>
            </div>
          </div>

          <button
            onClick={onStartNextFloor}
            disabled={isVaultOverflow}
            id="btn-start-next-floor"
            className={`w-full font-mono font-black text-lg py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 ${
              isVaultOverflow
                ? 'bg-rose-950/60 border-2 border-rose-500/60 text-rose-300 opacity-80 cursor-not-allowed shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                : 'bg-[#38EF7D] hover:bg-[#32D970] active:bg-[#2CBF62] text-[#0B0E1B] shadow-[0_0_30px_rgba(56,239,125,0.4)] hover:scale-105 active:scale-95 cursor-pointer'
            }`}
          >
            {isVaultOverflow ? (
              <>
                <AlertTriangle className="w-6 h-6 text-rose-400 animate-bounce" />
                <span className="tracking-[0.1em] uppercase">VAULT FULL — DELETE {excessItems} ITEM{excessItems > 1 ? 'S' : ''} TO START</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-current" />
                <span className="tracking-[0.15em] uppercase">START FLOOR #{level} NOW</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Case 3: Game Over Screen
  if (isGameOver) {
    return (
      <div className="w-full min-h-[420px] bg-slate-950/95 border-4 border-red-600/80 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center backdrop-blur-xl relative overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.4)] animate-pulse font-mono">
        {/* Background Glitch Aura */}
        <div className="absolute inset-0 bg-red-950/30 pointer-events-none" />

        <div className="z-10 flex flex-col items-center max-w-md">
          <div className="p-4 bg-red-950/80 border-2 border-red-500 rounded-full mb-4 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]">
            <Skull className="w-16 h-16 animate-bounce" />
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-red-500 tracking-wider mb-2 drop-shadow-[0_2px_10px_rgba(239,68,68,0.8)]">
            GAME OVER
          </h1>

          <p className="text-slate-300 text-sm mb-6">
            TIME EXPIRED! The Dungeon Master's bizarre creature overwhelmed your party!
          </p>

          <div className="w-full bg-slate-900/90 border border-red-500/40 rounded-xl p-4 mb-6 text-left text-xs space-y-2">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-slate-400">STAGE REACHED:</span>
              <span className="text-amber-400 font-bold text-sm">FLOOR #{monster?.level || level}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-slate-400">LAST MONSTER:</span>
              <span className="text-rose-400 font-bold">{monster?.name || 'Unknown Abomination'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">ALL-TIME HIGH SCORE:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-yellow-400" /> STAGE #{highScore}
              </span>
            </div>
          </div>

          <button
            onClick={onTryAgain}
            id="btn-try-again"
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-mono font-black text-lg px-6 py-3.5 rounded-xl transition-all shadow-[0_0_25px_rgba(225,29,72,0.6)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500" />
            <span>TRY AGAIN (STAGE 1)</span>
          </button>
        </div>
      </div>
    );
  }

  // Case 4: Loading Monster Screen
  if (loadingMonster || !monster) {
    return (
      <div className="w-full flex-1 min-h-[380px] bg-slate-900/60 border-2 border-dashed border-emerald-500/30 rounded-2xl flex flex-col items-center justify-center p-8 text-center backdrop-blur font-mono">
        <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin mb-4" />
        <h3 className="text-emerald-400 text-lg font-bold">
          DUNGEON MASTER IS CREATING A BIZARRE MONSTER...
        </h3>
        <p className="text-slate-400 text-xs max-w-sm mt-2">
          Consulting ancient retro archives to formulate an absurd opponent!
        </p>
      </div>
    );
  }

  const hpPercent = Math.max(0, Math.min(100, (monster.hp / monster.maxHp) * 100));
  const timePercent = Math.max(0, Math.min(100, (timeRemaining / maxTime) * 100));
  const isTimeCritical = timeRemaining <= 3.0;

  // Case 5: Active Battle Screen
  return (
    <div className="w-full flex flex-col items-center gap-4 relative font-mono">
      {/* Monster Information Card */}
      <div className="w-full bg-slate-950/80 border-2 border-emerald-500/40 rounded-2xl p-4 md:p-6 shadow-[0_0_25px_rgba(16,185,129,0.15)] flex flex-col items-center relative overflow-hidden backdrop-blur-md">
        
        {/* Background Radial Glow using Monster Hex Color */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none transition-all duration-500"
          style={{
            background: `radial-gradient(circle at center, ${monster.color_hex} 0%, transparent 70%)`
          }}
        />

        {/* Top Badges */}
        <div className="w-full flex items-center justify-between gap-2 mb-2 z-10 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-mono font-bold px-2.5 py-1 rounded border shadow text-slate-950 uppercase"
              style={{
                backgroundColor: monster.color_hex,
                borderColor: monster.color_hex
              }}
            >
              {monster.isBoss ? '👑 MEGA BOSS' : `LVL ${monster.level}`}
            </span>
            <span className="bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono px-2 py-0.5 rounded flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> {monster.ability}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
            <Gift className="w-3.5 h-3.5 text-purple-400" />
            <span>DROPS:</span>
            <span className="text-purple-300 font-bold">{monster.loot_item}</span>
          </div>
        </div>

        {/* Monster Name */}
        <h2
          className="text-2xl md:text-3xl font-black font-mono tracking-wide text-center my-1 z-10"
          style={{ color: monster.color_hex }}
        >
          {monster.name}
        </h2>

        {/* Flavor Backstory */}
        <p className="text-slate-300 italic font-sans text-xs md:text-sm text-center max-w-lg mb-3 z-10 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
          "{monster.flavor_text}"
        </p>

        {/* Stage Timer Countdown Bar */}
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-xl p-2 mb-3 z-10 flex flex-col gap-1">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-slate-400 flex items-center gap-1 font-bold">
              <Clock className={`w-3.5 h-3.5 ${isTimeCritical ? 'text-red-500 animate-spin' : 'text-cyan-400'}`} />
              STAGE TIME:
            </span>
            <span
              className={`font-bold ${
                isTimeCritical ? 'text-red-400 animate-pulse text-sm' : 'text-cyan-300'
              }`}
            >
              {isTimeCritical && <AlertTriangle className="w-3 h-3 inline mr-1 text-red-500" />}
              {timeRemaining.toFixed(1)}s / {maxTime.toFixed(1)}s
            </span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-100 ${
                isTimeCritical
                  ? 'bg-red-500 animate-pulse'
                  : timePercent < 50
                  ? 'bg-amber-400'
                  : 'bg-cyan-400'
              }`}
              style={{ width: `${timePercent}%` }}
            />
          </div>
        </div>

        {/* Health Bar */}
        <div className="w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-full h-7 relative overflow-hidden shadow-inner mb-6 z-10">
          <div
            className={`h-full transition-all duration-150 rounded-full ${
              monster.isBoss
                ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500'
                : 'bg-gradient-to-r from-emerald-600 to-teal-400'
            }`}
            style={{ width: `${hpPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs md:text-sm text-slate-100 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
            <HeartPulse className="w-4 h-4 mr-1 text-rose-400 animate-pulse" />
            {Math.ceil(monster.hp).toLocaleString()} / {monster.maxHp.toLocaleString()} HP ({hpPercent.toFixed(1)}%)
          </div>
        </div>

        {/* Monster Interactive Tap Area */}
        <div className="relative my-2 z-20 flex items-center justify-center">
          <MonsterSprite
            colorHex={monster.color_hex}
            name={monster.name}
            isHit={isHit}
            isBoss={monster.isBoss}
            isDead={monster.hp <= 0}
            onClick={onMonsterTap}
          />

          {/* Floating Damage Numbers */}
          {floatingTexts.map((ft) => (
            <div
              key={ft.id}
              className={`absolute pointer-events-none font-mono font-black animate-float-fade ${
                ft.isCrit
                  ? 'text-yellow-300 text-2xl md:text-3xl drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]'
                  : 'text-emerald-400 text-lg md:text-xl'
              }`}
              style={{
                left: `${ft.x}%`,
                top: `${ft.y}%`
              }}
            >
              {ft.text}
            </div>
          ))}
        </div>

        {/* Reroll Monster / DM Bribe Button */}
        <div className="mt-4 z-10 flex items-center gap-3">
          <button
            onClick={onRequestNewMonster}
            id="btn-summon-monster"
            className="bg-slate-900 hover:bg-slate-800 border border-emerald-500/50 hover:border-emerald-400 text-emerald-400 font-mono text-xs px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 shadow-md group cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300 text-emerald-300" />
            <span>Summon New DM Monster</span>
          </button>
        </div>
      </div>

      {/* Active Spells Bar */}
      <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-center gap-2 md:gap-4 flex-wrap backdrop-blur">
        <span className="text-slate-400 font-mono text-xs font-bold uppercase tracking-wider mr-1 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> DM SPELLS:
        </span>

        {spells.map((spell) => {
          const now = Date.now();
          const isActive = spell.activeUntil > now;
          const isCoolingDown = !isActive && spell.readyAt > now;
          const cdRemainingSec = Math.ceil((spell.readyAt - now) / 1000);

          return (
            <button
              key={spell.id}
              onClick={() => onCastSpell(spell.id)}
              disabled={isActive || isCoolingDown}
              className={`px-3 py-2 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-2 border ${
                isActive
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse'
                  : isCoolingDown
                  ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-emerald-950/60 border-emerald-500/50 hover:bg-emerald-900/60 text-emerald-300 hover:scale-105 active:scale-95 shadow-md cursor-pointer'
              }`}
              title={spell.description}
            >
              <span>{spell.icon}</span>
              <span>{spell.name}</span>
              {isActive && <span className="text-amber-400 text-[10px] uppercase">(ACTIVE!)</span>}
              {isCoolingDown && <span className="text-slate-500 text-[10px]">({cdRemainingSec}s)</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

function HeartPulse(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M12 5 9 12h6l-3 7" />
    </svg>
  );
}

