import {
  addCoin,
  addExp,
  addPower,
  getSelectedNemo,
  load,
  spendCoin,
  updateCosmetic
} from './core/meta-state.js';

let state = load();

const $ = selector => document.querySelector(selector);
const coin = $('#coin'), gem = $('#gem'), level = $('#level'), xp = $('#xp');
const xpNeed = $('#xpNeed'), xpFill = $('#xpFill'), power = $('#power');
const nemo = $('#nemo'), hat = $('#hat'), toast = $('#toast');
const playSheet = $('#playSheet'), dressSheet = $('#dressSheet');

function render() {
  state = load();
  const selected = getSelectedNemo();
  coin.textContent = state.coin.toLocaleString();
  gem.textContent = state.gem.toLocaleString();
  level.textContent = state.level;
  xp.textContent = state.exp;
  xpNeed.textContent = state.expToNext;
  xpFill.style.width = `${Math.min(100, state.exp / state.expToNext * 100)}%`;
  power.textContent = state.power.toLocaleString();
  $('#nemoName').textContent = selected.name;
  nemo.className = `nemo skin-${state.cosmetic.skin}`;
  hat.className = `hat hat-${state.cosmetic.hat}`;
  document.querySelectorAll('[data-skin]').forEach(button => {
    button.classList.toggle('active', button.dataset.skin === state.cosmetic.skin);
  });
  document.querySelectorAll('[data-hat]').forEach(button => {
    button.classList.toggle('active', button.dataset.hat === state.cosmetic.hat);
  });

  const lastResult = $('#lastResult');
  if (state.lastResult) {
    const eventName = state.lastResult.event === 'race' ? '레이싱' : '100m';
    lastResult.textContent = `최근 ${eventName} ${state.lastResult.rank}위 · +${state.lastResult.coin} 코인 / +${state.lastResult.exp} EXP`;
    lastResult.hidden = false;
  } else {
    lastResult.hidden = true;
  }

  const params = new URLSearchParams({ from: 'home', nemo: selected.id });
  $('#goRace').href = `./race-lab.html?v=9&${params}`;
  $('#goRun').href = `../index.html?v=110&${params}`;
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1600);
}

function openSheet(element) {
  element.classList.add('show');
  element.setAttribute('aria-hidden', 'false');
}

function closeSheet(element) {
  element.classList.remove('show');
  element.setAttribute('aria-hidden', 'true');
}

$('#playBtn').addEventListener('click', () => openSheet(playSheet));
$('#dressBtn').addEventListener('click', () => openSheet(dressSheet));
document.querySelectorAll('[data-close="play"]').forEach(button => button.addEventListener('click', () => closeSheet(playSheet)));
document.querySelectorAll('[data-close="dress"]').forEach(button => button.addEventListener('click', () => closeSheet(dressSheet)));

document.querySelectorAll('[data-skin]').forEach(button => button.addEventListener('click', () => {
  updateCosmetic({ skin: button.dataset.skin });
  render();
  showToast('몸 색을 바꿨어요');
}));

document.querySelectorAll('[data-hat]').forEach(button => button.addEventListener('click', () => {
  updateCosmetic({ hat: button.dataset.hat });
  render();
  showToast(button.dataset.hat === 'none' ? '모자를 벗었어요' : '모자를 바꿨어요');
}));

$('#growBtn').addEventListener('click', () => {
  const spent = spendCoin(100);
  if (!spent.ok) {
    showToast('코인이 부족해요');
    return;
  }
  addPower(55);
  addExp(32);
  render();
  showToast('성장 완료! POWER +55');
});

$('#idleReward').addEventListener('click', () => {
  addCoin(85);
  addExp(14);
  render();
  showToast('방치 보상 +85 코인 · +14 EXP');
});

$('#collectionBtn').addEventListener('click', () => showToast('보유 네모 화면은 다음 단계에서'));
document.querySelectorAll('.bottom-nav button:not(.active)').forEach(button => {
  button.addEventListener('click', () => showToast('지금은 메인 구조만 테스트 중'));
});
document.querySelectorAll('.mode-card.locked').forEach(button => {
  button.addEventListener('click', () => showToast('새 종목은 아직 만들지 않아요'));
});

window.addEventListener('storage', render);
render();

if (new URLSearchParams(location.search).get('reward') === '1' && state.lastResult) {
  const result = state.lastResult;
  const levelText = result.levelUps ? ` · Lv.${result.levelAfter}!` : '';
  showToast(`보상 반영 · +${result.coin} 코인 / +${result.exp} EXP${levelText}`);
  history.replaceState(null, '', location.pathname);
}
