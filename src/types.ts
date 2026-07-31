export interface Monster {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  flavor_text: string;
  ability: string;
  loot_item: string;
  color_hex: string;
  isBoss?: boolean;
  level: number;
  bountyGold: number;
  theme?: string;
}

export interface LootItem {
  id: string;
  name: string;
  monsterSource: string;
  flavor_text: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  bonusType: 'clickPower' | 'autoDps' | 'critChance' | 'stageTime';
  bonusValue: number;
  bonusDescription?: string;
  icon: string;
  value: number;
  acquiredAt: number;
  isEquipped?: boolean;
}

export interface HeroCompanion {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseCost: number;
  baseDps: number;
  count: number;
  level: number;
  costMultiplier: number;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  baseCost: number;
  costMultiplier: number;
  effectType: 'clickPower' | 'critChance' | 'critMult' | 'goldMult' | 'dmfavor';
  effectValue: number;
}

export interface ActiveSpell {
  id: string;
  name: string;
  description: string;
  icon: string;
  cooldownSec: number;
  durationSec: number;
  activeUntil: number;
  readyAt: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  isCrit: boolean;
  color: string;
}

export interface DmLogMessage {
  id: string;
  sender: 'DM' | 'SYSTEM' | 'LOOT';
  text: string;
  timestamp: number;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  highestFloor: number;
  totalGold: number;
  timeTaken?: number; // total time taken in seconds
  title: string;
  updatedAt: string;
  rank?: number;
}
