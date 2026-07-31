import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { generateMonsterFromDM, generateDmCommentary } from "./server/gemini.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Generate a bizarre, funny monster from DM
  app.post("/api/generate-monster", async (req, res) => {
    try {
      const { theme, level, isBoss } = req.body || {};
      const monsterData = await generateMonsterFromDM(theme, level || 1, Boolean(isBoss));
      res.json(monsterData);
    } catch (err) {
      console.error("API error in /api/generate-monster:", err);
      res.status(500).json({ error: "Failed to generate monster" });
    }
  });

  // API Route: Generate DM commentary
  app.post("/api/dm-commentary", async (req, res) => {
    try {
      const { actionType, monsterName, detail } = req.body || {};
      const commentary = await generateDmCommentary(
        actionType || "CRIT_HIT",
        monsterName || "Monster",
        detail
      );
      res.json({ commentary });
    } catch (err) {
      console.error("API error in /api/dm-commentary:", err);
      res.status(500).json({ error: "Failed to generate commentary" });
    }
  });

  // In-memory leaderboard store seeded with legendary dungeon heroes
  const leaderboardStore = [
    { id: "1", playerName: "Valeros_The_Undying", highestFloor: 50, totalGold: 250000, title: "Dungeon Overlord", updatedAt: "2026-07-30T10:00:00Z" },
    { id: "2", playerName: "Glitched_Goblin_Slayer", highestFloor: 38, totalGold: 140000, title: "Mythic Executioner", updatedAt: "2026-07-30T14:20:00Z" },
    { id: "3", playerName: "Pixel_Vanquisher", highestFloor: 27, totalGold: 78000, title: "Floor Master", updatedAt: "2026-07-30T18:10:00Z" },
    { id: "4", playerName: "Aether_Warlock", highestFloor: 19, totalGold: 35000, title: "Spellblade Veteran", updatedAt: "2026-07-31T01:05:00Z" },
    { id: "5", playerName: "Shadow_Rogue_X", highestFloor: 14, totalGold: 18500, title: "Dungeon Explorer", updatedAt: "2026-07-31T02:00:00Z" },
    { id: "6", playerName: "Arcade_Rookie", highestFloor: 8, totalGold: 5200, title: "Dungeon Explorer", updatedAt: "2026-07-31T02:30:00Z" },
  ];

  const getTitleForFloor = (floor: number): string => {
    if (floor >= 50) return "Dungeon Overlord";
    if (floor >= 35) return "Mythic Executioner";
    if (floor >= 20) return "Floor Master";
    if (floor >= 10) return "Spellblade Veteran";
    if (floor >= 5) return "Dungeon Explorer";
    return "Novice Adventurer";
  };

  // API Route: Get Leaderboard
  app.get("/api/leaderboard", (_req, res) => {
    leaderboardStore.sort((a, b) => b.highestFloor - a.highestFloor || b.totalGold - a.totalGold);
    const rankedList = leaderboardStore.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
    res.json({ leaderboard: rankedList });
  });

  // API Route: Submit / Update Score
  app.post("/api/leaderboard", (req, res) => {
    try {
      const { playerName, highestFloor = 1, totalGold = 0 } = req.body || {};
      if (!playerName || typeof playerName !== "string") {
        return res.status(400).json({ error: "Player name is required" });
      }

      const cleanName = playerName.trim();
      const existing = leaderboardStore.find(
        (e) => e.playerName.toLowerCase() === cleanName.toLowerCase()
      );

      const floorNum = Math.max(1, Number(highestFloor) || 1);
      const goldNum = Math.max(0, Number(totalGold) || 0);

      if (existing) {
        if (floorNum > existing.highestFloor) {
          existing.highestFloor = floorNum;
        }
        if (goldNum > existing.totalGold) {
          existing.totalGold = goldNum;
        }
        existing.title = getTitleForFloor(existing.highestFloor);
        existing.updatedAt = new Date().toISOString();
      } else {
        leaderboardStore.push({
          id: Math.random().toString(36).substring(2, 9),
          playerName: cleanName,
          highestFloor: floorNum,
          totalGold: goldNum,
          title: getTitleForFloor(floorNum),
          updatedAt: new Date().toISOString(),
        });
      }

      leaderboardStore.sort((a, b) => b.highestFloor - a.highestFloor || b.totalGold - a.totalGold);
      const rankedList = leaderboardStore.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

      const playerIndex = rankedList.findIndex(
        (e) => e.playerName.toLowerCase() === cleanName.toLowerCase()
      );
      const playerRank = playerIndex >= 0 ? playerIndex + 1 : rankedList.length;

      res.json({
        leaderboard: rankedList,
        playerRank,
        totalPlayers: rankedList.length,
      });
    } catch (err) {
      console.error("API error in /api/leaderboard:", err);
      res.status(500).json({ error: "Failed to update leaderboard" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "Dungeon Clicker" });
  });

  // Vite middleware setup for dev vs production static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Dungeon Clicker Server] Running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
