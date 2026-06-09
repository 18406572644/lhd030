const canvas = document.getElementById('petCanvas');
const ctx = canvas.getContext('2d');
const countdownEl = document.getElementById('countdown');
const settingsMenu = document.getElementById('settingsMenu');
const progressIndicator = document.getElementById('progressIndicator');
const phaseLabel = document.getElementById('phaseLabel');
const focusDurationSelect = document.getElementById('focusDuration');
const shortBreakDurationSelect = document.getElementById('shortBreakDuration');
const longBreakDurationSelect = document.getElementById('longBreakDuration');
const longBreakIntervalSelect = document.getElementById('longBreakInterval');
const autoStartNextCheckbox = document.getElementById('autoStartNext');
const btnStart = document.getElementById('btnStart');
const btnCancel = document.getElementById('btnCancel');

const PIXEL = 10;
const COLS = 16;
const ROWS = 16;
const OFFSET_X = (200 - COLS * PIXEL) / 2;
const OFFSET_Y = (200 - ROWS * PIXEL) / 2;

const FRAME_INTERVALS = {
  idle: 250,
  happy: 120,
  bored: 400,
  eating: 200,
  petting: 300,
  greeting: 150,
  peeking: 350,
  sleeping: 500,
  resting: 300,
  alert: 200,
};

const EYE_OVERLAYS = {
  eyes_center: [
    { row: 4, col: 3, chars: 'ww' },
    { row: 4, col: 9, chars: 'ww' },
  ],
  eyes_left: [
    { row: 4, col: 3, chars: 'kw' },
    { row: 4, col: 9, chars: 'kw' },
  ],
  eyes_right: [
    { row: 4, col: 3, chars: 'wk' },
    { row: 4, col: 9, chars: 'wk' },
  ],
  eyes_up: [
    { row: 3, col: 3, chars: 'wk' },
    { row: 3, col: 9, chars: 'wk' },
    { row: 4, col: 3, chars: 'ww' },
    { row: 4, col: 9, chars: 'ww' },
  ],
  eyes_down: [
    { row: 4, col: 3, chars: 'ww' },
    { row: 4, col: 9, chars: 'ww' },
    { row: 5, col: 3, chars: 'pk' },
    { row: 5, col: 9, chars: 'pk' },
  ],
  eyes_closed: [
    { row: 4, col: 3, chars: 'kk' },
    { row: 4, col: 9, chars: 'kk' },
  ],
  eyes_half: [
    { row: 4, col: 3, chars: 'gw' },
    { row: 4, col: 9, chars: 'gw' },
  ],
};

const EYE_TRACKING_STATES = ['idle', 'peeking', 'happy', 'bored', 'greeting', 'eating'];

class SkinEngine {
  constructor() {
    this.currentSkinId = 'orange';
    this.currentColorMap = { ...PRESET_SKINS[0].colorMap, ...(PRESET_SKINS[0].patchColors || {}) };
    this.transitioning = false;
    this.oldColorMap = null;
    this.newColorMap = null;
    this.transitionStart = 0;
    this.transitionDuration = 200;
    this.customSkins = [];
    this._timestamp = 0;
  }

  async init() {
    const savedSkinId = await window.petAPI.getStore('currentSkinId');
    if (savedSkinId && this._findSkin(savedSkinId)) {
      this.currentSkinId = savedSkinId;
      this.currentColorMap = this._buildColorMap(savedSkinId);
    }
    const savedCustomSkins = await window.petAPI.getStore('customSkins');
    if (Array.isArray(savedCustomSkins)) this.customSkins = savedCustomSkins;
  }

  _findSkin(skinId) {
    for (const s of PRESET_SKINS) { if (s.id === skinId) return s; }
    for (const s of this.customSkins) { if (s.id === skinId) return s; }
    return null;
  }

  _buildColorMap(skinId) {
    const skin = this._findSkin(skinId) || PRESET_SKINS[0];
    const map = { ...skin.colorMap };
    if (skin.patchColors) Object.assign(map, skin.patchColors);
    return map;
  }

  switchSkin(skinId) {
    if (skinId === this.currentSkinId && !this.transitioning) return;
    this.oldColorMap = { ...this.currentColorMap };
    this.newColorMap = this._buildColorMap(skinId);
    this.currentSkinId = skinId;
    this.transitioning = true;
    this.transitionStart = this._timestamp || performance.now();
    window.petAPI.setStore('currentSkinId', skinId);
  }

  parseHex(hex) {
    return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  }

  toHex(r, g, b) {
    return '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
  }

  lerpColor(c1, c2, t) {
    const [r1, g1, b1] = this.parseHex(c1);
    const [r2, g2, b2] = this.parseHex(c2);
    return this.toHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
  }

  getColorMap() {
    if (!this.transitioning || !this.oldColorMap || !this.newColorMap) return this.currentColorMap;
    const now = this._timestamp || performance.now();
    const t = Math.min(1, (now - this.transitionStart) / this.transitionDuration);
    if (t >= 1) {
      this.transitioning = false;
      this.currentColorMap = { ...this.newColorMap };
      this.oldColorMap = null;
      this.newColorMap = null;
      return this.currentColorMap;
    }
    const result = {};
    const keys = new Set([...Object.keys(this.oldColorMap), ...Object.keys(this.newColorMap)]);
    for (const key of keys) {
      const o = this.oldColorMap[key];
      const n = this.newColorMap[key];
      if (!o && !n) { result[key] = null; continue; }
      if (!o) { result[key] = n; continue; }
      if (!n) { result[key] = null; continue; }
      result[key] = this.lerpColor(o, n, t);
    }
    return result;
  }

