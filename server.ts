import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { generateMonsterFromDM, generateDmCommentary } from "./server/gemini.js";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import firebaseConfigJson from "./firebase-applet-config.json" with { type: "json" };

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = firebaseConfigJson.firestoreDatabaseId
  ? getFirestore(firebaseApp, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(firebaseApp);

const leaderboardCol = collection(db, "leaderboard");

const INITIAL_HEROES = [
  { id: "valeros", playerName: "Valeros_The_Undying", highestFloor: 50, totalGold: 250000, timeTaken: 1850, title: "Dungeon Overlord", updatedAt: "2026-07-30T10:00:00Z" },
  { id: "goblin_slayer", playerName: "Glitched_Goblin_Slayer", highestFloor: 38, totalGold: 140000, timeTaken: 1240, title: "Mythic Executioner", updatedAt: "2026-07-30T14:20:00Z" },
  { id: "pixel_vanquisher", playerName: "Pixel_Vanquisher", highestFloor: 27, totalGold: 78000, timeTaken: 820, title: "Floor Master", updatedAt: "2026-07-30T18:10:00Z" },
  { id: "aether_warlock", playerName: "Aether_Warlock", highestFloor: 19, totalGold: 35000, timeTaken: 510, title: "Spellblade Veteran", updatedAt: "2026-07-31T01:05:00Z" },
  { id: "shadow_rogue", playerName: "Shadow_Rogue_X", highestFloor: 14, totalGold: 18500, timeTaken: 340, title: "Dungeon Explorer", updatedAt: "2026-07-31T02:00:00Z" },
  { id: "arcade_rookie", playerName: "Arcade_Rookie", highestFloor: 8, totalGold: 5200, timeTaken: 190, title: "Dungeon Explorer", updatedAt: "2026-07-31T02:30:00Z" },
];

const getTitleForFloor = (floor: number): string => {
  if (floor >= 50) return "Dungeon Overlord";
  if (floor >= 35) return "Mythic Executioner";
  if (floor >= 20) return "Floor Master";
  if (floor >= 10) return "Spellblade Veteran";
  if (floor >= 5) return "Dungeon Explorer";
  return "Novice Adventurer";
};

async function fetchFirestoreLeaderboard() {
  try {
    const snapshot = await getDocs(leaderboardCol);
    if (snapshot.empty) {
      for (const hero of INITIAL_HEROES) {
        await setDoc(doc(db, "leaderboard", hero.id), hero);
      }
      return [...INITIAL_HEROES];
    }
    const list: any[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    console.error("Error fetching Firestore leaderboard:", err);
    return [...INITIAL_HEROES];
  }
}

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

  // API Route: Get Leaderboard
  app.get("/api/leaderboard", async (_req, res) => {
    try {
      const rawList = await fetchFirestoreLeaderboard();
      rawList.sort((a, b) => b.highestFloor - a.highestFloor || b.totalGold - a.totalGold);
      const rankedList = rawList.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
      res.json({ leaderboard: rankedList });
    } catch (err) {
      console.error("Error in GET /api/leaderboard:", err);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // API Route: Submit / Update Score
  app.post("/api/leaderboard", async (req, res) => {
    try {
      const { playerName, highestFloor = 1, totalGold = 0, timeTaken = 0 } = req.body || {};
      if (!playerName || typeof playerName !== "string") {
        return res.status(400).json({ error: "Player name is required" });
      }

      const cleanName = playerName.trim();
      const rawList = await fetchFirestoreLeaderboard();

      const floorNum = Math.max(1, Number(highestFloor) || 1);
      const goldNum = Math.max(0, Number(totalGold) || 0);
      const timeNum = Math.max(0, Number(timeTaken) || 0);

      const existing = rawList.find(
        (e) => e.playerName.toLowerCase() === cleanName.toLowerCase()
      );

      let docId = existing ? existing.id : cleanName.toLowerCase().replace(/[^a-z0-9_]/g, "_");
      let updatedFloor = existing ? Math.max(existing.highestFloor || 1, floorNum) : floorNum;
      let updatedGold = existing ? Math.max(existing.totalGold || 0, goldNum) : goldNum;
      let updatedTime = existing ? Math.max(existing.timeTaken || 0, timeNum) : timeNum;
      let updatedTitle = getTitleForFloor(updatedFloor);

      const updatedRecord = {
        id: docId,
        playerName: cleanName,
        highestFloor: updatedFloor,
        totalGold: updatedGold,
        timeTaken: updatedTime,
        title: updatedTitle,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "leaderboard", docId), updatedRecord);

      // Re-fetch sorted list
      const finalList = await fetchFirestoreLeaderboard();
      finalList.sort((a, b) => b.highestFloor - a.highestFloor || b.totalGold - a.totalGold);
      const rankedList = finalList.map((entry, index) => ({
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
