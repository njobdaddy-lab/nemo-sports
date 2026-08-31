import { awardResult, getSelectedNemo, setSelectedNemo } from './meta-state.js';

const params = new URLSearchParams(location.search);
const enteredFromHome = params.get('from') === 'home';
const requestedNemoId = params.get('nemo');
if (requestedNemoId) setSelectedNemo(requestedNemoId);

const result = document.querySelector('#result');
const timer = document.querySelector('#timer');
const homeButton = document.querySelector('#homeBtn');
if (!result || !timer || !homeButton) throw new Error('100m meta bridge target missing');

const NAME_TO_ID = {
  '각설탕': 'sugar',
  '흑설탕': 'brown',
  '벽돌': 'brick',
  '금고': 'safe',
  '아파트': 'apt'
};
const REWARD_BY_RANK = {
  1: { coin: 90, exp: 65 },
  2: { coin: 65, exp: 45 },
  3: { coin: 45, exp: 32 },
  4: { coin: 30, exp: 22 }
};

let raceSerial = 0;
let awardedSerial = -1;
let lastTimerText = timer.textContent.trim();

function syncRequestedNemo() {
  if (!requestedNemoId) return true;
  const requested = document.querySelector(`#chars .charCard[data-c="${CSS.escape(requestedNemoId)}"]`);
  if (!requested) return false;
  requested.click();
  return true;
}

if (!syncRequestedNemo()) {
  const waitForGame = setInterval(() => {
    if (syncRequestedNemo()) clearInterval(waitForGame);
  }, 100);
  setTimeout(() => clearInterval(waitForGame), 12000);
}

function ensureRewardBox() {
  let box = document.querySelector('#metaReward100m');
  if (box) return box;
  box = document.createElement('div');
  box.id = 'metaReward100m';
  box.className = 'metaReward100m';
  box.innerHTML = '<span>🪙 획득 코인 <b id="metaCoin100m">+0</b></span><span>EXP <b id="metaExp100m">+0</b></span>';
  result.querySelector('.actions')?.insertAdjacentElement('beforebegin', box);

  const style = document.createElement('style');
  style.textContent = '.metaReward100m{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0}.metaReward100m span{padding:11px;border-radius:14px;background:#eef4fb;color:#263d59;font-size:13px;font-weight:800;text-align:center}.metaReward100m b{display:block;margin-top:3px;font-size:17px}';
  document.head.appendChild(style);
  return box;
}

function playerResult() {
  const row = document.querySelector('#rows .row.me');
  if (!row) return null;
  const label = row.querySelector('span')?.textContent || '';
  const match = label.match(/(\d+)위\s*·.*?\((.*?)\)/);
  const rank = match ? Number(match[1]) : Number.parseInt(document.querySelector('#rankBadge')?.textContent || '', 10);
  const record = document.querySelector('#record')?.textContent?.trim() || '';
  if (!Number.isFinite(rank) || !record) return null;
  const nemoName = match?.[2] || getSelectedNemo().name;
  return { rank, record, nemoName, nemoId: NAME_TO_ID[nemoName] || getSelectedNemo().id };
}

function award() {
  if (result.hidden || awardedSerial === raceSerial) return;
  const outcome = playerResult();
  if (!outcome) {
    requestAnimationFrame(award);
    return;
  }
  awardedSerial = raceSerial;
  const reward = REWARD_BY_RANK[outcome.rank] || REWARD_BY_RANK[4];
  awardResult({
    event: '100m',
    ...outcome,
    coin: reward.coin,
    exp: reward.exp
  });
  ensureRewardBox();
  document.querySelector('#metaCoin100m').textContent = `+${reward.coin}`;
  document.querySelector('#metaExp100m').textContent = `+${reward.exp}`;
}

new MutationObserver(() => {
  const text = timer.textContent.trim();
  if (text === '3' && lastTimerText !== '3') raceSerial += 1;
  lastTimerText = text;
}).observe(timer, { childList: true, subtree: true, characterData: true });

new MutationObserver(() => {
  if (!result.hidden) setTimeout(award, 0);
}).observe(result, { attributes: true, attributeFilter: ['hidden'] });

if (enteredFromHome) {
  homeButton.textContent = 'HOME으로';
  homeButton.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    location.href = './v2/nemo-home.html?reward=1';
  }, true);
}