  getCurrentSkin() {
    return this._findSkin(this.currentSkinId) || PRESET_SKINS[0];
  }

  tick(timestamp) {
    this._timestamp = timestamp;
  }

  getAllSkins() {
    return [...PRESET_SKINS, ...this.customSkins];
  }

  addCustomSkin(skin) {
    if (this.customSkins.length >= 10) return false;
    this.customSkins.push(skin);
    this._saveCustomSkins();
    return true;
  }

  deleteCustomSkin(skinId) {
    this.customSkins = this.customSkins.filter(s => s.id !== skinId);
    if (this.currentSkinId === skinId) this.switchSkin('orange');
    this._saveCustomSkins();
  }

  renameCustomSkin(skinId, newName) {
    const skin = this.customSkins.find(s => s.id === skinId);
    if (skin) { skin.name = newName; this._saveCustomSkins(); }
  }

  _saveCustomSkins() {
    window.petAPI.setStore('customSkins', this.customSkins);
  }
}

const skinEngine = new SkinEngine();

class BTNode {
  constructor() { this.status = 'failure'; }
  tick(ctx) { return 'failure'; }
  reset() {}
}

class Selector extends BTNode {
  constructor(children) {
    super();
    this.children = children;
    this.activeChild = -1;
  }
  tick(ctx) {
    for (let i = 0; i < this.children.length; i++) {
      const result = this.children[i].tick(ctx);
      if (result === 'success' || result === 'running') {
        if (this.activeChild >= 0 && this.activeChild !== i) {
          this.children[this.activeChild].reset();
        }
        this.activeChild = i;
        return result;
      }
    }
    this.activeChild = -1;
    return 'failure';
  }
  reset() {
    if (this.activeChild >= 0 && this.activeChild < this.children.length) {
      this.children[this.activeChild].reset();
    }
    this.activeChild = -1;
  }
}

class Sequence extends BTNode {
  constructor(children) {
    super();
    this.children = children;
    this.runningIndex = 0;
  }
  tick(ctx) {
    for (let i = this.runningIndex; i < this.children.length; i++) {
      const result = this.children[i].tick(ctx);
      if (result === 'running') { this.runningIndex = i; return 'running'; }
      if (result === 'failure') { this.reset(); return 'failure'; }
    }
    this.reset();
    return 'success';
  }
  reset() {
    for (const child of this.children) child.reset();
    this.runningIndex = 0;
  }
}

class Condition extends BTNode {
  constructor(fn) { super(); this.fn = fn; }
  tick(ctx) { return this.fn(ctx) ? 'success' : 'failure'; }
}

class Action extends BTNode {
  constructor(fn) { super(); this.fn = fn; this.started = false; }
  tick(ctx) {
    const result = this.fn(ctx, this.started);
    this.started = true;
    if (result === 'success') this.started = false;
    return result;
  }
  reset() { this.started = false; }
}

const BT_CTX = {
  currentPhase: 'idle',
  pomodoroActive: false,
  mouseX: 100,
  mouseY: 100,
  mouseOnCat: false,
  mouseVelocity: 0,
  lastInteractionTime: Date.now(),
  currentAnimState: 'idle',
  requestedState: 'idle',
  eyeDirection: 'eyes_center',
  wallLeft: false,
  wallRight: false,
  spontaneousTimer: 0,
  spontaneousCooldown: 0,
  spontaneousBehavior: null,
  spontaneousDone: false,
  pettingActive: false,
  peekingTriggered: false,
  peekingDirection: 'eyes_right',
  alertJustDismissed: false,
};

function isPomodoroActive(ctx) {
  return ['focusing', 'short-break', 'long-break', 'alert'].includes(ctx.currentPhase);
}
function isFocusing(ctx) { return ctx.currentPhase === 'focusing'; }
function isBreak(ctx) { return ctx.currentPhase === 'short-break' || ctx.currentPhase === 'long-break'; }
function isAlert(ctx) { return ctx.currentPhase === 'alert'; }
function isAlertDismissed(ctx) { return ctx.alertJustDismissed; }
function isMouseOnCatSlow(ctx) {
  return ctx.mouseOnCat && ctx.mouseVelocity < 2.0 && !isPomodoroActive(ctx);
}
function isNoInteraction30Min(ctx) {
  return (Date.now() - ctx.lastInteractionTime) > 30 * 60 * 1000 && !isPomodoroActive(ctx);
}
function isPeekingTriggered(ctx) {
  return ctx.peekingTriggered && !isPomodoroActive(ctx);
}
function isSpontaneousReady(ctx) {
  return ctx.spontaneousTimer <= 0 && !isPomodoroActive(ctx) && ctx.spontaneousCooldown <= 0;
}

