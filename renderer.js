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

const C = {
  _: null,
  b: '#2d2d2d',
  o: '#f4a460',
  w: '#ffffff',
  p: '#ff9999',
  g: '#555555',
  k: '#1a1a1a',
  r: '#ff6b6b',
  y: '#ffe066',
  d: '#d4883a',
  l: '#87ceeb',
  m: '#ffb6c1',
};

const IDLE_FRAMES = [
  [
    '________________',
    '________________',
    '___bb____bb_____',
    '__boob__boob____',
    '__bwwb__bwwb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_oobooorrooob___',
    '_oobooproooob___',
    '__obooooooooob__',
    '___boooooooob___',
    '____bobbbbbo____',
    '________________',
    '________________',
  ],
  [
    '________________',
    '________________',
    '___bb____bb_____',
    '__boob__boob____',
    '__bwwb__bwwb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_ooboorroroob___',
    '_ooboopropoob___',
    '__obooooooooob__',
    '___boooooooob___',
    '____bobbbbbo____',
    '________________',
    '________________',
  ],
  [
    '________________',
    '________________',
    '___bb____bb_____',
    '__boob__boob____',
    '__bwwb__bwwb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_oobooorrooob___',
    '_oobooproooob___',
    '__obooooooooob__',
    '___boooooooob___',
    '____bobbbbbo____',
    '________________',
    '________________',
  ],
  [
    '________________',
    '________________',
    '___bb____bb_____',
    '__bkkb__bkkb____',
    '__bwwb__bwwb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_oobooorrooob___',
    '_oobooproooob___',
    '__obooooooooob__',
    '___boooooooob___',
    '____bobbbbbo____',
    '________________',
    '________________',
  ],
];

const SLEEPING_FRAMES = [
  [
    '________________',
    '________________',
    '________________',
    '________________',
    '___y____________',
    '___bb_____bb____',
    '__boob___oob____',
    '__bwwb___bwwb___',
    '__bppb___bppb___',
    '___bb__oobb_____',
    '__oboooob_______',
    '_ooboobooob_____',
    '_ooboobooob_____',
    '__bbbooobob_____',
    '___bbbbbbob_____',
    '________________',
  ],
  [
    '________________',
    '________________',
    '________________',
    '________________',
    '____y___________',
    '___bb_____bb____',
    '__boob___oob____',
    '__bwwb___bwwb___',
    '__bppb___bppb___',
    '___bb__oobb_____',
    '__oboooob_______',
    '_ooboobooob_____',
    '_ooboobooob_____',
    '__bbbooobob_____',
    '___bbbbbbob_____',
    '________________',
  ],
  [
    '________________',
    '________________',
    '________________',
    '____yy__________',
    '_____y__________',
    '___bb_____bb____',
    '__boob___oob____',
    '__bwwb___bwwb___',
    '__bppb___bppb___',
    '___bb__oobb_____',
    '__oboooob_______',
    '_ooboobooob_____',
    '_ooboobooob_____',
    '__bbbooobob_____',
    '___bbbbbbob_____',
    '________________',
  ],
  [
    '________________',
    '________________',
    '________________',
    '_____yy_________',
    '______y_________',
    '___bb_____bb____',
    '__boob___oob____',
    '__bwwb___bwwb___',
    '__bppb___bppb___',
    '___bb__oobb_____',
    '__oboooob_______',
    '_ooboobooob_____',
    '_ooboobooob_____',
    '__bbbooobob_____',
    '___bbbbbbob_____',
    '________________',
  ],
];

const RESTING_FRAMES = [
  [
    '________________',
    '________________',
    '___bb____bb_____',
    '__boob__boob____',
    '__bkwb__bkwb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_oobooorrooob___',
    '_oobooproooob___',
    '__obooooodooob__',
    '___boooooodob___',
    '____bbooodbo____',
    '________________',
    '________________',
  ],
  [
    '________________',
    '________________',
    '________________',
    '___bb____bb_____',
    '__boob__boob____',
    '__bkwb__bkwb____',
    '__bppbppppb_____',
    '___bbbbbbb______',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_oobooorrooob___',
    '_oobooproooob___',
    '__obooooooooob__',
    '___blllllllb____',
    '____llllll_____',
    '________________',
  ],
  [
    '________________',
    '________________',
    '_____y__________',
    '______y_________',
    '___bb___bb______',
    '__bkwb__bkwb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '___obooooob_____',
    '__ooboooob______',
    '__ooborroob_____',
    '__ooboproob_____',
    '___oboooob______',
    '___bbobbbb______',
    '________________',
    '________________',
  ],
  [
    '________________',
    '________________',
    '___bb____bb_____',
    '__bwwb__bwwb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_ooboorrrrrob___',
    '_oobooppppoob___',
    '__obooooooooob__',
    '___boooooooob___',
    '____bobbbbbo____',
    '________________',
    '________________',
    '________________',
  ],
];

