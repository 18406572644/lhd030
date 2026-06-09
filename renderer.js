const canvas = document.getElementById('petCanvas');
const ctx = canvas.getContext('2d');
const countdownEl = document.getElementById('countdown');
const settingsMenu = document.getElementById('settingsMenu');
const focusDurationSelect = document.getElementById('focusDuration');
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
  alert: ALERT_FRAMES,
};

let currentState = 'idle';
let currentFrame = 0;
let lastFrameTime = 0;
const FRAME_INTERVAL = 250;

let focusEndTime = null;
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

function animate(timestamp) {
  if (timestamp - lastFrameTime >= FRAME_INTERVAL) {
    const frames = FRAMES[currentState];
    currentFrame = (currentFrame + 1) % frames.length;
    lastFrameTime = timestamp;
  }

  const frames = FRAMES[currentState];
  const frameData = frames[currentFrame];

  let offsetY = OFFSET_Y + getAlertBounce();
  let offsetX = OFFSET_X;

  if (currentState === 'idle') {
    offsetX += Math.sin(Date.now() / 600) * 3;
  }

  drawFrame(frameData, Math.round(offsetX), Math.round(offsetY));

  requestAnimationFrame(animate);
}

function updateCountdown() {
  if (!focusEndTime) {
    countdownEl.style.display = 'none';
    return;
  }
  const remaining = Math.max(0, focusEndTime - Date.now());
  if (remaining <= 0) {
    countdownEl.style.display = 'none';
    focusEndTime = null;
    clearInterval(countdownInterval);
    countdownInterval = null;
    return;
  }
  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  countdownEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  countdownEl.style.display = 'block';
}

function startFocus(durationMinutes) {
  focusEndTime = Date.now() + durationMinutes * 60 * 1000;
  currentState = 'sleeping';
  currentFrame = 0;
  settingsMenu.style.display = 'none';
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(updateCountdown, 1000);
  updateCountdown();
  window.petAPI.startFocus(durationMinutes);
}

function stopFocus() {
  focusEndTime = null;
  currentState = 'idle';
  currentFrame = 0;
  countdownEl.style.display = 'none';
  settingsMenu.style.display = 'none';
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  window.petAPI.stopFocus();
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
    currentState = 'idle';
    currentFrame = 0;
    return;
  }
  if (currentState === 'sleeping') {
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

  const quitItem = createMenuItem('退出', () => {
    menu.remove();
    window.petAPI.quit();
  });
  const resetItem = createMenuItem('重置位置', () => {
    menu.remove();
    window.petAPI.resetPosition();
  });

  if (currentState === 'sleeping') {
    const stopItem = createMenuItem('停止专注', () => {
      menu.remove();
      stopFocus();
    });
    menu.appendChild(stopItem);
  }

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
  const duration = parseInt(focusDurationSelect.value, 10);
  startFocus(duration);
});

btnCancel.addEventListener('click', () => {
  settingsMenu.style.display = 'none';
});

window.petAPI.onStateChanged((state, duration) => {
  currentState = state;
  currentFrame = 0;
  if (state === 'sleeping' && duration) {
    focusEndTime = Date.now() + duration * 60 * 1000;
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();
  }
  if (state === 'idle') {
    focusEndTime = null;
    countdownEl.style.display = 'none';
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  }
});

(async () => {
  const savedState = await window.petAPI.getStore('petState');
  const savedDuration = await window.petAPI.getStore('focusDuration');
  if (savedState) {
    currentState = savedState;
  }
  if (savedDuration) {
    focusDurationSelect.value = String(savedDuration);
  }
  requestAnimationFrame(animate);
})();