function playSleeping(ctx) { ctx.requestedState = 'sleeping'; return 'success'; }
function playResting(ctx) { ctx.requestedState = 'resting'; return 'success'; }
function playAlert(ctx) { ctx.requestedState = 'alert'; return 'success'; }
function playHappyAfterAlert(ctx, started) {
  ctx.requestedState = 'happy';
  if (started) {
    const anim = BT_CTX._animEngine;
    if (anim && anim.state === 'happy' && anim.isComplete()) {
      ctx.alertJustDismissed = false;
      return 'success';
    }
    return 'running';
  }
  return 'running';
}
function startPetting(ctx, started) {
  ctx.requestedState = 'petting';
  if (!ctx.mouseOnCat || ctx.mouseVelocity >= 2.0) { ctx.pettingActive = false; return 'success'; }
  ctx.pettingActive = true;
  return 'running';
}
function startPeeking(ctx, started) {
  ctx.requestedState = 'peeking';
  ctx.eyeDirection = ctx.peekingDirection || 'eyes_right';
  if (started) {
    const anim = BT_CTX._animEngine;
    if (anim && anim.state === 'peeking' && anim.isComplete()) {
      ctx.peekingTriggered = false;
      return 'success';
    }
    return 'running';
  }
  return 'running';
}
function startBored(ctx, started) {
  ctx.requestedState = 'bored';
  if (started) {
    const anim = BT_CTX._animEngine;
    if (anim && anim.state === 'bored' && anim.isComplete()) {
      ctx.lastInteractionTime = Date.now();
      return 'success';
    }
    return 'running';
  }
  return 'running';
}
function startSpontaneous(ctx, started) {
  if (!started) {
    const behaviors = ['eating', 'greeting'];
    ctx.spontaneousBehavior = behaviors[Math.floor(Math.random() * behaviors.length)];
    ctx.spontaneousDone = false;
  }
  ctx.requestedState = ctx.spontaneousBehavior || 'idle';
  if (started) {
    const anim = BT_CTX._animEngine;
    if (anim && anim.state === ctx.spontaneousBehavior && anim.isComplete()) {
      ctx.spontaneousCooldown = 30000 + Math.random() * 60000;
      ctx.spontaneousBehavior = null;
      ctx.spontaneousDone = true;
      return 'success';
    }
    return 'running';
  }
  return 'running';
}
function playIdle(ctx) { ctx.requestedState = 'idle'; return 'success'; }

const behaviorTree = new Selector([
  new Sequence([
    new Condition(isPomodoroActive),
    new Selector([
      new Sequence([new Condition(isAlertDismissed), new Action(playHappyAfterAlert)]),
      new Sequence([new Condition(isFocusing), new Action(playSleeping)]),
      new Sequence([new Condition(isBreak), new Action(playResting)]),
      new Sequence([new Condition(isAlert), new Action(playAlert)]),
    ]),
  ]),
  new Sequence([new Condition(isMouseOnCatSlow), new Action(startPetting)]),
  new Sequence([new Condition(isPeekingTriggered), new Action(startPeeking)]),
  new Sequence([new Condition(isNoInteraction30Min), new Action(startBored)]),
  new Selector([
    new Sequence([new Condition(isSpontaneousReady), new Action(startSpontaneous)]),
    new Action(playIdle),
  ]),
]);

function getCurrentFrames() {
  const skin = skinEngine.getCurrentSkin();
  if (skin && skin.isCustom && skin.frames) return skin.frames;
  return PIXEL_FRAMES;
}

class AnimEngine {
  constructor() {
    this.state = 'idle';
    this.frameIndex = 0;
    this.lastFrameTime = 0;
    this.transitionFrames = null;
    this.transitionIndex = 0;
    this.transitioning = false;
    this.previousState = null;
    this.expressionLayer = null;
    this.complete = false;
  }

  setState(newState) {
    if (newState === this.state && !this.transitioning) return;
    const key = `${this.state}->${newState}`;
    if (PIXEL_TRANSITIONS[key] && !this.transitioning) {
      this.transitionFrames = PIXEL_TRANSITIONS[key];
      this.transitionIndex = 0;
      this.transitioning = true;
      this.previousState = this.state;
    } else {
      this.transitionFrames = null;
      this.transitioning = false;
    }
    this.state = newState;
    this.frameIndex = 0;
    this.complete = false;
  }

  isComplete() { return this.complete; }

  setExpression(overlayKey) { this.expressionLayer = overlayKey; }

  tick(timestamp) {
    const interval = FRAME_INTERVALS[this.state] || 250;
    if (this.transitioning) {
      const transInterval = 150;
      if (timestamp - this.lastFrameTime >= transInterval) {
        this.transitionIndex++;
        if (this.transitionIndex >= this.transitionFrames.length) {
          this.transitioning = false;
          this.transitionFrames = null;
          this.frameIndex = 0;
          this.lastFrameTime = timestamp;
        } else {
          this.lastFrameTime = timestamp;
        }
      }
      return;
    }
    if (timestamp - this.lastFrameTime >= interval) {
      const frames = getCurrentFrames()[this.state];
      if (frames) {
        this.frameIndex++;
        if (this.frameIndex >= frames.length) {
          this.frameIndex = 0;
          this.complete = true;
        }
      }
      this.lastFrameTime = timestamp;
    }
  }

  getCurrentFrame() {
    if (this.transitioning && this.transitionFrames) {
      return this.transitionFrames[Math.min(this.transitionIndex, this.transitionFrames.length - 1)];
    }
    const frames = getCurrentFrames()[this.state];
    if (frames && frames.length > 0) return frames[this.frameIndex % frames.length];
    return PIXEL_FRAMES.idle[0];
  }
}

function compositeFrame(frameData, expressionKey, wallState, patches) {
  const result = frameData.map(row => row.split(''));
  if (expressionKey && EYE_OVERLAYS[expressionKey]) {
    const overlay = EYE_OVERLAYS[expressionKey];
    for (const patch of overlay) {
      const row = result[patch.row];
      if (row) {
        for (let i = 0; i < patch.chars.length; i++) {
          const col = patch.col + i;
          if (col >= 0 && col < row.length) row[col] = patch.chars[i];
        }
      }
    }
  }
  if (wallState === 'left') {
    for (let r = 0; r < result.length; r++) {
      if (result[r][0] === '_') result[r][0] = 'g';
      if (result[r][1] === '_') result[r][1] = 'g';
    }
  } else if (wallState === 'right') {
    for (let r = 0; r < result.length; r++) {
      if (result[r][15] === '_') result[r][15] = 'g';
      if (result[r][14] === '_') result[r][14] = 'g';
    }
  }
  if (patches) {
    for (const p of patches) {
      for (const r of p.rows) {
        for (const c of p.cols) {
          if (result[r] && result[r][c] !== undefined) result[r][c] = p.char;
        }
      }
    }
  }
  return result.map(row => row.join(''));
}

