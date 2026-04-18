// 15x15 grid layout. '·' marks filler cells (random letter, differs from neighbors).
const GRID = [
  "ÉS·SÓN·VORA····",
  "LA·LES·MIG·····",
  "UN·DOS·TRES····",
  "QUARTS·I·MIG···",
  "UNA·DUES·TRES··",
  "QUATRE·CINC·SIS",
  "SET·VUIT·NOU···",
  "DEU·ONZE·DOTZE·",
  "BENTOCADATOCATS",
  "TOCADES·PASSATS",
  "DE·D'UNA·DUES··",
  "TRES·QUATRE····",
  "CINC·SIS·SET···",
  "VUIT·NOU·DEU···",
  "D'ONZE·DOTZE···",
];

// Word → list of [row, col] cells. Keys are stable tokens used by the phrase logic.
const WORDS = {
  ES:        cells(0, 0, 2),
  SON:       cells(0, 3, 3),
  VORA:      cells(0, 7, 4),
  LA:        cells(1, 0, 2),
  LES:       cells(1, 3, 3),
  MIG_E:     cells(1, 7, 3),
  UN_NUM:    cells(2, 0, 2),
  DOS_NUM:   cells(2, 3, 3),
  TRES_NUM:  cells(2, 7, 4),
  QUART:     cells(3, 0, 5),
  QUARTS:    cells(3, 0, 6),
  I_CONJ:    cells(3, 7, 1),
  MIG_L:     cells(3, 9, 3),
  UNA_E:     cells(4, 0, 3),
  DUES_E:    cells(4, 4, 4),
  TRES_E:    cells(4, 9, 4),
  QUATRE_E:  cells(5, 0, 6),
  CINC_E:    cells(5, 7, 4),
  SIS_E:     cells(5, 12, 3),
  SET_E:     cells(6, 0, 3),
  VUIT_E:    cells(6, 4, 4),
  NOU_E:     cells(6, 9, 3),
  DEU_E:     cells(7, 0, 3),
  ONZE_E:    cells(7, 4, 4),
  DOTZE_E:   cells(7, 9, 5),
  BEN:       cells(8, 0, 3),
  TOCADA:    cells(8, 3, 6),
  TOCAT:     cells(8, 9, 5),
  TOCATS:    cells(8, 9, 6),
  TOCADES:   cells(9, 0, 7),
  PASSAT:    cells(9, 8, 6),
  PASSATS:   cells(9, 8, 7),
  DE:        cells(10, 0, 2),
  D_UNA:     cells(10, 3, 5),   // D'UNA as single compound
  DUES_L:    cells(10, 9, 4),
  TRES_L:    cells(11, 0, 4),
  QUATRE_L:  cells(11, 5, 6),
  CINC_L:    cells(12, 0, 4),
  SIS_L:     cells(12, 5, 3),
  SET_L:     cells(12, 9, 3),
  VUIT_L:    cells(13, 0, 4),
  NOU_L:     cells(13, 5, 3),
  DEU_L:     cells(13, 9, 3),
  D_ONZE:    cells(14, 0, 6),   // D'ONZE as single compound
  DOTZE_L:   cells(14, 7, 5),
};

function cells(row, startCol, length) {
  const out = [];
  for (let i = 0; i < length; i++) out.push([row, startCol + i]);
  return out;
}

const HOUR_EARLY = {
  1: "UNA_E", 2: "DUES_E", 3: "TRES_E", 4: "QUATRE_E",
  5: "CINC_E", 6: "SIS_E", 7: "SET_E", 8: "VUIT_E",
  9: "NOU_E", 10: "DEU_E", 11: "ONZE_E", 12: "DOTZE_E",
};

const HOUR_LATE_NONELIDED = {
  2: "DUES_L", 3: "TRES_L", 4: "QUATRE_L",
  5: "CINC_L", 6: "SIS_L", 7: "SET_L", 8: "VUIT_L",
  9: "NOU_L", 10: "DEU_L", 12: "DOTZE_L",
};

// For hours 1 and 11 we use the compound D'UNA / D'ONZE instead of DE + hour
function pushDeHour(words, hNext) {
  if (hNext === 1) {
    words.push("D_UNA");
  } else if (hNext === 11) {
    words.push("D_ONZE");
  } else {
    words.push("DE");
    words.push(HOUR_LATE_NONELIDED[hNext]);
  }
}

function phase(offset) {
  if (offset <= 1) return "plain";
  if (offset <= 3) return "tocat";
  if (offset <= 5) return "ben_tocat";
  if (offset === 6) return "vora_mig";
  if (offset <= 8) return "mig";
  if (offset <= 11) return "passat";
  if (offset <= 13) return "ben_passat";
  return "vora_next"; // 14
}