const ALERT_FRAMES = [
  [
    '________________',
    '________________',
    '___bb____bb_____',
    '__boob__boob____',
    '__bwwb__bwwb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_ooboorroroob___',
    '_oobooproooob___',
    '__obooooooooob__',
    '___boooooooob___',
    '____bobbbbbo____',
    '________________',
    '________________',
  ],
  [
    '________________',
    '________________',
    '________________',
    '___bb____bb_____',
    '__boob__boob____',
    '__bwwb__bwwb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_ooboorroroob___',
    '_oobooproooob___',
    '__obooooooooob__',
    '___boooooooob___',
    '____bobbbbbo____',
    '________________',
  ],
  [
    '________________',
    '________________',
    '________________',
    '________________',
    '___bb____bb_____',
    '__boob__boob____',
    '__bwwb__bwwb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_ooboorroroob___',
    '_oobooproooob___',
    '__obooooooooob__',
    '___boooooooob___',
    '____bobbbbbo____',
  ],
  [
    '________________',
    '________________',
    '________________',
    '___bb____bb_____',
    '__boob__boob____',
    '__bwwb__bwwb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_ooboorroroob___',
    '_oobooproooob___',
    '__obooooooooob__',
    '___boooooooob___',
    '____bobbbbbo____',
    '________________',
  ],
];

const FRAMES = {
  idle: IDLE_FRAMES,
  sleeping: SLEEPING_FRAMES,
  resting: RESTING_FRAMES,
  alert: ALERT_FRAMES,
};

let currentState = 'idle';
let currentFrame = 0;
let lastFrameTime = 0;
const FRAME_INTERVAL = 250;

let currentPhase = 'idle';
let completedPomodoros = 0;
let phaseEndTime = null;
let countdownInterval = null;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let hasDragged = false;

function drawFrame(frameData, offsetX, offsetY) {
  ctx.clearRect(0, 0, 200, 200);
  for (let row = 0; row < frameData.length; row++) {
    const line = frameData[row];
    for (let col = 0; col < line.length; col++) {
      const colorKey = line[col];
      const color = C[colorKey];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(
          offsetX + col * PIXEL,
          offsetY + row * PIXEL,
          PIXEL,
          PIXEL
        );
      }
    }
  }
}

function getAlertBounce() {
  if (currentState !== 'alert') return 0;
  return Math.sin(Date.now() / 120) * 8;
}

function getRestingBreath() {
  if (currentState !== 'resting') return 0;
  return Math.sin(Date.now() / 800) * 2;
}

function animate(timestamp) {
  if (timestamp - lastFrameTime >= FRAME_INTERVAL) {
    const frames = FRAMES[currentState];
    currentFrame = (currentFrame + 1) % frames.length;
    lastFrameTime = timestamp;
  }

  const frames = FRAMES[currentState];
  const frameData = frames[currentFrame];

  let offsetY = OFFSET_Y + getAlertBounce() + getRestingBreath();
  let offsetX = OFFSET_X;

  if (currentState === 'idle') {
    offsetX += Math.sin(Date.now() / 600) * 3;
  }

  drawFrame(frameData, Math.round(offsetX), Math.round(offsetY));

  requestAnimationFrame(animate);
}

function updateCountdown() {
  if (!phaseEndTime) {
    countdownEl.style.display = 'none';
    return;
  }
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
  if (currentPhase === 'focusing') {
    countdownEl.classList.add('focus-mode');
  } else if (currentPhase === 'short-break' || currentPhase === 'long-break') {
    countdownEl.classList.add('break-mode');
  }
}

function updateProgressIndicator() {
  progressIndicator.innerHTML = '';
  const interval = parseInt(longBreakIntervalSelect.value, 10) || 4;
  for (let i = 0; i < interval; i++) {
    const dot = document.createElement('div');
    dot.className = 'pomo-dot';
    if (i < completedPomodoros) {
      dot.classList.add('completed');
    } else if (i === completedPomodoros && (currentPhase === 'focusing' || currentPhase === 'alert')) {
      dot.classList.add('current');
    }
    progressIndicator.appendChild(dot);
  }
}

function updatePhaseLabel() {
  const labels = {
    idle: '',
    focusing: '专注中...',
    'short-break': '短休息',
    'long-break': '长休息',
    alert: '专注完成！',
  };
  phaseLabel.textContent = labels[currentPhase] || '';
}

function applyState(data) {
  currentPhase = data.phase;
  completedPomodoros = data.completedPomodoros || 0;
  phaseEndTime = data.endTime || null;

  const catStateMap = {
    idle: 'idle',
    focusing: 'sleeping',
    'short-break': 'resting',
    'long-break': 'resting',
    alert: 'alert',
  };

  currentState = catStateMap[currentPhase] || 'idle';
  currentFrame = 0;
  settingsMenu.style.display = 'none';

  if (phaseEndTime) {
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();
  } else {
    countdownEl.style.display = 'none';
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
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

canvas.addEventListener('mousedown', (e) => {
  if (e.button === 0) {
    isDragging = true;
    hasDragged = false;
    dragStartX = e.screenX;
    dragStartY = e.screenY;
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const deltaX = e.screenX - dragStartX;
    const deltaY = e.screenY - dragStartY;
    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
      hasDragged = true;
      window.petAPI.moveWindow(deltaX, deltaY);
      dragStartX = e.screenX;
      dragStartY = e.screenY;
    }
  }
});

canvas.addEventListener('mouseup', (e) => {
  if (e.button === 0) {
    isDragging = false;
    if (!hasDragged) {
      handleCatClick();
    }
  }
});

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  showContextMenu(e);
});