const animEngine = new AnimEngine();
BT_CTX._animEngine = animEngine;

let currentPhase = 'idle';
let completedPomodoros = 0;
let phaseEndTime = null;
let countdownInterval = null;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let hasDragged = false;
let lastMouseX = 100;
let lastMouseY = 100;
let lastMouseTime = Date.now();
let mouseOnCanvas = false;

function drawFrame(frameData, offsetX, offsetY) {
  const colorMap = skinEngine.getColorMap();
  ctx.clearRect(0, 0, 200, 200);
  for (let row = 0; row < frameData.length; row++) {
    const line = frameData[row];
    for (let col = 0; col < line.length; col++) {
      const colorKey = line[col];
      const color = colorMap[colorKey];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(offsetX + col * PIXEL, offsetY + row * PIXEL, PIXEL, PIXEL);
      }
    }
  }
}

function getAlertBounce() {
  if (animEngine.state !== 'alert') return 0;
  return Math.sin(Date.now() / 120) * 8;
}
function getRestingBreath() {
  if (animEngine.state !== 'resting') return 0;
  return Math.sin(Date.now() / 800) * 2;
}
function getIdleSway() {
  if (animEngine.state !== 'idle') return 0;
  return Math.sin(Date.now() / 600) * 3;
}
function getPettingPulse() {
  if (animEngine.state !== 'petting') return 0;
  return Math.sin(Date.now() / 400) * 1.5;
}

function computeEyeDirection() {
  if (!EYE_TRACKING_STATES.includes(animEngine.state)) return null;
  const dx = BT_CTX.mouseX - 100;
  const dy = BT_CTX.mouseY - 100;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 10) return 'eyes_center';
  if (Math.abs(dx) > Math.abs(dy) * 1.5) return dx > 0 ? 'eyes_right' : 'eyes_left';
  if (Math.abs(dy) > Math.abs(dx) * 1.5) return dy > 0 ? 'eyes_down' : 'eyes_up';
  return dx > 0 ? 'eyes_right' : 'eyes_left';
}

function computeWallState() {
  return BT_CTX.wallLeft ? 'left' : BT_CTX.wallRight ? 'right' : null;
}

async function checkWindowEdge() {
  try {
    const bounds = await window.petAPI.getWindowBounds();
    if (!bounds) return;
    const edgeThreshold = 20;
    BT_CTX.wallLeft = bounds.x <= edgeThreshold;
    BT_CTX.wallRight = bounds.x + bounds.width >= bounds.screenWidth - edgeThreshold;
  } catch (_) {}
}

function mainLoop(timestamp) {
  skinEngine.tick(timestamp);

  BT_CTX.spontaneousTimer -= 16;
  BT_CTX.spontaneousCooldown -= 16;
  if (BT_CTX.spontaneousTimer <= 0 && !isPomodoroActive(BT_CTX)) {
    BT_CTX.spontaneousTimer = 15000 + Math.random() * 30000;
  }

  behaviorTree.tick(BT_CTX);

  if (BT_CTX.requestedState !== animEngine.state) {
    animEngine.setState(BT_CTX.requestedState);
  }

  animEngine.tick(timestamp);

  const eyeDir = computeEyeDirection();
  if (eyeDir) {
    animEngine.setExpression(eyeDir);
    BT_CTX.eyeDirection = eyeDir;
  } else {
    animEngine.setExpression(null);
    BT_CTX.eyeDirection = 'eyes_center';
  }

  const rawFrame = animEngine.getCurrentFrame();
  const wallState = computeWallState();
  const skin = skinEngine.getCurrentSkin();
  const composited = compositeFrame(rawFrame, animEngine.expressionLayer, wallState, skin.patches || null);

  let offsetY = OFFSET_Y + getAlertBounce() + getRestingBreath() + getPettingPulse();
  let offsetX = OFFSET_X + getIdleSway();
  drawFrame(composited, Math.round(offsetX), Math.round(offsetY));

  requestAnimationFrame(mainLoop);
}

function updateCountdown() {
  if (!phaseEndTime) { countdownEl.style.display = 'none'; return; }
  const remaining = Math.max(0, phaseEndTime - Date.now());
  if (remaining <= 0) {
    countdownEl.style.display = 'none';
    phaseEndTime = null;
    clearInterval(countdownInterval);
    countdownInterval = null;
    return;
  }
  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  countdownEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  countdownEl.style.display = 'block';
  countdownEl.classList.remove('focus-mode', 'break-mode');
  if (currentPhase === 'focusing') countdownEl.classList.add('focus-mode');
  else if (currentPhase === 'short-break' || currentPhase === 'long-break') countdownEl.classList.add('break-mode');
}

function updateProgressIndicator() {
  progressIndicator.innerHTML = '';
  const interval = parseInt(longBreakIntervalSelect.value, 10) || 4;
  for (let i = 0; i < interval; i++) {
    const dot = document.createElement('div');
    dot.className = 'pomo-dot';
    if (i < completedPomodoros) dot.classList.add('completed');
    else if (i === completedPomodoros && (currentPhase === 'focusing' || currentPhase === 'alert')) dot.classList.add('current');
    progressIndicator.appendChild(dot);
  }
}

