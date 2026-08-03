const GAME_CATALOG = [
  {
    id: "anatomie-memory",
    title: "Anatomie-Memory",
    icon: "🧠",
    maxPoints: 10
  },
  {
    id: "craniosacral-quiz",
    title: "Craniosacral-Quiz",
    icon: "🌿",
    maxPoints: 10
  },
  {
    id: "trauma-kreuzwortraetsel",
    title: "Trauma-Kreuzworträtsel",
    icon: "🧩",
    maxPoints: 20
  },
  {
    id: "traumakreislauf",
    title: "Der Traumakreislauf",
    icon: "🔄",
    maxPoints: 20
  },
  {
    id: "10-step-domino",
    title: "10-Step-Domino",
    icon: "🁣",
    maxPoints: 20
  }
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
  { colorOne: "#ff5ca8", colorTwo: "#ffc2dc", left: "16%", top: "24%", size: "62px", duration: "14s", delay: "-4s" },
  { colorOne: "#1688e8", colorTwo: "#8bd3ff", left: "42%", top: "17%", size: "70px", duration: "18s", delay: "-8s" },
  { colorOne: "#9b5de5", colorTwo: "#dab8ff", left: "67%", top: "12%", size: "66px", duration: "16s", delay: "-2s" },
  { colorOne: "#ff8a00", colorTwo: "#ffd36e", left: "78%", top: "31%", size: "72px", duration: "19s", delay: "-11s" },
  { colorOne: "#68c739", colorTwo: "#d4ff9f", left: "56%", top: "38%", size: "60px", duration: "15s", delay: "-6s" },
  { colorOne: "#ff4b4b", colorTwo: "#ffc0c0", left: "27%", top: "39%", size: "58px", duration: "17s", delay: "-13s" }
];

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

function getButterflyCount(points) {
  if (points < 20) return 0;
  if (points < 40) return 1;
  if (points < 60) return 2;
  if (points < 80) return 3;
  if (points < 100) return 4;
  return 6;
}

function getNextThreshold(points) {
  const thresholds = [20, 40, 60, 80, 100];
  return thresholds.find((threshold) => points < threshold) ?? null;
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

  nextButterflyTextEl.textContent =
    nextThreshold === 20
      ? "Der erste Schmetterling erscheint bei 20 Punkten."
      : `Nächster Schmetterling bei ${nextThreshold} Punkten.`;

  pointsRemainingEl.textContent =
    remaining === 1
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
    butterfly.className = "butterfly";
    butterfly.style.left = style.left;
    butterfly.style.top = style.top;
    butterfly.style.setProperty("--size", style.size);
    butterfly.style.setProperty("--color-one", style.colorOne);
    butterfly.style.setProperty("--color-two", style.colorTwo);
    butterfly.style.setProperty("--duration", style.duration);
    butterfly.style.setProperty("--delay", style.delay);
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
  const progress = window.ZITPoints.load();

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

  window.ZITPoints.reset();
  render();
});

window.addEventListener("zit-points-changed", render);
window.addEventListener("storage", render);

render();
