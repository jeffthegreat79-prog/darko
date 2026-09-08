const splash = document.querySelector(".splash");
const catchUser = document.querySelector(".catch-user");
const catchName = document.querySelector(".catch-name");
const catchDetail = document.querySelector(".catch-detail");

let lastSeenCatchId = null;
let initialized = false;

const catchQueue = [];
let effectPlaying = false;

const effectClasses = [
  "effect-junk",
  "effect-common",
  "effect-uncommon",
  "effect-rare",
  "effect-epic",
  "effect-legendary",
  "effect-treasure",
  "trophy"
];

function getEffectClass(catchData) {
  const type = String(catchData.type || "fish").toLowerCase();
  const rarity = String(catchData.rarity || "common").toLowerCase();

  if (type === "junk") {
    return "effect-junk";
  }

  if (type === "treasure") {
    return "effect-treasure";
  }

  if (rarity === "legendary") {
    return "effect-legendary";
  }

  if (rarity === "epic") {
    return "effect-epic";
  }

  if (rarity === "rare") {
    return "effect-rare";
  }

  if (rarity === "uncommon") {
    return "effect-uncommon";
  }

  return "effect-common";
}

function buildCatchText(catchData) {
  const type = String(catchData.type || "fish").toLowerCase();

  catchUser.textContent = `${catchData.username} caught:`;
  catchName.textContent = catchData.name || "Mystery Catch";

  const weight = Number(catchData.weight || 0);
  const value = Number(catchData.value || 0);
  const rarity = catchData.rarity || "Unknown";

  if (type === "junk") {
    catchUser.textContent = `${catchData.username} dragged up:`;
    catchDetail.textContent =
      `JUNK • ${weight.toFixed(1)} lb • ${value} coins`;
  } else if (type === "treasure") {
    catchUser.textContent = `${catchData.username} found treasure!`;
    catchDetail.textContent =
      `${rarity} • ${value} coins`;
  } else {
    catchDetail.textContent =
      `${weight.toFixed(1)} lb • ${rarity} • ${value} coins`;
  }

  if (catchData.isTrophy) {
    catchName.textContent = `🏆 ${catchData.name} 🏆`;
    catchDetail.textContent =
      `TROPHY • ${catchDetail.textContent}`;
  }
}

function playCatchEffect(catchData) {
  effectPlaying = true;

  console.log(
    `PLAYING FISHING EFFECT: ${JSON.stringify(catchData)}`
  );

  splash.classList.remove("active");

  effectClasses.forEach((className) => {
    splash.classList.remove(className);
  });

  const effectClass = getEffectClass(catchData);

  splash.classList.add(effectClass);

  if (catchData.isTrophy) {
    splash.classList.add("trophy");
  }

  buildCatchText(catchData);

  // Force animations to restart
  splash.getBoundingClientRect();

  splash.classList.add("active");

  setTimeout(() => {
    splash.classList.remove("active");

    setTimeout(() => {
      effectPlaying = false;
      playNextCatch();
    }, 250);
  }, 4200);
}

function playNextCatch() {
  if (effectPlaying || catchQueue.length === 0) {
    return;
  }

  const nextCatch = catchQueue.shift();
  playCatchEffect(nextCatch);
}

function queueCatch(catchData) {
  console.log(
    `NEW FISHING CATCH: ${JSON.stringify(catchData)}`
  );

  catchQueue.push(catchData);
  playNextCatch();
}

async function checkForNewCatch() {
  try {
    const response = await fetch(
      "https://darko.wtf/api/fish/events",
      {
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (
      !data.success ||
      !Array.isArray(data.catches) ||
      data.catches.length === 0
    ) {
      return;
    }

    const latestCatch = data.catches[0];

    // First load: remember current catch without replaying it
    if (!initialized) {
      lastSeenCatchId = latestCatch.id;
      initialized = true;

      console.log(
        `Fishing watcher initialized. Latest catch ID: ${latestCatch.id}`
      );

      return;
    }

    if (String(latestCatch.id) === String(lastSeenCatchId)) {
      return;
    }

    // Collect every catch since the last one we saw
    const newCatches = [];

    for (const catchData of data.catches) {
      if (String(catchData.id) === String(lastSeenCatchId)) {
        break;
      }

      newCatches.push(catchData);
    }

    lastSeenCatchId = latestCatch.id;

    // API is newest-first, so play them oldest-first
    newCatches.reverse();

    newCatches.forEach((catchData) => {
      queueCatch(catchData);
    });

  } catch (error) {
    const message =
      error && error.message
        ? error.message
        : String(error);

    console.error(`Fishing watcher error: ${message}`);
  }
}

/* ========================================
   MANUAL TEST MODE
   Set true only when testing effects
   ======================================== */

const TEST_MODE = false;

if (TEST_MODE) {
  const testCatches = [
    {
      id: "test-junk",
      username: "DarkoVision",
      name: "Old Brake Rotor",
      rarity: "Junk",
      type: "junk",
      weight: 14.2,
      value: 5,
      isTrophy: false
    },
    {
      id: "test-epic",
      username: "DarkoVision",
      name: "Blue Catfish",
      rarity: "Epic",
      type: "fish",
      weight: 38.6,
      value: 325,
      isTrophy: false
    },
    {
      id: "test-treasure",
      username: "DarkoVision",
      name: "Graded pristine Pokémon Card",
      rarity: "Legendary",
      type: "treasure",
      weight: 0.1,
      value: 1000,
      isTrophy: false
    },
    {
      id: "test-trophy",
      username: "DarkoVision",
      name: "Sturgeon",
      rarity: "Legendary",
      type: "fish",
      weight: 211.7,
      value: 2500,
      isTrophy: true
    }
  ];

  setTimeout(() => {
    testCatches.forEach((catchData) => {
      queueCatch(catchData);
    });
  }, 750);
} else {
  checkForNewCatch();
  setInterval(checkForNewCatch, 2000);
}