function updatePhaseLabel() {
  const labels = { idle: '', focusing: '专注中...', 'short-break': '短休息', 'long-break': '长休息', alert: '专注完成！' };
  phaseLabel.textContent = labels[currentPhase] || '';
}

function applyState(data) {
  currentPhase = data.phase;
  BT_CTX.currentPhase = data.phase;
  completedPomodoros = data.completedPomodoros || 0;
  phaseEndTime = data.endTime || null;
  if (data.justCompleted === 'break' || data.aborted === 'focus' || data.skipped === 'break') {
    BT_CTX.currentPhase = 'idle';
    BT_CTX.alertJustDismissed = false;
  }
  settingsMenu.style.display = 'none';
  if (phaseEndTime) {
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();
  } else {
    countdownEl.style.display = 'none';
    if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
  }
  if (data.config) {
    if (data.config.focusDuration) focusDurationSelect.value = String(data.config.focusDuration);
    if (data.config.shortBreakDuration) shortBreakDurationSelect.value = String(data.config.shortBreakDuration);
    if (data.config.longBreakDuration) longBreakDurationSelect.value = String(data.config.longBreakDuration);
    if (data.config.longBreakInterval) longBreakIntervalSelect.value = String(data.config.longBreakInterval);
    if (data.config.autoStartNext !== undefined) autoStartNextCheckbox.checked = data.config.autoStartNext;
  }
  updateProgressIndicator();
  updatePhaseLabel();
}

function getCurrentConfig() {
  return {
    focusDuration: parseInt(focusDurationSelect.value, 10),
    shortBreakDuration: parseInt(shortBreakDurationSelect.value, 10),
    longBreakDuration: parseInt(longBreakDurationSelect.value, 10),
    longBreakInterval: parseInt(longBreakIntervalSelect.value, 10),
    autoStartNext: autoStartNextCheckbox.checked,
  };
}

function renderSkinThumbnail(skin, canvasEl) {
  const thumbCtx = canvasEl.getContext('2d');
  const frames = (skin.isCustom && skin.frames) ? skin.frames : PIXEL_FRAMES;
  let frame = frames.idle[0];
  const colorMap = { ...skin.colorMap, ...(skin.patchColors || {}) };
  if (skin.patches) frame = compositeFrame(frame, null, null, skin.patches);
  const scale = 64 / 16;
  thumbCtx.clearRect(0, 0, 64, 64);
  for (let row = 0; row < frame.length; row++) {
    for (let col = 0; col < frame[row].length; col++) {
      const color = colorMap[frame[row][col]];
      if (color) {
        thumbCtx.fillStyle = color;
        thumbCtx.fillRect(col * scale, row * scale, scale, scale);
      }
    }
  }
}

function showSkinPanel() {
  closeSkinPanel();
  const panel = document.createElement('div');
  panel.id = 'skinPanel';
  panel.style.cssText = 'position:absolute;top:0;left:0;width:200px;height:260px;background:rgba(30,30,50,0.97);border-radius:8px;z-index:30;padding:8px;overflow-y:auto;font-family:Courier New,monospace;';
  const title = document.createElement('div');
  title.textContent = '换装';
  title.style.cssText = 'color:#fff;font-size:13px;text-align:center;margin-bottom:6px;';
  panel.appendChild(title);
  const grid = document.createElement('div');
  grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;justify-content:center;';
  const allSkins = skinEngine.getAllSkins();
  for (const skin of allSkins) {
    const item = document.createElement('div');
    item.style.cssText = 'cursor:pointer;text-align:center;';
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 64;
    thumbCanvas.height = 64;
    thumbCanvas.style.cssText = `border:2px solid ${skin.id === skinEngine.currentSkinId ? '#fff' : 'transparent'};border-radius:4px;`;
    renderSkinThumbnail(skin, thumbCanvas);
    item.appendChild(thumbCanvas);
    const label = document.createElement('div');
    label.textContent = skin.name;
    label.style.cssText = 'color:#ccc;font-size:9px;margin-top:2px;';
    item.appendChild(label);
    item.addEventListener('click', () => {
      skinEngine.switchSkin(skin.id);
      closeSkinPanel();
    });
    if (skin.isCustom) {
      const delBtn = document.createElement('div');
      delBtn.textContent = '×';
      delBtn.style.cssText = 'color:#ff6b6b;font-size:10px;cursor:pointer;margin-top:1px;display:inline;margin-left:4px;';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        skinEngine.deleteCustomSkin(skin.id);
        showSkinPanel();
      });
      item.appendChild(delBtn);
      const renameBtn = document.createElement('div');
      renameBtn.textContent = '✎';
      renameBtn.style.cssText = 'color:#87ceeb;font-size:10px;cursor:pointer;margin-top:1px;display:inline;margin-left:2px;';
      renameBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const newName = label.textContent;
        label.contentEditable = true;
        label.focus();
        const range = document.createRange();
        range.selectNodeContents(label);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        const finishRename = () => {
          label.contentEditable = false;
          const trimmed = label.textContent.trim();
          if (trimmed) skinEngine.renameCustomSkin(skin.id, trimmed);
          else label.textContent = skin.name;
        };
        label.addEventListener('blur', finishRename, { once: true });
        label.addEventListener('keydown', (ke) => {
          if (ke.key === 'Enter') { ke.preventDefault(); label.blur(); }
        });
      });
      item.appendChild(renameBtn);
    }
    grid.appendChild(item);
  }
  panel.appendChild(grid);
  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:4px;margin-top:8px;justify-content:center;';
  const createBtn = document.createElement('button');
  createBtn.textContent = '自定义';
  createBtn.style.cssText = 'padding:4px 10px;font-size:10px;border:none;border-radius:4px;background:#e74c3c;color:#fff;cursor:pointer;font-family:Courier New,monospace;';
  createBtn.addEventListener('click', () => { closeSkinPanel(); showPixelEditor(); });
  btnRow.appendChild(createBtn);
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '关闭';
  closeBtn.style.cssText = 'padding:4px 10px;font-size:10px;border:none;border-radius:4px;background:#555;color:#fff;cursor:pointer;font-family:Courier New,monospace;';
  closeBtn.addEventListener('click', closeSkinPanel);
  btnRow.appendChild(closeBtn);
  panel.appendChild(btnRow);
  document.body.appendChild(panel);
}

