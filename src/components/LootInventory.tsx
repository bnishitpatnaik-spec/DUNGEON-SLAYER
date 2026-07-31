import React from 'react';
import { LootItem } from '../types';
import { Package, Coins, Sparkles, Trash2, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';

interface LootInventoryProps {
  inventory: LootItem[];
  onSellLoot: (itemId: string) => void;
  onToggleEquipLoot: (itemId: string) => void;
  onClearInventory: () => void;
}

export const LootInventory: React.FC<LootInventoryProps> = ({
  inventory,
  onSellLoot,
  onToggleEquipLoot,
  onClearInventory
}) => {
  const getRarityBadge = (rarity: LootItem['rarity']) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'epic':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'rare':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
      case 'uncommon':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
      default:
        return 'bg-slate-700/40 text-slate-400 border-slate-600';
    }
  };

  const totalVaultValue = inventory.reduce((sum, item) => sum + item.value, 0);
  const equippedCount = inventory.filter((item) => item.isEquipped).length;

  return (
    <div className="w-full bg-slate-950/80 border-2 border-purple-500/30 rounded-2xl p-4 shadow-xl flex flex-col gap-3 backdrop-blur-md">
      {/* Vault Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-purple-400" />
          <h3 className="font-mono font-bold text-sm text-purple-300 uppercase tracking-wider">
            ABSURD LOOT VAULT ({inventory.length}/6 MAX)
          </h3>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> EQUIPPED: {equippedCount}/3
          </span>
          {inventory.length > 6 && (
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950 border border-rose-500/80 text-rose-300 font-bold flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3 text-rose-400" /> OVERFLOW +{inventory.length - 6}
            </span>
          )}
        </div>

        {inventory.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" /> Valued: {totalVaultValue.toLocaleString()} Gold
            </span>
            <button
              onClick={onClearInventory}
              id="btn-sell-all-loot"
              className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono px-2 py-1 rounded transition-all flex items-center gap-1"
              title="Sell all unequipped items in vault for gold"
            >
              <Coins className="w-3 h-3" /> Sell All
            </button>
          </div>
        )}
      </div>

      {/* Overflow Alert Banner if > 6 items */}
      {inventory.length > 6 && (
        <div className="bg-rose-950/90 border-2 border-rose-500/80 text-rose-200 text-xs font-mono p-3 rounded-xl flex items-center justify-between gap-2 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>
              <strong>VAULT FULL ({inventory.length}/6 ITEMS):</strong> You must sell or delete <strong>{inventory.length - 6} item{inventory.length - 6 > 1 ? 's' : ''}</strong> below to unlock the start button for the next floor!
            </span>
          </div>
        </div>
      )}

      {/* Inventory Items Grid */}
      {inventory.length === 0 ? (
        <div className="py-8 text-center flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
          <Sparkles className="w-8 h-8 text-purple-400/40 mb-2 animate-bounce" />
          <p>No absurd loot collected yet!</p>
          <p className="text-slate-600 text-[11px] mt-1">Defeat DM monsters to loot hilarious battle gear!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
          {inventory.map((item) => (
            <div
              key={item.id}
              className={`bg-slate-900/90 border rounded-xl p-2.5 flex flex-col justify-between gap-2 transition-all relative ${
                item.isEquipped
                  ? 'border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.2)] bg-emerald-950/20'
                  : 'border-slate-800 hover:border-purple-500/40'
              }`}
            >
              {item.isEquipped && (
                <div className="absolute -top-2 -right-2 bg-emerald-500 text-slate-950 font-mono font-bold text-[9px] px-2 py-0.5 rounded-full uppercase shadow flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5 fill-current" /> EQUIPPED IN BATTLE
                </div>
              )}

              <div className="flex items-start gap-2.5">
                <span className="text-2xl bg-slate-950 p-2 rounded-lg border border-slate-800 shrink-0">
                  {item.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-mono font-bold text-xs text-slate-200 truncate" title={item.name}>
                      {item.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <span
                      className={`inline-block text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border ${getRarityBadge(
                        item.rarity
                      )}`}
                    >
                      {item.rarity}
                    </span>
                    {item.bonusDescription && (
                      <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-1.5 py-0.2 rounded">
                        {item.bonusDescription}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 italic mt-1 line-clamp-2">
                    "{item.flavor_text}"
                  </p>
                  <p className="text-[10px] text-purple-400 font-mono mt-1">
                    Source: {item.monsterSource}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-1.5 mt-1">
                <button
                  onClick={() => onToggleEquipLoot(item.id)}
                  className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded transition-all flex items-center gap-1 border ${
                    item.isEquipped
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 hover:bg-rose-950/60 hover:border-rose-500 hover:text-rose-300'
                      : 'bg-purple-950/60 border-purple-500/50 text-purple-300 hover:bg-purple-900/60'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  <span>{item.isEquipped ? 'Unequip' : 'Equip in Battle'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-amber-400 font-bold flex items-center gap-0.5">
                    <Coins className="w-3 h-3 text-amber-300" /> +{item.value}
                  </span>
                  {!item.isEquipped && (
                    <button
                      onClick={() => onSellLoot(item.id)}
                      className="bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 border border-slate-700 hover:border-rose-500/50 text-slate-400 text-[10px] font-mono px-2 py-1 rounded transition-all flex items-center gap-1"
                      title="Sell item for gold"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
