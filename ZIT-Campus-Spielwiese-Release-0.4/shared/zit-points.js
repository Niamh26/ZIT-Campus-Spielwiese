(function () {
  "use strict";

  const STORAGE_KEY = "zitCampusProgressV1";

  const DEFAULT_PROGRESS = {
    version: 1,
    totalPoints: 0,
    games: {}
  };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(DEFAULT_PROGRESS);

      const parsed = JSON.parse(raw);
      return {
        version: 1,
        totalPoints: Number(parsed.totalPoints) || 0,
        games: parsed.games && typeof parsed.games === "object" ? parsed.games : {}
      };
    } catch (error) {
      console.warn("ZIT-Punktestand konnte nicht geladen werden:", error);
      return structuredClone(DEFAULT_PROGRESS);
    }
  }

  function save(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    window.dispatchEvent(new CustomEvent("zit-points-changed", { detail: progress }));
  }

  function award(gameId, points, title) {
    if (!gameId || !Number.isFinite(points) || points <= 0) {
      return { awarded: false, reason: "invalid-data", progress: load() };
    }

    const progress = load();

    if (progress.games[gameId]?.awarded) {
      return { awarded: false, reason: "already-awarded", progress };
    }

    const roundedPoints = Math.round(points);

    progress.games[gameId] = {
      awarded: true,
      points: roundedPoints,
      title: title || gameId,
      awardedAt: new Date().toISOString()
    };

    progress.totalPoints = Object.values(progress.games)
      .filter((game) => game.awarded)
      .reduce((sum, game) => sum + (Number(game.points) || 0), 0);

    save(progress);

    return { awarded: true, reason: "success", progress };
  }

  function isAwarded(gameId) {
    return Boolean(load().games[gameId]?.awarded);
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    const progress = structuredClone(DEFAULT_PROGRESS);
    window.dispatchEvent(new CustomEvent("zit-points-changed", { detail: progress }));
    return progress;
  }

  window.ZITPoints = {
    storageKey: STORAGE_KEY,
    load,
    save,
    award,
    isAwarded,
    reset
  };
})();
