import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Monster, LootItem, Upgrade, HeroCompanion, ActiveSpell, FloatingText, DmLogMessage } from './types';
import { ArcadeHeader } from './components/ArcadeHeader';
import { MonsterBattleArena } from './components/MonsterBattleArena';
import { LootInventory } from './components/LootInventory';
import { DmConsole } from './components/DmConsole';
import { LoginScreen } from './components/LoginScreen';
import { LeaderboardModal } from './components/LeaderboardModal';
import { soundEngine } from './utils/audio';

const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: 'upg_click',
    name: 'Pixel Gauntlet',
    description: '+5 Click Damage per level',
    icon: '🥊',
    level: 1,
    baseCost: 15,
    costMultiplier: 1.15,
    effectType: 'clickPower',
    effectValue: 5
  },
  {
    id: 'upg_crit_chance',
    name: 'Critical Glitch',
    description: '+3% Critical Strike Chance',
    icon: '⚡',
    level: 0,
    baseCost: 50,
    costMultiplier: 1.25,
    effectType: 'critChance',
    effectValue: 3
  },
  {
    id: 'upg_crit_mult',
    name: 'Combo Overdrive',
    description: '+0.5x Critical Multiplier',
    icon: '💥',
    level: 0,
    baseCost: 100,
    costMultiplier: 1.35,
    effectType: 'critMult',
    effectValue: 0.5
  },
  {
    id: 'upg_gold',
    name: 'Arcade Coin Magnet',
    description: '+25% Gold dropped by monsters',
    icon: '🧲',
    level: 0,
    baseCost: 80,
    costMultiplier: 1.3,
    effectType: 'goldMult',
    effectValue: 0.25
  },
  {
    id: 'upg_favor',
    name: 'DM Coffee Bribery',
    description: '+10% DM Favor (Higher rare drop chance)',
    icon: '☕',
    level: 0,
    baseCost: 200,
    costMultiplier: 1.4,
    effectType: 'dmfavor',
    effectValue: 10
  }
];

const INITIAL_HEROES: HeroCompanion[] = [
  {
    id: 'hero_rogue',
    name: '👾 8-Bit Rogue',
    description: 'Chips away at monster HP with pixelated daggers.',
    icon: '👾',
    baseCost: 50,
    baseDps: 8,
    count: 0,
    level: 0,
    costMultiplier: 1.15
  },
  {
    id: 'hero_wizard',
    name: '🧙‍♂️ Turbo Wizard',
    description: 'Casts retro arc fireballs at high velocity.',
    icon: '🧙‍♂️',
    baseCost: 250,
    baseDps: 45,
    count: 0,
    level: 0,
    costMultiplier: 1.2
  },
  {
    id: 'hero_cyber',
    name: '🤖 Cyber Bot',
    description: 'Fires continuous neon laser pulse bursts.',
    icon: '🤖',
    baseCost: 1200,
    baseDps: 220,
    count: 0,
    level: 0,
    costMultiplier: 1.25
  },
  {
    id: 'hero_knight',
    name: '⚡ Plasma Knight',
    description: 'Swings an energized laser broadsword.',
    icon: '⚡',
    baseCost: 6000,
    baseDps: 1100,
    count: 0,
    level: 0,
    costMultiplier: 1.3
  }
];

const INITIAL_SPELLS: ActiveSpell[] = [
  {
    id: 'spell_overclock',
    name: 'Overclock Turbo',
    description: '3x Click Power for 10 seconds!',
    icon: '🚀',
    cooldownSec: 25,
    durationSec: 10,
    activeUntil: 0,
    readyAt: 0
  },
  {
    id: 'spell_nuke',
    name: 'DM Nuke',
    description: 'Deal 25% of monster max HP instantly!',
    icon: '💣',
    cooldownSec: 40,
    durationSec: 0,
    activeUntil: 0,
    readyAt: 0
  },
  {
    id: 'spell_gold',
    name: 'Loot Rain',
    description: '5x Gold multiplier for 15 seconds!',
    icon: '💰',
    cooldownSec: 50,
    durationSec: 15,
    activeUntil: 0,
    readyAt: 0
  }
];

