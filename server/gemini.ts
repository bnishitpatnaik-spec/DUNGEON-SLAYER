import { GoogleGenAI, Type } from "@google/genai";

export interface RawMonsterData {
  name: string;
  hp: number;
  flavor_text: string;
  ability: string;
  loot_item: string;
  color_hex: string;
}

const FALLBACK_MONSTERS: RawMonsterData[] = [
  {
    name: "Giga-Caffeine Slime",
    hp: 120,
    flavor_text: "Created when an unpaid intern spilled 42 shots of espresso into a bio-hazard barrel.",
    ability: "Hyperactive Twitch Slap",
    loot_item: "Slightly Vibrating Espresso Cup",
    color_hex: "#38bdf8"
  },
  {
    name: "Soggy Wifi Router",
    hp: 210,
    flavor_text: "It dropped into a bucket of mop water and now broadcasts 5G ghost signals.",
    ability: "Packet Loss Laser",
    loot_item: "Entangled Ethernet Cable",
    color_hex: "#a855f7"
  },
  {
    name: "Sentient Moldy Sandwich",
    hp: 160,
    flavor_text: "Left in the breakroom fridge since 1997, it now demands equal rights.",
    ability: "Mayo Tsunami",
    loot_item: "Petrified Crust of Power",
    color_hex: "#22c55e"
  },
  {
    name: "Aggressive Disco Cactus",
    hp: 280,
    flavor_text: "Learned how to dance in the 70s and refuses to stop grooving violently.",
    ability: "Spiky Funk Beam",
    loot_item: "Glittering Needle Sunglasses",
    color_hex: "#ec4899"
  },
  {
    name: "Glitchy GPU Spectre",
    hp: 350,
    flavor_text: "Overclocked to 9000°C while trying to render 10 million pixelated hamsters.",
    ability: "Artifact Screen Meltdown",
    loot_item: "Burnt Thermal Paste Container",
    color_hex: "#f97316"
  },
  {
    name: "Overpriced Boba Demon",
    hp: 240,
    flavor_text: "Charges $18 per cup and demands a 30% tip before unleashing chaos.",
    ability: "Tapioca Cannonball",
    loot_item: "Golden Straw of Infinite Sugar",
    color_hex: "#eab308"
  },
  {
    name: "Passive-Aggressive Sticky Note",
    hp: 95,
    flavor_text: "Contains handwritten reminders that hurt your feelings on a microscopic level.",
    ability: "All-Caps Paper Cut",
    loot_item: "Unfinished To-Do List of Destiny",
    color_hex: "#facc15"
  },
  {
    name: "Quantum Keyboard Cat",
    hp: 420,
    flavor_text: "Exists in two places at once and keeps pressing Alt+F4 on reality.",
    ability: "Meow Chaos Overdrive",
    loot_item: "Mechanical Keycap of Swiftness",
    color_hex: "#06b6d4"
  }
];

export async function generateMonsterFromDM(theme?: string, level: number = 1, isBoss: boolean = false): Promise<RawMonsterData> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing. Using procedural DM monster generator fallback.");
    const randomIndex = Math.floor(Math.random() * FALLBACK_MONSTERS.length);
    const fallback = { ...FALLBACK_MONSTERS[randomIndex] };
    if (isBoss) {
      fallback.name = `LORD ${fallback.name.toUpperCase()}`;
      fallback.hp = Math.min(500, Math.floor(fallback.hp * 1.5));
    }
    return fallback;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const themePrompt = theme && theme !== 'random'
      ? `The theme for this monster must be '${theme}'.`
      : `Create a bizarre, hilarious monster from any absurd theme (e.g., glitched technology, mutated fast food, sentient office supplies, 80s arcade tropes, weird fantasy).`;

    const bossPrompt = isBoss
      ? `This is a MEGA BOSS fight for level ${level}! Make the monster sound imposing yet utterly ridiculous, with a high HP value closer to 400-500.`
      : `This is a standard arcade monster for level ${level}.`;

    const prompt = `You are the Dungeon Master for a fast-paced clicker arcade game called "Dungeon Slasher: Infinite". Generate a bizarre, funny monster for the current stage.
${themePrompt}
${bossPrompt}

Requirements:
- name: A hilarious creative monster name (e.g., 'Giga-Caffeine Slime', 'Soggy Wifi Router').
- hp: A number between 50 and 500 (scale higher for higher stages).
- flavor_text: A funny 1-sentence backstory explaining how this creature exists.
- ability: A weird, comedic attack or spell name.
- loot_item: An absurd item dropped on death (e.g., 'Overclocked CPU').
- color_hex: A valid Hex code string for the monster sprite (e.g. '#FF0055', '#38BDF8', '#22C55E', '#A855F7').`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the Dungeon Master for a fast-paced clicker arcade game called \"Dungeon Slasher: Infinite\". Whenever requested, generate a bizarre, funny monster for the current stage. Return ONLY a valid JSON object matching the requested schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            hp: { type: Type.NUMBER },
            flavor_text: { type: Type.STRING },
            ability: { type: Type.STRING },
            loot_item: { type: Type.STRING },
            color_hex: { type: Type.STRING }
          },
          required: ["name", "hp", "flavor_text", "ability", "loot_item", "color_hex"]
        }
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim()) as RawMonsterData;
      // Sanitize inputs
      const cleanedHp = Math.max(50, Math.min(500, Math.round(Number(parsed.hp) || 100)));
      const colorHex = /^#[0-9A-Fa-f]{6}$/.test(parsed.color_hex) ? parsed.color_hex : "#FF0055";

      return {
        name: parsed.name || "Mystery Arcade Glitch",
        hp: cleanedHp,
        flavor_text: parsed.flavor_text || "Born inside an uncleaned arcade cabinet circuit board.",
        ability: parsed.ability || "Glitch Slam",
        loot_item: parsed.loot_item || "1UP Pixel Coin",
        color_hex: colorHex
      };
    }
  } catch (error) {
    console.error("Error calling Gemini API for DM monster:", error);
  }

  // Fallback if API call failed
  const randomIndex = Math.floor(Math.random() * FALLBACK_MONSTERS.length);
  return FALLBACK_MONSTERS[randomIndex];
}

export async function generateDmCommentary(actionType: string, monsterName: string, detail?: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const comments = [
      `The Dungeon Master chuckles as ${monsterName} reels from your relentless clicking!`,
      `"A CRITICAL HIT!" shouts the Dungeon Master, tossing pixelated confetti.`,
      `The DM adjusts their retro headset: "${monsterName} never stood a chance!"`,
      `"Brilliant tap technique!" praises the Arcade Dungeon Master.`
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const prompt = `You are an energetic, comedic 80s arcade Dungeon Master commentating on a clicker game.
Event: ${actionType} involving monster '${monsterName}'. ${detail ? `Details: ${detail}` : ''}
Write a short, punchy 1-sentence commentating reaction (max 15 words) in character.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an energetic 80s arcade Dungeon Master. Return a brief 1-sentence funny reaction."
      }
    });

    return response.text?.trim() || `"BWAHAHA! Take that, ${monsterName}!" screams the Dungeon Master.`;
  } catch (err) {
    return `"Unbelievable combos!" shouts the Dungeon Master.`;
  }
}
