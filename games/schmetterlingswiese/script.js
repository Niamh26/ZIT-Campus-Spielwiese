const GAME_CATALOG = [
  { id: "schaedel-puzzle", title: "3D-Schädelpuzzle", icon: "🦴", maxPoints: 20 },
  { id: "anatomie-memory", title: "Anatomie-Memory", icon: "🧠", maxPoints: 10 },
  { id: "craniosacral-quiz", title: "Craniosacral-Quiz", icon: "🌿", maxPoints: 10 },
  { id: "trauma-kreuzwortraetsel", title: "Trauma-Kreuzworträtsel", icon: "🧩", maxPoints: 20 },
  { id: "traumakreislauf", title: "Der Traumakreislauf", icon: "🔄", maxPoints: 20 },
  { id: "10-step-domino", title: "10-Step-Domino", icon: "🁣", maxPoints: 20 }
];

const MILESTONES = [
  { min: 0, max: 19, label: "0–19", icon: "🦋" },
  { min: 20, max: 39, label: "20–39", icon: "🦋" },
  { min: 40, max: 59, label: "40–59", icon: "🦋" },
  { min: 60, max: 79, label: "60–79", icon: "🦋" },
  { min: 80, max: 99, label: "80–99", icon: "🦋" },
  { min: 100, max: Infinity, label: "ab 100", icon: "🦋" }
];

const BUTTERFLY_STYLES = [
  { species: "white", left: "15%", top: "25%", size: "60px", duration: "18s", delay: "-4s" },
  { species: "blue", left: "40%", top: "17%", size: "55px", duration: "21s", delay: "-9s" },
  { species: "brimstone", left: "66%", top: "14%", size: "66px", duration: "19s", delay: "-2s" },
  { species: "admiral", left: "77%", top: "31%", size: "70px", duration: "23s", delay: "-12s" },
  { species: "peacock", left: "55%", top: "39%", size: "68px", duration: "20s", delay: "-7s" },
  { species: "fritillary", left: "27%", top: "40%", size: "62px", duration: "22s", delay: "-14s" }
];

const SNAPSHOT_KEY = "zit-campus-meadow-progress-v2";

const totalPointsEl = document.getElementById("totalPoints");
const totalPointsBottomEl = document.getElementById("totalPointsBottom");
const nextButterflyTextEl = document.getElementById("nextButterflyText");
const pointsRemainingEl = document.getElementById("pointsRemaining");
const progressBarEl = document.getElementById("progressBar");
const butterflyLayerEl = document.getElementById("butterflyLayer");
const milestonesEl = document.getElementById("milestones");
const gameListEl = document.getElementById("gameList");
const emptyMessageEl = document.getElementById("emptyMessage");
const resetProgressButton = document.getElementById("resetProgress");

function emptyProgress() {
  return { totalPoints: 0, games: {} };
}

function normalizeProgress(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const games = source.games && typeof source.games === "object" ? source.games : {};
  const normalizedGames = {};

  GAME_CATALOG.forEach((game) => {
    const item = games[game.id];
    if (!item || typeof item !== "object") return;

    const points = Math.max(0, Math.min(game.maxPoints, Number(item.points) || 0));
    const awarded = Boolean(item.awarded || item.completed || points > 0);

    if (awarded) {
      normalizedGames[game.id] = { ...item, awarded: true, points };
    }
  });

  const calculatedTotal = Object.values(normalizedGames).reduce(
    (sum, game) => sum + (Number(game.points) || 0),
    0
  );
  const suppliedTotal = Math.max(0, Number(source.totalPoints) || 0);

  return {
    ...source,
    games: normalizedGames,
    totalPoints: Math.max(calculatedTotal, suppliedTotal)
  };
}

function readSnapshot() {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    return raw ? normalizeProgress(JSON.parse(raw)) : emptyProgress();
  } catch (error) {
    console.warn("Gespeicherter Wiesenstand konnte nicht gelesen werden.", error);
    return emptyProgress();
  }
}

function writeSnapshot(progress) {
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(normalizeProgress(progress)));
  } catch (error) {
    console.warn("Wiesenstand konnte nicht lokal gespeichert werden.", error);
  }
}

function clearSnapshot() {
  try {
    localStorage.removeItem(SNAPSHOT_KEY);
  } catch (error) {
    console.warn("Lokaler Wiesenstand konnte nicht gelöscht werden.", error);
  }
}

function mergeProgress(a, b) {
  const left = normalizeProgress(a);
  const right = normalizeProgress(b);
  const games = { ...left.games };

  Object.entries(right.games).forEach(([id, game]) => {
    const existing = games[id];
    if (!existing || (Number(game.points) || 0) > (Number(existing.points) || 0)) {
      games[id] = game;
    }
  });

  return normalizeProgress({
    ...left,
    ...right,
    games,
    totalPoints: Math.max(left.totalPoints, right.totalPoints)
  });
}

function loadProgressSafely() {
  const snapshot = readSnapshot();

  if (!window.ZITPoints || typeof window.ZITPoints.load !== "function") {
    return snapshot;
  }

  try {
    const shared = normalizeProgress(window.ZITPoints.load());

    // Shared-Store und lokale Sicherung werden zusammengeführt. So bleiben
    // frühere Abschlüsse erhalten, während neue Spielpunkte hinzukommen können.
    const merged = mergeProgress(snapshot, shared);
    writeSnapshot(merged);
    return merged;
  } catch (error) {
    console.warn("ZITPoints konnte nicht geladen werden. Lokale Sicherung wird verwendet.", error);
    return snapshot;
  }
}