function closeSkinPanel() {
  const p = document.getElementById('skinPanel');
  if (p) p.remove();
}

let pixelEditorState = {
  grid: null,
  selectedChar: 'o',
  colorMap: null,
  name: '自定义皮肤',
};

function showPixelEditor() {
  closePixelEditor();
  if (!pixelEditorState.grid) {
    const skin = skinEngine.getCurrentSkin();
    const baseFrame = (skin.isCustom && skin.frames) ? skin.frames.idle[0] : PIXEL_FRAMES.idle[0];
    pixelEditorState.grid = baseFrame.map(row => row.split(''));
    pixelEditorState.colorMap = { ...skin.colorMap };
    pixelEditorState.name = '自定义皮肤';
  }
  const panel = document.createElement('div');
  panel.id = 'pixelEditor';
  panel.style.cssText = 'position:absolute;top:0;left:0;width:200px;height:260px;background:rgba(30,30,50,0.97);border-radius:8px;z-index:30;padding:6px;overflow-y:auto;font-family:Courier New,monospace;';
  const title = document.createElement('div');
  title.textContent = '像素编辑器';
  title.style.cssText = 'color:#fff;font-size:11px;text-align:center;margin-bottom:4px;';
  panel.appendChild(title);
  const gridContainer = document.createElement('div');
  gridContainer.style.cssText = 'display:grid;grid-template-columns:repeat(16,11px);grid-template-rows:repeat(16,11px);gap:0;justify-content:center;';
  const cellSize = 11;
  for (let r = 0; r < 16; r++) {
    for (let c = 0; c < 16; c++) {
      const cell = document.createElement('div');
      const ch = pixelEditorState.grid[r][c];
      const clr = pixelEditorState.colorMap[ch];
      cell.style.cssText = `width:${cellSize}px;height:${cellSize}px;border:0.5px solid rgba(255,255,255,0.1);cursor:pointer;background:${clr || 'transparent'};`;
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener('click', () => {
        pixelEditorState.grid[r][c] = pixelEditorState.selectedChar;
        const newClr = pixelEditorState.colorMap[pixelEditorState.selectedChar];
        cell.style.background = newClr || 'transparent';
      });
      gridContainer.appendChild(cell);
    }
  }
  panel.appendChild(gridContainer);
  const charLabel = document.createElement('div');
  charLabel.textContent = '画笔颜色:';
  charLabel.style.cssText = 'color:#ccc;font-size:9px;margin-top:4px;';
  panel.appendChild(charLabel);
  const palette = document.createElement('div');
  palette.style.cssText = 'display:flex;flex-wrap:wrap;gap:3px;margin-top:2px;';
  const charKeys = ['_', 'o', 'b', 'w', 'p', 'k', 'g', 'r', 'y', 'd', 'l', 'e', 's'];
  for (const ch of charKeys) {
    const swatch = document.createElement('div');
    const clr = pixelEditorState.colorMap[ch];
    swatch.style.cssText = `width:12px;height:12px;border:1px solid ${ch === pixelEditorState.selectedChar ? '#fff' : 'rgba(255,255,255,0.3)'};background:${clr || '#111'};cursor:pointer;border-radius:2px;`;
    swatch.addEventListener('click', () => {
      pixelEditorState.selectedChar = ch;
      showPixelEditor();
    });
    palette.appendChild(swatch);
  }
  panel.appendChild(palette);
  const colorRow = document.createElement('div');
  colorRow.style.cssText = 'margin-top:4px;';
  const mainLabel = document.createElement('div');
  mainLabel.textContent = '主色:';
  mainLabel.style.cssText = 'color:#ccc;font-size:9px;display:inline;';
  colorRow.appendChild(mainLabel);
  const mainInput = document.createElement('input');
  mainInput.type = 'color';
  mainInput.value = pixelEditorState.colorMap.o || '#f4a460';
  mainInput.style.cssText = 'width:20px;height:16px;border:none;padding:0;vertical-align:middle;cursor:pointer;';
  mainInput.addEventListener('input', () => { pixelEditorState.colorMap.o = mainInput.value; });
  colorRow.appendChild(mainInput);
  const secLabel = document.createElement('span');
  secLabel.textContent = ' 副色:';
  secLabel.style.cssText = 'color:#ccc;font-size:9px;';
  colorRow.appendChild(secLabel);
  const secInput = document.createElement('input');
  secInput.type = 'color';
  secInput.value = pixelEditorState.colorMap.b || '#2d2d2d';
  secInput.style.cssText = 'width:20px;height:16px;border:none;padding:0;vertical-align:middle;cursor:pointer;';
  secInput.addEventListener('input', () => { pixelEditorState.colorMap.b = secInput.value; });
  colorRow.appendChild(secInput);
  const eyeLabel = document.createElement('span');
  eyeLabel.textContent = ' 眼色:';
  eyeLabel.style.cssText = 'color:#ccc;font-size:9px;';
  colorRow.appendChild(eyeLabel);
  const eyeInput = document.createElement('input');
  eyeInput.type = 'color';
  eyeInput.value = pixelEditorState.colorMap.w || '#ffffff';
  eyeInput.style.cssText = 'width:20px;height:16px;border:none;padding:0;vertical-align:middle;cursor:pointer;';
  eyeInput.addEventListener('input', () => { pixelEditorState.colorMap.w = eyeInput.value; });
  colorRow.appendChild(eyeInput);
  panel.appendChild(colorRow);
  const nameRow = document.createElement('div');
  nameRow.style.cssText = 'margin-top:4px;display:flex;align-items:center;gap:4px;';
  const nameLabel = document.createElement('span');
  nameLabel.textContent = '名称:';
  nameLabel.style.cssText = 'color:#ccc;font-size:9px;';
  nameRow.appendChild(nameLabel);
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.value = pixelEditorState.name;
  nameInput.maxLength = 10;
  nameInput.style.cssText = 'width:100px;font-size:9px;padding:2px;border:1px solid #555;border-radius:3px;background:#2a2a3a;color:#fff;font-family:Courier New,monospace;';
  nameInput.addEventListener('input', () => { pixelEditorState.name = nameInput.value || '自定义皮肤'; });
  nameRow.appendChild(nameInput);
  panel.appendChild(nameRow);
  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:4px;margin-top:6px;justify-content:center;';
  const saveBtn = document.createElement('button');
  saveBtn.textContent = '保存';
  saveBtn.style.cssText = 'padding:4px 10px;font-size:10px;border:none;border-radius:4px;background:#e74c3c;color:#fff;cursor:pointer;font-family:Courier New,monospace;';
  saveBtn.addEventListener('click', () => {
    if (skinEngine.customSkins.length >= 10) return;
    const newSkin = {
      id: 'custom-' + Date.now(),
      name: pixelEditorState.name,
      baseColor: pixelEditorState.colorMap.o || '#f4a460',
      colorMap: { ...pixelEditorState.colorMap },
      frames: null,
      isCustom: true,
    };
    skinEngine.addCustomSkin(newSkin);
    skinEngine.switchSkin(newSkin.id);
    closePixelEditor();
  });
  btnRow.appendChild(saveBtn);
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = '取消';
  cancelBtn.style.cssText = 'padding:4px 10px;font-size:10px;border:none;border-radius:4px;background:#555;color:#fff;cursor:pointer;font-family:Courier New,monospace;';
  cancelBtn.addEventListener('click', closePixelEditor);
  btnRow.appendChild(cancelBtn);
  panel.appendChild(btnRow);
  document.body.appendChild(panel);
}