function wordsForTime(h24, m) {
  const h = (h24 % 12) || 12;            // 1..12
  const hNext = (h % 12) + 1;            // 1..12

  let segment, offset;
  if (m < 15)       { segment = 0; offset = m; }
  else if (m < 30)  { segment = 1; offset = m - 15; }
  else if (m < 45)  { segment = 2; offset = m - 30; }
  else              { segment = 3; offset = m - 45; }

  const p = phase(offset);
  const words = [];

  if (segment === 0) {
    // Ref = the current hour itself
    const isUna = (h === 1);
    const verb = isUna ? "ES" : "SON";
    const article = isUna ? "LA" : "LES";
    const hourWord = HOUR_EARLY[h];
    const tocatForm = isUna ? "TOCADA" : "TOCADES";

    if (p === "plain") {
      words.push(verb, article, hourWord);
    } else if (p === "tocat") {
      words.push(verb, article, hourWord, tocatForm);
    } else if (p === "ben_tocat") {
      words.push(verb, article, hourWord, "BEN", tocatForm);
    } else if (p === "vora_mig") {
      words.push("ES", "VORA", "MIG_E", "QUART");
      pushDeHour(words, hNext);
    } else if (p === "mig") {
      words.push("ES", "MIG_E", "QUART");
      pushDeHour(words, hNext);
    } else if (p === "passat") {
      words.push("ES", "MIG_E", "QUART", "PASSAT");
      pushDeHour(words, hNext);
    } else if (p === "ben_passat") {
      words.push("ES", "MIG_E", "QUART", "BEN", "PASSAT");
      pushDeHour(words, hNext);
    } else if (p === "vora_next") {
      // approaching un quart de H+1
      words.push("ES", "VORA", "UN_NUM", "QUART");
      pushDeHour(words, hNext);
    }
  } else {
    // Segments 1, 2, 3 — quart segments
    const numWord   = ["UN_NUM", "DOS_NUM", "TRES_NUM"][segment - 1];
    const quartWord = segment === 1 ? "QUART" : "QUARTS";
    const verb      = segment === 1 ? "ES" : "SON";
    const tocatForm = segment === 1 ? "TOCAT" : "TOCATS";
    const passatForm = segment === 1 ? "PASSAT" : "PASSATS";

    if (p === "plain") {
      words.push(verb, numWord, quartWord);
      pushDeHour(words, hNext);
    } else if (p === "tocat") {
      words.push(verb, numWord, quartWord, tocatForm);
      pushDeHour(words, hNext);
    } else if (p === "ben_tocat") {
      words.push(verb, numWord, quartWord, "BEN", tocatForm);
      pushDeHour(words, hNext);
    } else if (p === "vora_mig") {
      words.push(verb, "VORA", numWord, quartWord, "I_CONJ", "MIG_L");
      pushDeHour(words, hNext);
    } else if (p === "mig") {
      words.push(verb, numWord, quartWord, "I_CONJ", "MIG_L");
      pushDeHour(words, hNext);
    } else if (p === "passat") {
      words.push(verb, numWord, quartWord, "I_CONJ", "MIG_L", passatForm);
      pushDeHour(words, hNext);
    } else if (p === "ben_passat") {
      words.push(verb, numWord, quartWord, "I_CONJ", "MIG_L", "BEN", passatForm);
      pushDeHour(words, hNext);
    } else if (p === "vora_next") {
      if (segment === 1) {
        words.push("SON", "VORA", "DOS_NUM", "QUARTS");
        pushDeHour(words, hNext);
      } else if (segment === 2) {
        words.push("SON", "VORA", "TRES_NUM", "QUARTS");
        pushDeHour(words, hNext);
      } else {
        // segment 3: approaching next hour itself
        if (hNext === 1) {
          words.push("ES", "VORA", "LA", "UNA_E");
        } else {
          words.push("SON", "VORA", "LES", HOUR_EARLY[hNext]);
        }
      }
    }
  }

  return words;
}

// ---------- Rendering ----------

const ROWS = 15;
const COLS = 15;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// letterGrid[r][c]: the character displayed in each cell.
// Real letters come from GRID; '·' placeholders get a random letter
// that doesn't equal any of its four orthogonal neighbors.
let letterGrid = [];
// cellEls[r][c] = DOM element reference
const cellEls = [];

function buildLetterGrid() {
  const raw = GRID.map(row => row.split(""));
  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(""));

  // First pass: fixed letters
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const ch = raw[r][c];
      if (ch && ch !== "·") grid[r][c] = ch;
    }
  }

  // Second pass: fillers. Pick a random letter that differs from
  // any already-placed neighbor (including other fillers we just placed).
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c]) continue;
      const banned = new Set();
      const neighbors = [
        grid[r - 1]?.[c],
        grid[r + 1]?.[c],
        grid[r]?.[c - 1],
        grid[r]?.[c + 1],
      ];
      for (const n of neighbors) {
        if (n) banned.add(normalize(n));
      }
      const pool = ALPHABET.split("").filter(ch => !banned.has(ch));
      grid[r][c] = pool[Math.floor(Math.random() * pool.length)];
    }
  }
  return grid;
}

// Normalize accented forms so that neighbor comparison treats É≈E, Ó≈O, etc.
function normalize(ch) {
  return ch.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

function buildDOM() {
  const clock = document.getElementById("clock");
  clock.innerHTML = "";
  for (let r = 0; r < ROWS; r++) {
    cellEls[r] = [];
    for (let c = 0; c < COLS; c++) {
      const el = document.createElement("span");
      el.className = "cell";
      el.textContent = letterGrid[r][c];
      // Treat apostrophe specially so it's visually a bit smaller/subtler
      if (letterGrid[r][c] === "'") {
        el.classList.add("apostrophe");
      }
      clock.appendChild(el);
      cellEls[r][c] = el;
    }
  }
}

function render(h24, m) {
  const activeWords = wordsForTime(h24, m);
  const lit = new Set();
  for (const w of activeWords) {
    const coords = WORDS[w];
    if (!coords) continue;
    for (const [r, c] of coords) {
      lit.add(`${r},${c}`);
    }
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const isLit = lit.has(`${r},${c}`);
      cellEls[r][c].classList.toggle("lit", isLit);
    }
  }
}

function tick() {
  const now = new Date();
  render(now.getHours(), now.getMinutes());
  // Align next tick to the start of the next minute
  const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
  setTimeout(tick, msToNextMinute + 50);
}

letterGrid = buildLetterGrid();
buildDOM();
tick();
