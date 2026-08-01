const stations = window.TRAUMA_KREISLAUF_DATEN || [];

const slotsLayer = document.getElementById("slotsLayer");
const cardsTray = document.getElementById("cardsTray");
const progressText = document.getElementById("progressText");
const selectionText = document.getElementById("selectionText");
const message = document.getElementById("message");

const referenceDialog = document.getElementById("referenceDialog");
const infoDialog = document.getElementById("infoDialog");

let selectedId = null;
let placements = Array(stations.length).fill(null);
let locked = false;

function shuffled(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function makeCard(station, inSlot = false) {
  const card = document.createElement("div");
  card.className = inSlot ? "slot-card" : "card";
  card.draggable = !locked;
  card.dataset.id = station.id;

  const imageSource = inSlot && locked && station.abschlussbild
    ? station.abschlussbild
    : station.bild;

  card.innerHTML = `
    <img src="${imageSource}" alt="${station.titel}">
    ${inSlot ? "" : `<span class="card-label">${station.titel}</span>`}
  `;

  card.addEventListener("dragstart", (event) => {
    if (locked) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData("text/plain", station.id);
    event.dataTransfer.effectAllowed = "move";
  });

  card.addEventListener("click", () => {
    if (locked && inSlot) {
      openInfo(station);
      return;
    }

    if (inSlot) {
      removeFromSlot(station.id);
      return;
    }

    selectedId = selectedId === station.id ? null : station.id;
    renderCards();
    selectionText.textContent = selectedId
      ? `${station.titel} ausgewählt – tippe jetzt einen freien Platz an.`
      : "Noch keine Karte ausgewählt";
  });

  return card;
}

function createSlots() {
  slotsLayer.innerHTML = "";

  const radius = 42;
  const center = 50;
  const startAngle = -90;

  stations.forEach((station, index) => {
    const angle = (startAngle + (360 / stations.length) * index) * Math.PI / 180;
    const x = center + Math.cos(angle) * radius;
    const y = center + Math.sin(angle) * radius;

    const slot = document.createElement("div");
    slot.className = "slot";
    slot.dataset.index = index;
    slot.dataset.number = index + 1;
    slot.style.left = `${x}%`;
    slot.style.top = `${y}%`;

    slot.addEventListener("dragover", (event) => {
      if (locked) return;
      event.preventDefault();
      slot.classList.add("drag-over");
    });

    slot.addEventListener("dragleave", () => slot.classList.remove("drag-over"));

    slot.addEventListener("drop", (event) => {
      if (locked) return;
      event.preventDefault();
      slot.classList.remove("drag-over");
      const id = event.dataTransfer.getData("text/plain");
      placeCard(id, index);
    });

    slot.addEventListener("click", (event) => {
      if (locked) {
        const id = placements[index];
        if (id) openInfo(stations.find((item) => item.id === id));
        return;
      }

      if (event.target.closest(".slot-card")) return;

      if (selectedId) {
        placeCard(selectedId, index);
      } else if (placements[index]) {
        removeFromSlot(placements[index]);
      }
    });

    slotsLayer.appendChild(slot);
  });
}

function renderCards() {
  cardsTray.innerHTML = "";
  const placedIds = new Set(placements.filter(Boolean));

  shuffled(stations.filter((station) => !placedIds.has(station.id))).forEach((station) => {
    const card = makeCard(station);
    if (station.id === selectedId) card.classList.add("selected");
    cardsTray.appendChild(card);
  });

  if (!cardsTray.children.length) {
    cardsTray.innerHTML = `<p>Alle Karten wurden eingesetzt. Jetzt kannst du prüfen.</p>`;
  }
}

function renderSlots() {
  document.querySelectorAll(".slot").forEach((slot, index) => {
    slot.classList.remove("correct", "wrong", "selected-target");
    slot.innerHTML = "";

    const id = placements[index];
    if (!id) {
      if (selectedId) slot.classList.add("selected-target");
      return;
    }

    const station = stations.find((item) => item.id === id);
    slot.appendChild(makeCard(station, true));
  });
}

function render() {
  renderSlots();
  renderCards();
  updateProgress();
}

function placeCard(id, slotIndex) {
  if (!id || locked) return;

  const previousIndex = placements.indexOf(id);
  if (previousIndex !== -1) placements[previousIndex] = null;

  const displaced = placements[slotIndex];
  placements[slotIndex] = id;

  if (displaced && previousIndex !== -1) {
    placements[previousIndex] = displaced;
  }

  selectedId = null;
  selectionText.textContent = "Noch keine Karte ausgewählt";
  message.textContent = "";
  render();
}

function removeFromSlot(id) {
  if (locked) return;
  const index = placements.indexOf(id);
  if (index !== -1) placements[index] = null;
  selectedId = id;
  selectionText.textContent = `${stations.find((item) => item.id === id).titel} ausgewählt – wähle einen neuen Platz.`;
  render();
}

function countCorrect() {
  return placements.reduce((count, id, index) => {
    return count + (id === stations[index].id ? 1 : 0);
  }, 0);
}

function updateProgress() {
  progressText.textContent = `${countCorrect()} von ${stations.length} Stationen richtig`;
}

function checkSolution() {
  let correct = 0;
  document.querySelectorAll(".slot").forEach((slot, index) => {
    slot.classList.remove("correct", "wrong");

    if (!placements[index]) return;

    if (placements[index] === stations[index].id) {
      slot.classList.add("correct");
      correct += 1;
    } else {
      slot.classList.add("wrong");
    }
  });

  updateProgress();

  if (correct === stations.length) {
    finishGame();
  } else {
    const empty = placements.filter((item) => !item).length;
    message.textContent = empty
      ? `Noch ${empty} Platz${empty === 1 ? " ist" : "e sind"} leer. Bereits richtig: ${correct}.`
      : `${correct} Stationen sind richtig. Die roten Stationen dürfen noch einmal umziehen.`;
  }
}

function giveHint() {
  if (locked) return;

  const wrongIndexes = stations
    .map((station, index) => ({ station, index }))
    .filter(({ station, index }) => placements[index] !== station.id);

  if (!wrongIndexes.length) {
    finishGame();
    return;
  }

  const { station, index } = wrongIndexes[Math.floor(Math.random() * wrongIndexes.length)];
  placeCard(station.id, index);

  const slot = document.querySelector(`.slot[data-index="${index}"]`);
  slot.classList.add("correct");
  message.textContent = `Tipp: ${station.titel} wurde auf Platz ${index + 1} eingesetzt.`;
}

function finishGame() {
  locked = true;
  document.querySelectorAll(".slot").forEach((slot) => slot.classList.add("correct"));
  selectionText.textContent = "Kreislauf vollständig";
  message.textContent = "🎉 Geschafft! Der Trauma-Kreislauf ist vollständig. Klicke auf eine Station, um ihre Erklärung zu lesen.";

  if (window.ZITPoints) {
    const result = window.ZITPoints.award(
      "trauma-kreislauf",
      20,
      "Trauma-Kreislauf"
    );

    if (result.awarded) {
      message.textContent += " Du erhältst einmalig 20 Punkte für deine Schmetterlingswiese. 🦋";
    }
  }

  renderSlots();
}

function resetGame() {
  placements = Array(stations.length).fill(null);
  selectedId = null;
  locked = false;
  selectionText.textContent = "Noch keine Karte ausgewählt";
  message.textContent = "";
  createSlots();
  render();
}

function openInfo(station) {
  if (!station) return;
  document.getElementById("infoImage").src = locked && station.abschlussbild
    ? station.abschlussbild
    : station.bild;
  document.getElementById("infoImage").alt = station.titel;
  document.getElementById("infoNumber").textContent = `STATION ${stations.indexOf(station) + 1}`;
  document.getElementById("infoTitle").textContent = station.titel;
  document.getElementById("infoText").textContent = station.erklaerung;
  infoDialog.showModal();
}

document.getElementById("checkBtn").addEventListener("click", checkSolution);
document.getElementById("hintBtn").addEventListener("click", giveHint);
document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("Möchtest du den Kreislauf neu mischen und von vorn beginnen?")) resetGame();
});

document.getElementById("referenceBtn").addEventListener("click", () => referenceDialog.showModal());
document.getElementById("closeReference").addEventListener("click", () => referenceDialog.close());
document.getElementById("closeInfo").addEventListener("click", () => infoDialog.close());

referenceDialog.addEventListener("click", (event) => {
  if (event.target === referenceDialog) referenceDialog.close();
});

infoDialog.addEventListener("click", (event) => {
  if (event.target === infoDialog) infoDialog.close();
});

createSlots();
render();
