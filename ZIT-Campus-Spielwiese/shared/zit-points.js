(function () {
  "use strict";

  const STORAGE_KEY = "zit-campus-points-v2";
  const LEGACY_KEYS = ["zit-campus-points", "zitPoints", "zit-points"];

  function baseState() {
    return { version: 2, totalPoints: 0, games: {}, updatedAt: null };
  }

  function normalize(raw) {
    const state = raw && typeof raw === "object" ? raw : {};
    const games = state.games && typeof state.games === "object" ? state.games : {};
    const cleanGames = {};

    Object.entries(games).forEach(([id, game]) => {
      if (!game || typeof game !== "object") return;
      const points = Math.max(0, Number(game.points) || 0);
      const awarded = Boolean(game.awarded || game.completed || points > 0);
      if (awarded) cleanGames[id] = { ...game, points, awarded: true };
    });

    const calculated = Object.values(cleanGames).reduce((sum, game) => sum + game.points, 0);
    return {
      ...baseState(),
      ...state,
      games: cleanGames,
      totalPoints: Math.max(calculated, Math.max(0, Number(state.totalPoints) || 0))
    };
  }

  function readRaw(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (_) {
      return null;
    }
  }

  function load() {
    let state = readRaw(STORAGE_KEY);
    if (!state) {
      for (const key of LEGACY_KEYS) {
        state = readRaw(key);
        if (state) break;
      }
    }
    const normalized = normalize(state || baseState());
    persist(normalized, false);
    return normalized;
  }

  function persist(state, emit = true) {
    const normalized = normalize({ ...state, updatedAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    if (emit) window.dispatchEvent(new CustomEvent("zit-points-changed", { detail: normalized }));
    return normalized;
  }

  function save(state) {
    return persist(state, true);
  }

  function award(gameId, points, meta = {}) {
    if (!gameId) throw new Error("gameId fehlt");
    const value = Math.max(0, Number(points) || 0);
    const state = load();

    if (state.games[gameId]?.awarded) {
      return { awarded: false, alreadyAwarded: true, progress: state };
    }

    state.games[gameId] = {
      ...meta,
      points: value,
      awarded: true,
      awardedAt: new Date().toISOString()
    };
    state.totalPoints = Object.values(state.games).reduce((sum, game) => sum + (Number(game.points) || 0), 0);

    return { awarded: true, alreadyAwarded: false, progress: save(state) };
  }

  function reset() {
    const fresh = baseState();
    localStorage.removeItem(STORAGE_KEY);
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
    window.dispatchEvent(new CustomEvent("zit-points-changed", { detail: fresh }));
    return fresh;
  }

  function hasAwarded(gameId) {
    return Boolean(load().games[gameId]?.awarded);
  }

  window.ZITPoints = {
    load,
    save,
    award,
    awardGame: award,
    hasAwarded,
    reset,
    storageKey: STORAGE_KEY
  };
})();