function getButterflyCount(points) {
  if (points < 20) return 0;
  if (points < 40) return 1;
  if (points < 60) return 2;
  if (points < 80) return 3;
  if (points < 100) return 4;
  return 6;
}

function getNextThreshold(points) {
  return [20, 40, 60, 80, 100].find((threshold) => points < threshold) ?? null;
}

function renderScore(progress) {
  const points = progress.totalPoints;
  totalPointsEl.textContent = points;
  totalPointsBottomEl.textContent = points;

  const nextThreshold = getNextThreshold(points);
  if (nextThreshold === null) {
    nextButterflyTextEl.textContent = "Deine Schmetterlingswiese ist vollständig erblüht.";
    pointsRemainingEl.textContent = "Du hast alle aktuellen Schmetterlingsstufen erreicht.";
    progressBarEl.style.width = "100%";
    return;
  }

  const previousThreshold = Math.max(0, nextThreshold - 20);
  const progressWithinLevel = points - previousThreshold;
  const percent = Math.max(0, Math.min(100, (progressWithinLevel / 20) * 100));
  const remaining = nextThreshold - points;

  nextButterflyTextEl.textContent = nextThreshold === 20
    ? "Der erste Schmetterling erscheint bei 20 Punkten."
    : `Nächster Schmetterling bei ${nextThreshold} Punkten.`;

  pointsRemainingEl.textContent = remaining === 1
    ? "Noch 1 Punkt bis zum nächsten Schmetterling."
    : `Noch ${remaining} Punkte bis zum nächsten Schmetterling.`;

  progressBarEl.style.width = `${percent}%`;
}

function renderButterflies(points) {
  const count = getButterflyCount(points);
  butterflyLayerEl.innerHTML = "";
  emptyMessageEl.hidden = count > 0;

  BUTTERFLY_STYLES.slice(0, count).forEach((style, index) => {
    const butterfly = document.createElement("div");
    butterfly.className = `butterfly ${style.species}`;
    butterfly.style.left = style.left;
    butterfly.style.top = style.top;
    butterfly.style.setProperty("--size", style.size);
    butterfly.style.setProperty("--duration", style.duration);
    butterfly.style.setProperty("--delay", style.delay);
    butterfly.setAttribute("role", "img");
    butterfly.setAttribute("aria-label", `Schmetterling ${index + 1}`);
    butterfly.innerHTML = `
      <span class="wing left-wing"></span>
      <span class="body"></span>
      <span class="wing right-wing"></span>
    `;
    butterflyLayerEl.appendChild(butterfly);
  });
}

function renderMilestones(points) {
  milestonesEl.innerHTML = "";

  MILESTONES.forEach((milestone, index) => {
    const reached = index === 0 || points >= milestone.min;
    const item = document.createElement("div");
    item.className = `milestone${reached ? " reached" : ""}`;
    const number = milestone.min === 0 ? "0" : milestone.min;

    item.innerHTML = `
      <strong>${number}${milestone.max === Infinity ? "+" : ""}</strong>
      <div class="milestone-badge">${milestone.icon}</div>
      <small>${milestone.label}<br>Punkte</small>
    `;
    milestonesEl.appendChild(item);
  });
}

function renderGames(progress) {
  gameListEl.innerHTML = "";

  GAME_CATALOG.forEach((game) => {
    const gameProgress = progress.games[game.id];
    const completed = Boolean(gameProgress?.awarded);
    const row = document.createElement("div");
    row.className = `game-row${completed ? " completed" : ""}`;

    row.innerHTML = `
      <div class="game-icon">${game.icon}</div>
      <div>
        <strong>${game.title}</strong>
        <small>${completed ? `${gameProgress.points} Punkte erhalten` : `bis zu ${game.maxPoints} Punkte`}</small>
      </div>
      <div class="game-status" title="${completed ? "Punkte erhalten" : "Noch nicht gewertet"}">
        ${completed ? "✓" : "○"}
      </div>
    `;
    gameListEl.appendChild(row);
  });
}

function render() {
  const progress = loadProgressSafely();
  writeSnapshot(progress);
  renderScore(progress);
  renderButterflies(progress.totalPoints);
  renderMilestones(progress.totalPoints);
  renderGames(progress);
}

resetProgressButton.addEventListener("click", () => {
  const confirmed = window.confirm(
    "Möchtest du wirklich alle gesammelten Punkte und Spielabschlüsse auf diesem Gerät löschen?"
  );
  if (!confirmed) return;

  clearSnapshot();
  if (window.ZITPoints && typeof window.ZITPoints.reset === "function") {
    try { window.ZITPoints.reset(); } catch (error) { console.warn(error); }
  }
  render();
});

window.addEventListener("zit-points-changed", render);
window.addEventListener("storage", (event) => {
  if (!event.key || event.key === SNAPSHOT_KEY || /zit/i.test(event.key)) render();
});
window.addEventListener("pageshow", render);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) render();
});

render();
