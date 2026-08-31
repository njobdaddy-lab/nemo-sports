const STORAGE_KEY = 'nemo-meta-v1';

const NEMOS = [
  { id: 'sugar', name: '슈가' },
  { id: 'brown', name: '흑설탕' },
  { id: 'brick', name: '벽돌 네모' },
  { id: 'safe', name: '금고 네모' },
  { id: 'apt', name: '아파트 네모' },
  { id: 'eraser', name: '지우개 네모' }
];

const DEFAULT_STATE = {
  version: 1,
  selectedNemoId: 'sugar',
  ownedNemoIds: ['sugar'],
  coin: 320,
  gem: 12,
  level: 1,
  exp: 18,
  expToNext: 100,
  power: 1240,
  cosmetic: { skin: 'cream', hat: 'none' },
  lastResult: null
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function requiredExp(level) {
  return 100 + (Math.max(1, Number(level) || 1) - 1) * 45;
}

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}

function migrateLegacyState() {
  const home = readJson('nemo-home-v1');
  const hub = readJson('nemoMetaV1');
  const state = clone(DEFAULT_STATE);

  if (home) {
    state.coin = Math.max(0, Number(home.coin) || state.coin);
    state.gem = Math.max(0, Number(home.gem) || state.gem);
    state.level = Math.max(1, Number(home.level) || state.level);
    state.exp = Math.max(0, Number(home.xp) || 0);
    state.power = Math.max(0, Number(home.power) || state.power);
    state.cosmetic.skin = home.skin || state.cosmetic.skin;
    state.cosmetic.hat = home.hat || state.cosmetic.hat;
  } else if (hub) {
    state.selectedNemoId = hub.selected || state.selectedNemoId;
    state.coin = Math.max(0, Number(hub.coin) || 0);
    const growth = hub.growth?.[state.selectedNemoId];
    if (growth) {
      state.level = Math.max(1, Number(growth.level) || 1);
      state.exp = Math.max(0, Number(growth.xp) || 0);
    }
  }

  state.expToNext = requiredExp(state.level);
  if (!state.ownedNemoIds.includes(state.selectedNemoId)) {
    state.ownedNemoIds.push(state.selectedNemoId);
  }
  return state;
}

function normalize(raw) {
  const state = {
    ...clone(DEFAULT_STATE),
    ...(raw || {}),
    cosmetic: { ...DEFAULT_STATE.cosmetic, ...(raw?.cosmetic || {}) }
  };
  state.selectedNemoId = NEMOS.some(nemo => nemo.id === state.selectedNemoId)
    ? state.selectedNemoId
    : DEFAULT_STATE.selectedNemoId;
  state.ownedNemoIds = [...new Set(
    Array.isArray(state.ownedNemoIds) ? state.ownedNemoIds.filter(Boolean) : ['sugar']
  )];
  if (!state.ownedNemoIds.includes(state.selectedNemoId)) {
    state.ownedNemoIds.push(state.selectedNemoId);
  }
  state.coin = Math.max(0, Number(state.coin) || 0);
  state.gem = Math.max(0, Number(state.gem) || 0);
  state.level = Math.max(1, Math.floor(Number(state.level) || 1));
  state.exp = Math.max(0, Number(state.exp) || 0);
  state.expToNext = requiredExp(state.level);
  state.power = Math.max(0, Number(state.power) || 0);
  return state;
}

export function load() {
  const stored = readJson(STORAGE_KEY);
  return normalize(stored || migrateLegacyState());
}

export function save(nextState) {
  const state = normalize(nextState);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

export function addCoin(amount) {
  const state = load();
  state.coin = Math.max(0, state.coin + Number(amount || 0));
  return save(state);
}

export function addExp(amount) {
  const state = load();
  const added = Math.max(0, Number(amount) || 0);
  state.exp += added;
  let levelUps = 0;
  while (state.exp >= requiredExp(state.level)) {
    state.exp -= requiredExp(state.level);
    state.level += 1;
    state.power += 180 + state.level * 22;
    levelUps += 1;
  }
  state.expToNext = requiredExp(state.level);
  save(state);
  return { state, levelUps };
}

export function getSelectedNemo() {
  const state = load();
  return NEMOS.find(nemo => nemo.id === state.selectedNemoId) || NEMOS[0];
}

export function setSelectedNemo(id) {
  if (!NEMOS.some(nemo => nemo.id === id)) return load();
  const state = load();
  state.selectedNemoId = id;
  if (!state.ownedNemoIds.includes(id)) state.ownedNemoIds.push(id);
  return save(state);
}

export function saveLastResult(result) {
  const state = load();
  state.lastResult = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    playedAt: new Date().toISOString(),
    ...result
  };
  return save(state);
}

export function awardResult(result) {
  const stateAfterCoin = addCoin(result.coin);
  const { state: stateAfterExp, levelUps } = addExp(result.exp);
  const state = saveLastResult({
    ...result,
    levelBefore: stateAfterCoin.level,
    levelAfter: stateAfterExp.level,
    levelUps
  });
  return { state, levelUps };
}

export function updateCosmetic(cosmetic) {
  const state = load();
  state.cosmetic = { ...state.cosmetic, ...cosmetic };
  return save(state);
}

export function spendCoin(amount) {
  const state = load();
  const cost = Math.max(0, Number(amount) || 0);
  if (state.coin < cost) return { ok: false, state };
  state.coin -= cost;
  return { ok: true, state: save(state) };
}

export function addPower(amount) {
  const state = load();
  state.power = Math.max(0, state.power + Number(amount || 0));
  return save(state);
}

export { STORAGE_KEY, NEMOS, requiredExp };