function handleCatClick() {
  if (settingsMenu.style.display === 'block') {
    settingsMenu.style.display = 'none';
    return;
  }
  if (currentState === 'alert') {
    window.petAPI.dismissAlert();
    currentState = 'idle';
    currentPhase = 'idle';
    currentFrame = 0;
    updatePhaseLabel();
    return;
  }
  if (currentPhase === 'focusing' || currentPhase === 'short-break' || currentPhase === 'long-break') {
    return;
  }
  settingsMenu.style.display = 'block';
}

function showContextMenu(e) {
  const existing = document.getElementById('contextMenu');
  if (existing) existing.remove();

  const menu = document.createElement('div');
  menu.id = 'contextMenu';
  menu.style.cssText = `
    position: absolute;
    left: ${Math.min(e.clientX, 80)}px;
    top: ${Math.min(e.clientY, 120)}px;
    background: rgba(40, 40, 60, 0.95);
    border-radius: 6px;
    padding: 4px 0;
    z-index: 20;
    min-width: 120px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.3);
  `;

  if (currentPhase === 'focusing') {
    const abortItem = createMenuItem('提前结束专注 (作废)', () => {
      menu.remove();
      window.petAPI.abortFocus();
    });
    abortItem.style.color = '#ff6b6b';
    menu.appendChild(abortItem);
  }

  if (currentPhase === 'short-break' || currentPhase === 'long-break') {
    const skipItem = createMenuItem('跳过休息', () => {
      menu.remove();
      window.petAPI.skipBreak();
    });
    skipItem.style.color = '#5dbe7d';
    menu.appendChild(skipItem);
  }

  if (currentPhase === 'focusing' || currentPhase === 'short-break' || currentPhase === 'long-break') {
    const stopItem = createMenuItem('停止番茄周期', () => {
      menu.remove();
      window.petAPI.stopPomodoro();
    });
    menu.appendChild(stopItem);
  }

  const resetItem = createMenuItem('重置位置', () => {
    menu.remove();
    window.petAPI.resetPosition();
  });
  const quitItem = createMenuItem('退出', () => {
    menu.remove();
    window.petAPI.quit();
  });

  menu.appendChild(resetItem);
  menu.appendChild(quitItem);
  document.body.appendChild(menu);

  const closeMenu = (ev) => {
    if (!menu.contains(ev.target)) {
      menu.remove();
      document.removeEventListener('mousedown', closeMenu);
    }
  };
  setTimeout(() => document.addEventListener('mousedown', closeMenu), 0);
}

function createMenuItem(text, onClick) {
  const item = document.createElement('div');
  item.textContent = text;
  item.style.cssText = `
    padding: 6px 16px;
    color: #fff;
    font-size: 12px;
    font-family: 'Courier New', monospace;
    cursor: pointer;
  `;
  item.addEventListener('mouseenter', () => {
    item.style.background = 'rgba(255,255,255,0.15)';
  });
  item.addEventListener('mouseleave', () => {
    item.style.background = 'transparent';
  });
  item.addEventListener('click', onClick);
  return item;
}

btnStart.addEventListener('click', () => {
  const config = getCurrentConfig();
  window.petAPI.setPomodoroConfig(config);
  window.petAPI.startPomodoroCycle();
});

btnCancel.addEventListener('click', () => {
  settingsMenu.style.display = 'none';
});

focusDurationSelect.addEventListener('change', () => {
  window.petAPI.setPomodoroConfig(getCurrentConfig());
});
shortBreakDurationSelect.addEventListener('change', () => {
  window.petAPI.setPomodoroConfig(getCurrentConfig());
});
longBreakDurationSelect.addEventListener('change', () => {
  window.petAPI.setPomodoroConfig(getCurrentConfig());
});
longBreakIntervalSelect.addEventListener('change', () => {
  window.petAPI.setPomodoroConfig(getCurrentConfig());
  updateProgressIndicator();
});
autoStartNextCheckbox.addEventListener('change', () => {
  window.petAPI.setPomodoroConfig(getCurrentConfig());
});

window.petAPI.onStateChanged((data) => {
  applyState(data);
});

(async () => {
  const savedState = await window.petAPI.getStore('petState');
  if (savedState) {
    currentState = savedState;
  }

  try {
    const pomodoroState = await window.petAPI.getPomodoroState();
    if (pomodoroState) {
      currentPhase = pomodoroState.phase || 'idle';
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

      const catStateMap = {
        idle: 'idle',
        focusing: 'sleeping',
        'short-break': 'resting',
        'long-break': 'resting',
        alert: 'alert',
      };
      currentState = catStateMap[currentPhase] || 'idle';
    }
  } catch (_) {}

  updateProgressIndicator();
  updatePhaseLabel();
  requestAnimationFrame(animate);
})();