function closePixelEditor() {
  const p = document.getElementById('pixelEditor');
  if (p) p.remove();
  pixelEditorState.grid = null;
  pixelEditorState.colorMap = null;
  pixelEditorState.selectedChar = 'o';
  pixelEditorState.name = '自定义皮肤';
}

canvas.addEventListener('mousedown', (e) => {
  if (e.button === 0) {
    isDragging = true;
    hasDragged = false;
    dragStartX = e.screenX;
    dragStartY = e.screenY;
    BT_CTX.lastInteractionTime = Date.now();
  }
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const now = Date.now();
  const dt = Math.max(1, now - lastMouseTime);
  const dx = e.clientX - lastMouseX;
  const dy = e.clientY - lastMouseY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  BT_CTX.mouseVelocity = dist / dt * 1000;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
  lastMouseTime = now;
  BT_CTX.mouseX = e.clientX - rect.left;
  BT_CTX.mouseY = e.clientY - rect.top;
  const catX = 80 + OFFSET_X;
  const catY = 30 + OFFSET_Y;
  const catW = 6 * PIXEL;
  const catH = 11 * PIXEL;
  BT_CTX.mouseOnCat =
    BT_CTX.mouseX >= catX && BT_CTX.mouseX <= catX + catW &&
    BT_CTX.mouseY >= catY && BT_CTX.mouseY <= catY + catH;
  if (isDragging) {
    const deltaScreenX = e.screenX - dragStartX;
    const deltaScreenY = e.screenY - dragStartY;
    if (Math.abs(deltaScreenX) > 2 || Math.abs(deltaScreenY) > 2) {
      hasDragged = true;
      window.petAPI.moveWindow(deltaScreenX, deltaScreenY);
      dragStartX = e.screenX;
      dragStartY = e.screenY;
    }
  }
});

canvas.addEventListener('mouseup', (e) => {
  if (e.button === 0) {
    isDragging = false;
    BT_CTX.lastInteractionTime = Date.now();
    if (!hasDragged) handleCatClick();
  }
});

canvas.addEventListener('mouseleave', () => {
  BT_CTX.mouseOnCat = false;
  mouseOnCanvas = false;
  if (!isPomodoroActive(BT_CTX)) {
    BT_CTX.peekingTriggered = true;
    BT_CTX.peekingDirection = BT_CTX.mouseX < 100 ? 'eyes_left' : 'eyes_right';
  }
});

canvas.addEventListener('mouseenter', () => {
  mouseOnCanvas = true;
  BT_CTX.lastInteractionTime = Date.now();
  BT_CTX.peekingTriggered = false;
});

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  showContextMenu(e);
});