export default function App() {
  // Auth / Login State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [battleName, setBattleName] = useState(() => {
    return localStorage.getItem('dungeon_battle_name') || 'HERO_42';
  });

  // Game State
  const [level, setLevel] = useState(1);
  const [gold, setGold] = useState(50);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('dungeon_clicker_highscore') || '1', 10);
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState('random');

  const [upgrades, setUpgrades] = useState<Upgrade[]>(INITIAL_UPGRADES);
  const [heroes, setHeroes] = useState<HeroCompanion[]>(INITIAL_HEROES);
  const [spells, setSpells] = useState<ActiveSpell[]>(INITIAL_SPELLS);
  const [inventory, setInventory] = useState<LootItem[]>([]);
  const [logs, setLogs] = useState<DmLogMessage[]>([]);

  const [monster, setMonster] = useState<Monster | null>(null);
  const [loadingMonster, setLoadingMonster] = useState(false);
  const [isHit, setIsHit] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  // Stage Timer, Intermission & Game Over States
  const [maxTime, setMaxTime] = useState(10);
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isRunActive, setIsRunActive] = useState(false);
  const [isIntermission, setIsIntermission] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // Auto sync player score to global leaderboard
  useEffect(() => {
    if (isLoggedIn && battleName) {
      fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: battleName,
          highestFloor: highScore,
          totalGold: gold
        })
      }).catch((err) => console.warn('Leaderboard score sync error:', err));
    }
  }, [isLoggedIn, battleName, highScore]);

  // Ref to hold current state for interval ticks without stale closures
  const stateRef = useRef({
    monster,
    level,
    gold,
    upgrades,
    heroes,
    spells,
    soundEnabled,
    selectedTheme,
    inventory,
    isGameOver,
    loadingMonster,
    isRunActive,
    isIntermission
  });

  useEffect(() => {
    stateRef.current = {
      monster,
      level,
      gold,
      upgrades,
      heroes,
      spells,
      soundEnabled,
      selectedTheme,
      inventory,
      isGameOver,
      loadingMonster,
      isRunActive,
      isIntermission
    };
  }, [
    monster,
    level,
    gold,
    upgrades,
    heroes,
    spells,
    soundEnabled,
    selectedTheme,
    inventory,
    isGameOver,
    loadingMonster,
    isRunActive,
    isIntermission
  ]);

  // Derived Stats Calculations
  const equippedItems = inventory.filter((item) => item.isEquipped);
  const equippedClickPowerBonus = equippedItems
    .filter((i) => i.bonusType === 'clickPower')
    .reduce((sum, i) => sum + i.bonusValue, 0);
  const equippedDpsBonus = equippedItems
    .filter((i) => i.bonusType === 'autoDps')
    .reduce((sum, i) => sum + i.bonusValue, 0);
  const equippedCritBonus = equippedItems
    .filter((i) => i.bonusType === 'critChance')
    .reduce((sum, i) => sum + i.bonusValue, 0);
  const equippedTimeBonus = equippedItems
    .filter((i) => i.bonusType === 'stageTime')
    .reduce((sum, i) => sum + i.bonusValue, 0);

  const clickPowerUpgrade = upgrades.find((u) => u.id === 'upg_click');
  const baseClickPower = 5 + (clickPowerUpgrade ? clickPowerUpgrade.level * clickPowerUpgrade.effectValue : 0);

  const critChanceUpgrade = upgrades.find((u) => u.id === 'upg_crit_chance');
  const critChance = 5 + (critChanceUpgrade ? critChanceUpgrade.level * critChanceUpgrade.effectValue : 0) + equippedCritBonus;

  const critMultUpgrade = upgrades.find((u) => u.id === 'upg_crit_mult');
  const critMultiplier = 2.0 + (critMultUpgrade ? critMultUpgrade.level * critMultUpgrade.effectValue : 0);

  const goldMultUpgrade = upgrades.find((u) => u.id === 'upg_gold');
  let goldMultiplier = 1.0 + (goldMultUpgrade ? goldMultUpgrade.level * goldMultUpgrade.effectValue : 0);

  const favorUpgrade = upgrades.find((u) => u.id === 'upg_favor');
  const dmFavor = favorUpgrade ? favorUpgrade.level * favorUpgrade.effectValue : 0;

  // Active Spells Boosts
  const now = Date.now();
  const isOverclockActive = spells.find((s) => s.id === 'spell_overclock')?.activeUntil! > now;
  const isGoldRainActive = spells.find((s) => s.id === 'spell_gold')?.activeUntil! > now;

  const currentClickPower = baseClickPower * (1 + equippedClickPowerBonus) * (isOverclockActive ? 3 : 1);
  if (isGoldRainActive) {
    goldMultiplier *= 5;
  }

  const baseDps = heroes.reduce((sum, h) => sum + h.baseDps * h.level, 0);
  const totalDps = baseDps * (1 + equippedDpsBonus);

  // Helper: Log message to DM Console
  const addDmLog = useCallback((text: string, sender: 'DM' | 'SYSTEM' | 'LOOT' = 'DM') => {
    setLogs((prev) => [
      {
        id: Math.random().toString(36).substring(2, 9),
        sender,
        text,
        timestamp: Date.now()
      },
      ...prev.slice(0, 30) // Keep last 30 logs
    ]);
  }, []);

  // Fetch Monster from Express Server API
  const fetchNewMonster = useCallback(async (stageLvl: number, customTheme?: string) => {
    setLoadingMonster(true);
    const isBoss = stageLvl % 5 === 0;

    try {
      const themeToUse = customTheme || stateRef.current.selectedTheme;
      const res = await fetch('/api/generate-monster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: stageLvl,
          theme: themeToUse,
          isBoss
        })
      });

      if (!res.ok) throw new Error('Failed to fetch monster');
      const data = await res.json();

      // Monster HP starts at 50 for level 1 and increases by 50 each floor
      const scaledHp = Math.floor(stageLvl * 50 * (isBoss ? 1.5 : 1.0));

      const newMonster: Monster = {
        id: Math.random().toString(36).substring(2, 9),
        name: data.name,
        hp: scaledHp,
        maxHp: scaledHp,
        flavor_text: data.flavor_text,
        ability: data.ability,
        loot_item: data.loot_item,
        color_hex: data.color_hex,
        isBoss,
        level: stageLvl,
        bountyGold: Math.floor(scaledHp * 0.5 * (isBoss ? 2.0 : 1.0)),
        theme: themeToUse
      };

      // Set Stage Timer Countdown (Base + Equipped Time Bonuses stacked)
      const equippedTimeBonus = stateRef.current.inventory
        .filter((i) => i.isEquipped && i.bonusType === 'stageTime')
        .reduce((sum, i) => sum + i.bonusValue, 0);

      const baseStageMaxTime = isBoss ? 15.0 : Math.max(7.0, 10.0 - Math.floor((stageLvl - 1) / 8) * 0.5);
      const stageMaxTime = Number((baseStageMaxTime + equippedTimeBonus).toFixed(1));

      setMaxTime(stageMaxTime);
      setTimeRemaining(stageMaxTime);
      setIsGameOver(false);

      setMonster(newMonster);
      addDmLog(
        isBoss
          ? `🔥 BOSS FLOOR #${stageLvl}! Dungeon Master presents: ${newMonster.name}! (${newMonster.flavor_text})`
          : `Spawned ${newMonster.name}! "${newMonster.flavor_text}"`
      );
    } catch (err) {
      console.error('Error fetching monster:', err);
      // Client fallback with exact 50 HP per level rule
      const fallbackHp = Math.floor(stageLvl * 50 * (isBoss ? 1.5 : 1.0));
      const equippedTimeBonus = stateRef.current.inventory
        .filter((i) => i.isEquipped && i.bonusType === 'stageTime')
        .reduce((sum, i) => sum + i.bonusValue, 0);

      const baseStageMaxTime = isBoss ? 15.0 : 10.0;
      const stageMaxTime = Number((baseStageMaxTime + equippedTimeBonus).toFixed(1));

      setMaxTime(stageMaxTime);
      setTimeRemaining(stageMaxTime);
      setIsGameOver(false);

      setMonster({
        id: Math.random().toString(36).substring(2, 9),
        name: isBoss ? 'GIGA-GLITCH OVERLORD' : 'Neon Arcade Slime',
        hp: fallbackHp,
        maxHp: fallbackHp,
        flavor_text: 'A creature born from lost quarters and uncleaned arcade CRTs.',
        ability: 'Scanline Zap',
        loot_item: 'Shiny 1UP Token',
        color_hex: '#FF0055',
        isBoss,
        level: stageLvl,
        bountyGold: Math.floor(fallbackHp * 0.4)
      });
    } finally {
      setLoadingMonster(false);
    }
  }, [addDmLog]);

  // Initial Sound Setup
  useEffect(() => {
    soundEngine.setEnabled(soundEnabled);
  }, []);

  // Start Run handler
  const handleStartRun = useCallback(() => {
    setIsGameOver(false);
    setIsIntermission(false);
    setLevel(1);
    setGold(50);
    setUpgrades(INITIAL_UPGRADES);
    setHeroes(INITIAL_HEROES);
    setSpells(INITIAL_SPELLS);
    setIsRunActive(true);
    addDmLog(`⚔️ BATTLE STARTED! ${battleName} enters Floor #1...`, 'SYSTEM');
    fetchNewMonster(1);
  }, [battleName, fetchNewMonster, addDmLog]);

  // Start Next Floor handler (after equipment check intermission)
  const handleStartNextFloor = useCallback(() => {
    setIsIntermission(false);
    addDmLog(`⚔️ Entering Floor #${level}...`, 'SYSTEM');
    fetchNewMonster(level);
  }, [level, fetchNewMonster, addDmLog]);

  // Restart / Try Again handler back to Stage 1
  const handleTryAgain = () => {
    setIsGameOver(false);
    setIsIntermission(false);
    setLevel(1);
    setGold(50);
    setUpgrades(INITIAL_UPGRADES);
    setHeroes(INITIAL_HEROES);
    setSpells(INITIAL_SPELLS);
    setInventory([]);
    setIsRunActive(true);
    addDmLog('🔄 COIN INSERTED! Restarting dungeon run from Stage 1...', 'SYSTEM');
    fetchNewMonster(1);
  };

  // Update Sound Engine toggle
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEngine.setEnabled(next);
  };

  // Toggle Equip Loot Item
  const handleToggleEquipLoot = (itemId: string) => {
    setInventory((prev) => {
      const target = prev.find((i) => i.id === itemId);
      if (!target) return prev;

      const currentlyEquippedCount = prev.filter((i) => i.isEquipped).length;
      if (!target.isEquipped && currentlyEquippedCount >= 3) {
        addDmLog('⚠️ VAULT LIMIT! You can equip a maximum of 3 battle loot items simultaneously!', 'SYSTEM');
        return prev;
      }

      const nextEquipped = !target.isEquipped;

      // Adjust stage timer immediately on screen if equipping or unequipping time loot
      if (target.bonusType === 'stageTime') {
        const delta = target.bonusValue;
        if (nextEquipped) {
          setTimeRemaining((prevTime) => Number((prevTime + delta).toFixed(1)));
          setMaxTime((prevMax) => Number((prevMax + delta).toFixed(1)));
          addDmLog(`⏱️ TIME EXTENDED! +${delta}s added to stage clock on screen!`, 'LOOT');
        } else {
          setTimeRemaining((prevTime) => Math.max(0.1, Number((prevTime - delta).toFixed(1))));
          setMaxTime((prevMax) => Math.max(5.0, Number((prevMax - delta).toFixed(1))));
          addDmLog(`⏱️ TIME REDUCED! -${delta}s removed from stage clock.`, 'LOOT');
        }
      }

      addDmLog(
        nextEquipped
          ? `⚡ EQUIPPED [${target.name}] in battle slot! (${target.bonusDescription || 'Active'})`
          : `🛡️ Unequipped [${target.name}].`,
        'LOOT'
      );

      return prev.map((i) => (i.id === itemId ? { ...i, isEquipped: nextEquipped } : i));
    });
  };

  // Trigger Monster Defeat Logic
  const handleMonsterDefeated = useCallback((killedMonster: Monster) => {
    soundEngine.playDeathSound(killedMonster.isBoss);

    // Calculate Gold Bounty
    const earnedGold = Math.floor(killedMonster.bountyGold * goldMultiplier);
    setGold((prev) => prev + earnedGold);

    // Drop Loot Item
    const rarityRoll = Math.random() * 100 + dmFavor;
    let rarity: LootItem['rarity'] = 'common';
    let icon = '📦';
    let valueMultiplier = 1;

    if (rarityRoll > 95) {
      rarity = 'legendary';
      icon = '🌟';
      valueMultiplier = 5;
    } else if (rarityRoll > 80) {
      rarity = 'epic';
      icon = '💜';
      valueMultiplier = 3;
    } else if (rarityRoll > 60) {
      rarity = 'rare';
      icon = '💙';
      valueMultiplier = 2;
    } else if (rarityRoll > 35) {
      rarity = 'uncommon';
      icon = '💚';
      valueMultiplier = 1.5;
    }

    const bonusTypes: LootItem['bonusType'][] = ['clickPower', 'autoDps', 'critChance', 'stageTime'];
    const bonusType = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
    let bonusValue = 0.1;
    let bonusDescription = '';

    if (bonusType === 'clickPower') {
      bonusValue = 0.10 * valueMultiplier;
      bonusDescription = `+${Math.round(bonusValue * 100)}% Tap Damage`;
    } else if (bonusType === 'autoDps') {
      bonusValue = 0.15 * valueMultiplier;
      bonusDescription = `+${Math.round(bonusValue * 100)}% Hero DPS`;
    } else if (bonusType === 'critChance') {
      bonusValue = Math.round(3 * valueMultiplier);
      bonusDescription = `+${bonusValue}% Crit Chance`;
    } else if (bonusType === 'stageTime') {
      bonusValue = Number((1.0 * valueMultiplier).toFixed(1));
      bonusDescription = `+${bonusValue}s Stage Time`;
    }

    const itemValue = Math.floor(20 * valueMultiplier * killedMonster.level);
    const newLoot: LootItem = {
      id: Math.random().toString(36).substring(2, 9),
      name: killedMonster.loot_item,
      monsterSource: killedMonster.name,
      flavor_text: `Dropped upon death by ${killedMonster.name}.`,
      rarity,
      bonusType,
      bonusValue,
      bonusDescription,
      icon,
      value: itemValue,
      acquiredAt: Date.now(),
      isEquipped: false
    };

    setInventory((prev) => [newLoot, ...prev]);

    // Progress Level
    const nextLevel = level + 1;
    setLevel(nextLevel);
    if (nextLevel > highScore) {
      setHighScore(nextLevel);
      localStorage.setItem('dungeon_clicker_highscore', nextLevel.toString());
    }

    // Clear monster & enter equipment check intermission
    setMonster(null);
    setIsIntermission(true);

    addDmLog(`VICTORY! ${killedMonster.name} collapsed into pixels! +${earnedGold} Gold & Looted: [${newLoot.name}] (${bonusDescription})!`, 'LOOT');
    addDmLog(`🛡️ EQUIPMENT CHECK: Review your vault & equip gear! Click START when ready for Floor #${nextLevel}.`, 'SYSTEM');
  }, [goldMultiplier, dmFavor, level, highScore, addDmLog]);

  // Main Game Loop Interval (Auto DPS & Stage Timer Countdown)
  useEffect(() => {
    const interval = setInterval(() => {
      const current = stateRef.current;

      // 1. Pause if in intermission, run not active, game over, loading, or no monster
      if (current.isIntermission || !current.isRunActive || current.isGameOver || current.loadingMonster || !current.monster || current.monster.hp <= 0) return;

      // 2. Countdown Stage Timer
      setTimeRemaining((prevTime) => {
        const nextTime = Math.max(0, prevTime - 0.1);
        if (nextTime <= 0) {
          setIsGameOver(true);
          soundEngine.playGameOverSound();
          addDmLog(`⏰ TIME EXPIRED! You failed to defeat ${current.monster?.name} in time! GAME OVER!`, 'SYSTEM');
          return 0;
        }
        return nextTime;
      });

      // 4. Auto Heroes DPS
      const dpsStep = (current.heroes.reduce((sum, h) => sum + h.baseDps * h.level, 0)) * 0.1;
      if (dpsStep > 0) {
        setMonster((prev) => {
          if (!prev || prev.hp <= 0) return prev;
          const newHp = prev.hp - dpsStep;
          if (newHp <= 0) {
            handleMonsterDefeated(prev);
            return { ...prev, hp: 0 };
          }
          return { ...prev, hp: newHp };
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [heroes, handleMonsterDefeated, fetchNewMonster, addDmLog]);

  // Handle Tap / Click on Monster
  const handleMonsterTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isGameOver || !monster || monster.hp <= 0) return;

    // Check Critical Strike
    const isCrit = Math.random() * 100 < critChance;
    const damage = Math.round(currentClickPower * (isCrit ? critMultiplier : 1.0));

    // Play hit sound
    soundEngine.playHitSound(isCrit);

    // Sprite Hit Flash animation
    setIsHit(true);
    setTimeout(() => setIsHit(false), 100);

    // Floating text positioning
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const newFt: FloatingText = {
      id: Math.random().toString(36).substring(2, 9),
      text: isCrit ? `💥 CRIT! ${damage}` : `-${damage}`,
      x: Math.max(10, Math.min(80, clickX)),
      y: Math.max(10, Math.min(80, clickY)),
      isCrit,
      color: isCrit ? '#FACC15' : '#34D399'
    };

    setFloatingTexts((prev) => [...prev, newFt]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((ft) => ft.id !== newFt.id));
    }, 800);

    // Subtract HP
    setMonster((prev) => {
      if (!prev) return null;
      const newHp = prev.hp - damage;
      if (newHp <= 0) {
        handleMonsterDefeated(prev);
        return { ...prev, hp: 0 };
      }
      return { ...prev, hp: newHp };
    });
  };

  // Buy Upgrade Handler
  const handleBuyUpgrade = (upgradeId: string) => {
    const upg = upgrades.find((u) => u.id === upgradeId);
    if (!upg) return;

    const cost = Math.floor(upg.baseCost * Math.pow(upg.costMultiplier, upg.level));
    if (gold < cost) return;

    setGold((prev) => prev - cost);
    setUpgrades((prev) =>
      prev.map((u) => (u.id === upgradeId ? { ...u, level: u.level + 1 } : u))
    );
    soundEngine.playUpgradeSound();
  };

  // Buy Hero Handler
  const handleBuyHero = (heroId: string) => {
    const hero = heroes.find((h) => h.id === heroId);
    if (!hero) return;

    const cost = Math.floor(hero.baseCost * Math.pow(hero.costMultiplier, hero.level));
    if (gold < cost) return;

    setGold((prev) => prev - cost);
    setHeroes((prev) =>
      prev.map((h) => (h.id === heroId ? { ...h, level: h.level + 1 } : h))
    );
    soundEngine.playUpgradeSound();
  };

  // Cast Spell Handler
  const handleCastSpell = (spellId: string) => {
    const spell = spells.find((s) => s.id === spellId);
    if (!spell) return;

    const now = Date.now();
    if (spell.readyAt > now || spell.activeUntil > now) return;

    soundEngine.playSpellSound();

    if (spellId === 'spell_nuke') {
      if (monster && monster.hp > 0) {
        const nukeDmg = Math.round(monster.maxHp * 0.25);
        addDmLog(`💣 DM NUKE UNLEASHED! Dealt ${nukeDmg} damage to ${monster.name}!`);
        setMonster((prev) => {
          if (!prev) return null;
          const newHp = prev.hp - nukeDmg;
          if (newHp <= 0) {
            handleMonsterDefeated(prev);
            return { ...prev, hp: 0 };
          }
          return { ...prev, hp: newHp };
        });
      }
    }

    setSpells((prev) =>
      prev.map((s) => {
        if (s.id === spellId) {
          return {
            ...s,
            activeUntil: now + s.durationSec * 1000,
            readyAt: now + (s.durationSec + s.cooldownSec) * 1000
          };
        }
        return s;
      })
    );
  };

  // Sell Item in Loot Vault
  const handleSellLoot = (itemId: string) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;

    setGold((prev) => prev + item.value);
    setInventory((prev) => prev.filter((i) => i.id !== itemId));
    soundEngine.playUpgradeSound();
  };

  // Sell All Items
  const handleClearInventory = () => {
    const totalVal = inventory.reduce((sum, item) => sum + item.value, 0);
    setGold((prev) => prev + totalVal);
    setInventory([]);
    soundEngine.playUpgradeSound();
  };

  // Custom DM Prompt Submission
  const handleSendCustomDmPrompt = (customTheme: string) => {
    addDmLog(`Summoning DM custom request: "${customTheme}"...`);
    fetchNewMonster(level, customTheme);
  };

  // Login Handler
  const handleLogin = (name: string) => {
    setBattleName(name);
    localStorage.setItem('dungeon_battle_name', name);
    setIsLoggedIn(true);
    addDmLog(`⚔️ HERO ENTERED THE DUNGEON: Welcome, ${name}!`, 'SYSTEM');
  };

  // Logout Handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsRunActive(false);
    setIsIntermission(false);
    setMonster(null);
  };

  if (!isLoggedIn) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        highScore={highScore}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      {/* CRT Scanline Overlay */}
      {crtEnabled && <div className="crt-overlay" />}

      {/* Main Arcade Header Bar */}
      <ArcadeHeader
        level={level}
        isBoss={level % 5 === 0}
        gold={gold}
        totalDps={totalDps}
        clickPower={currentClickPower}
        dmFavor={dmFavor}
        highScore={highScore}
        soundEnabled={soundEnabled}
        crtEnabled={crtEnabled}
        selectedTheme={selectedTheme}
        battleName={battleName}
        onLogout={handleLogout}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onToggleSound={handleToggleSound}
        onToggleCrt={() => setCrtEnabled(!crtEnabled)}
        onSelectTheme={(theme) => {
          setSelectedTheme(theme);
          fetchNewMonster(level, theme);
        }}
      />

      {/* Main Game Container */}
      <main className="max-w-7xl w-full mx-auto p-3 md:p-6 flex flex-col gap-6 flex-1 z-10">
        
        {/* Upper Battle Arena Stage */}
        <MonsterBattleArena
          monster={monster}
          loadingMonster={loadingMonster}
          isHit={isHit}
          floatingTexts={floatingTexts}
          spells={spells}
          timeRemaining={timeRemaining}
          maxTime={maxTime}
          isGameOver={isGameOver}
          highScore={highScore}
          isRunActive={isRunActive}
          isIntermission={isIntermission}
          inventoryCount={inventory.length}
          level={level}
          battleName={battleName}
          onStartRun={handleStartRun}
          onStartNextFloor={handleStartNextFloor}
          onMonsterTap={handleMonsterTap}
          onCastSpell={handleCastSpell}
          onRequestNewMonster={() => fetchNewMonster(level)}
          onTryAgain={handleTryAgain}
        />

        {/* Lower Grid: Absurd Loot Vault & Dungeon Master AI Console */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LootInventory
            inventory={inventory}
            onSellLoot={handleSellLoot}
            onToggleEquipLoot={handleToggleEquipLoot}
            onClearInventory={handleClearInventory}
          />

          <DmConsole
            logs={logs}
            currentMonster={monster}
            onSendCustomDmPrompt={handleSendCustomDmPrompt}
            loadingCustomPrompt={loadingMonster}
          />
        </div>
      </main>

      {/* Global Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentBattleName={battleName}
        currentHighScore={highScore}
        currentGold={gold}
      />

      {/* Arcade Footer */}
      <footer className="w-full bg-slate-950 border-t border-slate-900 py-3 text-center text-slate-600 font-mono text-xs z-10">
        ARCADE DUNGEON MASTER • POWERED BY GEMINI AI • INSERT COIN TO PLAY
      </footer>
    </div>
  );
}