function handleCatClick() {
  if (document.getElementById('skinPanel')) { closeSkinPanel(); return; }
  if (document.getElementById('pixelEditor')) { closePixelEditor(); return; }
  if (settingsMenu.style.display === 'block') { settingsMenu.style.display = 'none'; return; }
  if (currentPhase === 'alert') {
    window.petAPI.dismissAlert();
    BT_CTX.alertJustDismissed = true;
    BT_CTX.currentPhase = 'idle';
    currentPhase = 'idle';
    updatePhaseLabel();
    return;
  }
  if (currentPhase === 'focusing' || currentPhase === 'short-break' || currentPhase === 'long-break') return;
  settingsMenu.style.display = 'block';
}

function createMenuItem(text, onClick) {
  const item = document.createElement('div');
  item.textContent = text;
  item.style.cssText = 'padding:6px 16px;color:#fff;font-size:12px;font-family:Courier New,monospace;cursor:pointer;';
  item.addEventListener('mouseenter', () => { item.style.background = 'rgba(255,255,255,0.15)'; });
  item.addEventListener('mouseleave', () => { item.style.background = 'transparent'; });
  item.addEventListener('click', onClick);
  return item;
}

function showContextMenu(e) {
  const existing = document.getElementById('contextMenu');
  if (existing) existing.remove();
  const menu = document.createElement('div');
  menu.id = 'contextMenu';
  menu.style.cssText = `position:absolute;left:${Math.min(e.clientX, 80)}px;top:${Math.min(e.clientY, 120)}px;background:rgba(40,40,60,0.95);border-radius:6px;padding:4px 0;z-index:20;min-width:120px;box-shadow:0 2px 12px rgba(0,0,0,0.3);`;
  if (currentPhase === 'focusing') {
    const abortItem = createMenuItem('提前结束专注 (作废)', () => { menu.remove(); window.petAPI.abortFocus(); });
    abortItem.style.color = '#ff6b6b';
    menu.appendChild(abortItem);
  }
  if (currentPhase === 'short-break' || currentPhase === 'long-break') {
    const skipItem = createMenuItem('跳过休息', () => { menu.remove(); window.petAPI.skipBreak(); });
    skipItem.style.color = '#5dbe7d';
    menu.appendChild(skipItem);
  }
  if (currentPhase === 'focusing' || currentPhase === 'short-break' || currentPhase === 'long-break') {
    menu.appendChild(createMenuItem('停止番茄周期', () => { menu.remove(); window.petAPI.stopPomodoro(); }));
  }
  menu.appendChild(createMenuItem('换装', () => { menu.remove(); showSkinPanel(); }));
  menu.appendChild(createMenuItem('重置位置', () => { menu.remove(); window.petAPI.resetPosition(); }));
  menu.appendChild(createMenuItem('退出', () => { menu.remove(); window.petAPI.quit(); }));
  document.body.appendChild(menu);
  const closeMenu = (ev) => {
    if (!menu.contains(ev.target)) { menu.remove(); document.removeEventListener('mousedown', closeMenu); }
  };
  setTimeout(() => document.addEventListener('mousedown', closeMenu), 0);
}

btnStart.addEventListener('click', () => {
  const config = getCurrentConfig();
  window.petAPI.setPomodoroConfig(config);
  window.petAPI.startPomodoroCycle();
});
btnCancel.addEventListener('click', () => { settingsMenu.style.display = 'none'; });
focusDurationSelect.addEventListener('change', () => { window.petAPI.setPomodoroConfig(getCurrentConfig()); });
shortBreakDurationSelect.addEventListener('change', () => { window.petAPI.setPomodoroConfig(getCurrentConfig()); });
longBreakDurationSelect.addEventListener('change', () => { window.petAPI.setPomodoroConfig(getCurrentConfig()); });
longBreakIntervalSelect.addEventListener('change', () => { window.petAPI.setPomodoroConfig(getCurrentConfig()); updateProgressIndicator(); });
autoStartNextCheckbox.addEventListener('change', () => { window.petAPI.setPomodoroConfig(getCurrentConfig()); });

window.petAPI.onStateChanged((data) => { applyState(data); });

setInterval(checkWindowEdge, 2000);

(async () => {
  await skinEngine.init();

  const savedState = await window.petAPI.getStore('petState');
  if (savedState) {
    BT_CTX.requestedState = savedState;
    animEngine.setState(savedState);
  }

  try {
    const pomodoroState = await window.petAPI.getPomodoroState();
    if (pomodoroState) {
      currentPhase = pomodoroState.phase || 'idle';
      BT_CTX.currentPhase = currentPhase;
      completedPomodoros = pomodoroState.completedPomodoros || 0;
      phaseEndTime = pomodoroState.endTime || null;
      if (pomodoroState.config) {
        const cfg = pomodoroState.config;
        if (cfg.focusDuration) focusDurationSelect.value = String(cfg.focusDuration);
        if (cfg.shortBreakDuration) shortBreakDurationSelect.value = String(cfg.shortBreakDuration);
        if (cfg.longBreakDuration) longBreakDurationSelect.value = String(cfg.longBreakDuration);
        if (cfg.longBreakInterval) longBreakIntervalSelect.value = String(cfg.longBreakInterval);
        if (cfg.autoStartNext !== undefined) autoStartNextCheckbox.checked = cfg.autoStartNext;
      }
      const catStateMap = { idle: 'idle', focusing: 'sleeping', 'short-break': 'resting', 'long-break': 'resting', alert: 'alert' };
      const initState = catStateMap[currentPhase] || 'idle';
      animEngine.setState(initState);
      BT_CTX.requestedState = initState;
    }
  } catch (_) {}

  updateProgressIndicator();
  updatePhaseLabel();
  checkWindowEdge();
  requestAnimationFrame(mainLoop);
})();
