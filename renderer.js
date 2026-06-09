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
  e: '#8B4513',
  s: '#aaddff',
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

const HAPPY_FRAMES = [
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
    '_oobooyyyooob___',
    '_ooboopppooob___',
    '__obooooooooob__',
    '___boooooooob___',
    '____bobbbbbo____',
    '________________',
    '________________',
  ],
  [
    '________________',
    '____y____y______',
    '___bb____bb_____',
    '__boob__boob____',
    '__bwkb__bwkb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_oobooyyyooob___',
    '_ooboopppooob___',
    '__obooooooobb___',
    '___boooooooobb__',
    '____bobbbbbo____',
    '________________',
    '________________',
  ],
  [
    '________________',
    '____b___________',
    '___bb____bb_____',
    '__boob__bwwb____',
    '__bwkb__bwkb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_oobooyyyooob___',
    '_ooboopppooob___',
    '__obooooooobb___',
    '___boooooooobw__',
    '____bobbbbbobw__',
    '_____bbbbb______',
    '________________',
  ],
  [
    '________________',
    '_____b__________',
    '___bb____bb_____',
    '__boob__bwwb____',
    '__bwkb__bwkb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_oobooyyyooob___',
    '_ooboopppooob___',
    '__obooooooobw___',
    '___boooooooobw__',
    '____bobbbbbobw__',
    '_____bbbbb______',
    '________________',
  ],
  [
    '________________',
    '____b___________',
    '___bb____bb_____',
    '__boob__bwwb____',
    '__bwkb__bwkb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_oobooyyyooob___',
    '_ooboopppooob___',
    '__obooooooobb___',
    '___boooooooobw__',
    '____bobbbbbobw__',
    '_____bbbbb______',
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
    '_oobooyyooob____',
    '_oobooppooob____',
    '__obooooooooob__',
    '___boooooooob___',
    '____bobbbbbo____',
    '________________',
    '________________',
  ],
];

const EATING_FRAMES = [
  [
    '________________',
    '________________',
    '___bb____bb_____',
    '__boob__boob____',
    '__bwkb__bwkb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_oobooorrooob___',
    '_oobooproooob___',
    '__obooooooooob__',
    '___boooooooob___',
    '____bobbbbbo____',
    '______eee_______',
    '_____ewwe_______',
  ],
  [
    '________________',
    '________________',
    '___bb____bb_____',
    '__boob__boob____',
    '__bwkb__bwkb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_ooboorroooob___',
    '_oobooproooob___',
    '__obooooodooob__',
    '___boooooodob___',
    '____bbboodbb____',
    '______eee_______',
    '_____ewwe_______',
  ],
  [
    '________________',
    '________________',
    '___bb____bb_____',
    '__boob__boob____',
    '__bwkb__bwkb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_ooboooorooob___',
    '_ooboorproooob__',
    '__obooooooodoo__',
    '___booooooodob__',
    '____bboooodbb___',
    '_______ee_______',
    '______ewwe______',
  ],
  [
    '________________',
    '________________',
    '___bb____bb_____',
    '__boob__boob____',
    '__bwkb__bwkb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_oobooorrooob___',
    '_oobooprrroob___',
    '__obooooodooob__',
    '___boooooodob___',
    '____bbooodbb____',
    '_______e________',
    '______ewe_______',
  ],
  [
    '________________',
    '________________',
    '___bb____bb_____',
    '__boob__boob____',
    '__bwkb__bwkb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_oobooorrooob___',
    '_oobooprrroob___',
    '__obooooodooob__',
    '___boooooodob___',
    '____bbooodbb____',
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
    '_oobooyyyooob___',
    '_ooboopppooob___',
    '__obooooooooob__',
    '___boooooooob___',
    '____bobbbbbo____',
    '________________',
    '________________',
  ],
];

const BORED_FRAMES = [
  [
    '________________',
    '________________',
    '___bb____bb_____',
    '__boob__boob____',
    '__bkkb__bkkb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_ooboorrrrrob___',
    '_oobooppooooob__',
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
    '__bkkb__bkkb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_ooboorrrrroob__',
    '_ooboopppoooob__',
    '__obooooooooob__',
    '___boooooooob___',
    '____bobbbbbo____',
    '________________',
    '________________',
  ],
  [
    '________________',
    '________________',
    '____bb___bb_____',
    '___boob__boob___',
    '___bwkb__bwkb___',
    '___bppb__bppb___',
    '____bb___bb_____',
    '___oboooooooob__',
    '__oobooooooooob_',
    '__oobooorrooob__',
    '__oobooproooob__',
    '___obooooooooob_',
    '____boooooooob__',
    '_____bobbbbbo___',
    '________________',
    '________________',
  ],
  [
    '________________',
    '________________',
    '___bb____bb_____',
    '__boob__boob____',
    '__bwkb__bwkb____',
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
    '__bgwb__bgwb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_ooboosrrooob___',
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
    '__bgwb__bgwb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_ooboosrsooob___',
    '_oobooproooob___',
    '__obooooooooob__',
    '___boooooooob___',
    '____bobbbbbo____',
    '________________',
    '________________',
  ],
];

const PETTING_FRAMES = [
  [
    '________________',
    '________________',
    '___bb____bb_____',
    '__boob__boob____',
    '__bgwb__bgwb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_oobooyyyooob___',
    '_ooboopppooob___',
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
    '__bgwb__bgwb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_oobooyyooob____',
    '_oobooppooob____',
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
    '__bgwb__bgwb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '_oobooooooooooob',
    'ooboooooooooooob',
    'oobooyyyoooboob_',
    'ooboopppoooboob_',
    '_obooooooooooob_',
    '__boooooooooob__',
    '___bobbbbbbo____',
    '________________',
    '________________',
  ],
  [
    '________________',
    '________________',
    '___bb____bb_____',
    '__boob__boob____',
    '__bgwb__bgwb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '_oobooooooooooob',
    'ooboooooooooooob',
    'oobooyyoooboob__',
    'oobooppoooboob__',
    '_obooooooooooob_',
    '__boooooooooob__',
    '___bobbbbbbo____',
    '________________',
    '________________',
  ],
  [
    '________________',
    '________________',
    '___b_____bb_____',
    '__boob__boob____',
    '__bgwb__bgwb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '_oobooooooooooob',
    'ooboooooooooooob',
    'oobooyyyoooboob_',
    'ooboopppoooboob_',
    '_obooooooooooob_',
    '__boooooooooob__',
    '___bobbbbbbo____',
    '________________',
    '________________',
  ],
  [
    '________________',
    '________________',
    '___bb____bb_____',
    '__boob__boob____',
    '__bgwb__bgwb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '_oobooooooooooob',
    'ooboooooooooooob',
    'oobooyyoooboob__',
    'oobooppoooboob__',
    '_obooooooooooob_',
    '__boooooooooob__',
    '___bobbbbbbo____',
    '________________',
    '________________',
  ],
];

const GREETING_FRAMES = [
  [
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
    '___bb____bb_____',
    '__boob__boob____',
    '__bwwb__bwwb____',
    '__bppb__bppb____',
  ],
  [
    '________________',
    '________________',
    '________________',
    '________________',
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
    '_oobooorrooob___',
  ],
  [
    '________________',
    '________________',
    '___bb____bb_____',
    '__boob__boob____',
    '__bwkb__bwkb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_oobooyyyooob___',
    '_ooboopppooob___',
    '__obooooooobb___',
    '___boooooooobw__',
    '____bobbbbbobw__',
    '_____bbbbb______',
    '________________',
  ],
  [
    '________________',
    '________________',
    '___bb____bb_____',
    '__boob__boob____',
    '__bwkb__bwkb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_oobooyyyooob___',
    '_ooboopppooob___',
    '__obooooooobw___',
    '___boooooooobw__',
    '____bobbbbbobw__',
    '_____bbbbb______',
    '________________',
  ],
  [
    '________________',
    '________________',
    '___bb____bb_____',
    '__boob__boob____',
    '__bwkb__bwkb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooob__',
    '_oobooyyyooob___',
    '_ooboopppooob___',
    '__obooooooobb___',
    '___boooooooobw__',
    '____bobbbbbobw__',
    '_____bbbbb______',
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
];

const PEEKING_FRAMES = [
  [
    '________________',
    '________________',
    '____bb___bb_____',
    '___boob__boob___',
    '___bwkb__bwkb___',
    '___bppb__bppb___',
    '____bb___bb_____',
    '___oboooooooob__',
    '__oobooooooooob_',
    '__oobooorrooob__',
    '__oobooproooob__',
    '___obooooooooob_',
    '____boooooooob__',
    '_____bobbbbbo___',
    '________________',
    '________________',
  ],
  [
    '________________',
    '________________',
    '_____bb__bb_____',
    '___boob_boob____',
    '___bwkb_bwkb____',
    '___bppb_bppb____',
    '____bb___bb_____',
    '___oboooooooob__',
    '__oobooooooooob_',
    '__ooboorroooob__',
    '__oobooproooob__',
    '___obooooooooob_',
    '____boooooooob__',
    '_____bobbbbbo___',
    '________________',
    '________________',
  ],
  [
    '________________',
    '________________',
    '_____bb__bb_____',
    '___boob_boob____',
    '___bwkb_bwkb____',
    '___bppb_bppb____',
    '____bb___bb_____',
    '___oboooooooob__',
    '__ooboooooooooob',
    '__ooboorroooob__',
    '__oobooproooob__',
    '___oboooooooooob',
    '____booooooooob_',
    '_____bobbbbbobb_',
    '_____________bb_',
    '________________',
  ],
  [
    '________________',
    '________________',
    '____bb___bb_____',
    '___boob__boob___',
    '___bwkb__bwkb___',
    '___bppb__bppb___',
    '____bb___bb_____',
    '___oboooooooob__',
    '__ooboooooooooob',
    '__ooboorroooob__',
    '__oobooproooob__',
    '___oboooooooooob',
    '____booooooooob_',
    '_____bobbbbbobb_',
    '_____________bb_',
    '________________',
  ],
  [
    '________________',
    '________________',
    '___bb____bb_____',
    '__boob__boob____',
    '__bwkb__bwkb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooooob',
    '_oobooorrooooob_',
    '_oobooprooooob__',
    '__obooooooooooob',
    '___booooooooob__',
    '____bobbbbbbobb_',
    '_____________bb_',
    '________________',
  ],
  [
    '________________',
    '________________',
    '___bb____bb_____',
    '__boob__boob____',
    '__bwkb__bwkb____',
    '__bppb__bppb____',
    '___bb____bb_____',
    '__obooooooooob__',
    '_oobooooooooooob',
    '_oobooorrooooob_',
    '_oobooprooooob__',
    '__obooooooooooob',
    '___booooooooob__',
    '____bobbbbbbobb_',
    '_____________bb_',
    '________________',
  ],
];

const FRAMES = {
  idle: IDLE_FRAMES,
  sleeping: SLEEPING_FRAMES,
  resting: RESTING_FRAMES,
  alert: ALERT_FRAMES,
  happy: HAPPY_FRAMES,
  eating: EATING_FRAMES,
  bored: BORED_FRAMES,
  petting: PETTING_FRAMES,
  greeting: GREETING_FRAMES,
  peeking: PEEKING_FRAMES,
};

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

const TRANSITIONS = {
  'idle->sleeping': [
    [
      '________________',
      '________________',
      '___bb____bb_____',
      '__boob__boob____',
      '__bgwb__bgwb____',
      '__bppb__bppb____',
      '___bb____bb_____',
      '__obooooooooob__',
      '_oobooooooooob__',
      '_ooboorrrrroob__',
      '_ooboopppoooob__',
      '__obooooooooob__',
      '___boooooooob___',
      '____bobbbbbo____',
      '________________',
      '________________',
    ],
  ],
  'idle->happy': [
    [
      '________________',
      '________________',
      '___bb____bb_____',
      '__boob__boob____',
      '__bwkb__bwkb____',
      '__bppb__bppb____',
      '___bb____bb_____',
      '__obooooooooob__',
      '_oobooooooooob__',
      '_oobooyrrooob___',
      '_oobooproooob___',
      '__obooooooooob__',
      '___boooooooob___',
      '____bobbbbbo____',
      '________________',
      '________________',
    ],
  ],
  'idle->bored': [
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
      '_oobooyrrooob___',
      '_oobooproooob___',
      '__obooooooooob__',
      '___boooooooob___',
      '____bobbbbbo____',
      '________________',
      '________________',
    ],
  ],
  'idle->petting': [
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
      '_oobooyyooob____',
      '_oobooppooob____',
      '__obooooooooob__',
      '___boooooooob___',
      '____bobbbbbo____',
      '________________',
      '________________',
    ],
  ],
  'idle->greeting': [
    [
      '________________',
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
      '_oobooorrooob___',
      '_oobooproooob___',
      '__obooooooooob__',
      '___boooooooob___',
    ],
  ],
  'idle->peeking': [
    [
      '________________',
      '________________',
      '___bb____bb_____',
      '__boob__boob____',
      '__bwkb__bwkb____',
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
  ],
  'idle->eating': [
    [
      '________________',
      '________________',
      '___bb____bb_____',
      '__boob__boob____',
      '__bwkb__bwkb____',
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
  ],
  'happy->idle': [
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
      '_oobooyyooob____',
      '_oobooppooob____',
      '__obooooooooob__',
      '___boooooooob___',
      '____bobbbbbo____',
      '________________',
      '________________',
    ],
  ],
  'petting->idle': [
    [
      '________________',
      '________________',
      '___bb____bb_____',
      '__boob__boob____',
      '__bgwb__bgwb____',
      '__bppb__bppb____',
      '___bb____bb_____',
      '__obooooooooob__',
      '_oobooooooooob__',
      '_oobooyyooob____',
      '_oobooppooob____',
      '__obooooooooob__',
      '___boooooooob___',
      '____bobbbbbo____',
      '________________',
      '________________',
    ],
  ],
  'alert->happy': [
    [
      '________________',
      '________________',
      '___bb____bb_____',
      '__boob__boob____',
      '__bwkb__bwkb____',
      '__bppb__bppb____',
      '___bb____bb_____',
      '__obooooooooob__',
      '_oobooooooooob__',
      '_oobooyyyooob___',
      '_ooboopppooob___',
      '__obooooooooob__',
      '___boooooooob___',
      '____bobbbbbo____',
      '________________',
      '________________',
    ],
  ],
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

class BTNode {
  constructor() {
    this.status = 'failure';
  }
  tick(ctx) {
    return 'failure';
  }
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
      if (result === 'running') {
        this.runningIndex = i;
        return 'running';
      }
      if (result === 'failure') {
        this.reset();
        return 'failure';
      }
    }
    this.reset();
    return 'success';
  }
  reset() {
    for (const child of this.children) {
      child.reset();
    }
    this.runningIndex = 0;
  }
}

class Condition extends BTNode {
  constructor(fn) {
    super();
    this.fn = fn;
  }
  tick(ctx) {
    return this.fn(ctx) ? 'success' : 'failure';
  }
}

class Action extends BTNode {
  constructor(fn) {
    super();
    this.fn = fn;
    this.started = false;
  }
  tick(ctx) {
    const result = this.fn(ctx, this.started);
    this.started = true;
    if (result === 'success') {
      this.started = false;
    }
    return result;
  }
  reset() {
    this.started = false;
  }
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

function isFocusing(ctx) {
  return ctx.currentPhase === 'focusing';
}

function isBreak(ctx) {
  return ctx.currentPhase === 'short-break' || ctx.currentPhase === 'long-break';
}

function isAlert(ctx) {
  return ctx.currentPhase === 'alert';
}

function isAlertDismissed(ctx) {
  return ctx.alertJustDismissed;
}

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

function playSleeping(ctx, started) {
  ctx.requestedState = 'sleeping';
  return 'success';
}

function playResting(ctx, started) {
  ctx.requestedState = 'resting';
  return 'success';
}

function playAlert(ctx, started) {
  ctx.requestedState = 'alert';
  return 'success';
}

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
  if (!ctx.mouseOnCat || ctx.mouseVelocity >= 2.0) {
    ctx.pettingActive = false;
    return 'success';
  }
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

function playIdle(ctx, started) {
  ctx.requestedState = 'idle';
  return 'success';
}

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
  new Sequence([
    new Condition(isMouseOnCatSlow),
    new Action(startPetting),
  ]),
  new Sequence([
    new Condition(isPeekingTriggered),
    new Action(startPeeking),
  ]),
  new Sequence([
    new Condition(isNoInteraction30Min),
    new Action(startBored),
  ]),
  new Selector([
    new Sequence([new Condition(isSpontaneousReady), new Action(startSpontaneous)]),
    new Action(playIdle),
  ]),
]);

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
    if (TRANSITIONS[key] && !this.transitioning) {
      this.transitionFrames = TRANSITIONS[key];
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

  isComplete() {
    return this.complete;
  }

  setExpression(overlayKey) {
    this.expressionLayer = overlayKey;
  }

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
      const frames = FRAMES[this.state];
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
    const frames = FRAMES[this.state];
    if (frames && frames.length > 0) {
      return frames[this.frameIndex % frames.length];
    }
    return FRAMES.idle[0];
  }
}

function compositeFrame(frameData, expressionKey, wallState) {
  const result = frameData.map(row => row.split(''));
  if (expressionKey && EYE_OVERLAYS[expressionKey]) {
    const overlay = EYE_OVERLAYS[expressionKey];
    for (const patch of overlay) {
      const row = result[patch.row];
      if (row) {
        for (let i = 0; i < patch.chars.length; i++) {
          const col = patch.col + i;
          if (col >= 0 && col < row.length) {
            row[col] = patch.chars[i];
          }
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
  const catCenterX = 100;
  const catCenterY = 100;
  const dx = BT_CTX.mouseX - catCenterX;
  const dy = BT_CTX.mouseY - catCenterY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 10) return 'eyes_center';
  if (Math.abs(dx) > Math.abs(dy) * 1.5) {
    return dx > 0 ? 'eyes_right' : 'eyes_left';
  }
  if (Math.abs(dy) > Math.abs(dx) * 1.5) {
    return dy > 0 ? 'eyes_down' : 'eyes_up';
  }
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
  const composited = compositeFrame(rawFrame, animEngine.expressionLayer, wallState);

  let offsetY = OFFSET_Y + getAlertBounce() + getRestingBreath() + getPettingPulse();
  let offsetX = OFFSET_X + getIdleSway();
  drawFrame(composited, Math.round(offsetX), Math.round(offsetY));

  requestAnimationFrame(mainLoop);
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
    if (!hasDragged) {
      handleCatClick();
    }
  }
});

canvas.addEventListener('mouseleave', () => {
  BT_CTX.mouseOnCat = false;
  mouseOnCanvas = false;
  if (!isPomodoroActive(BT_CTX)) {
    BT_CTX.peekingTriggered = true;
    if (BT_CTX.mouseX < 100) {
      BT_CTX.peekingDirection = 'eyes_left';
    } else {
      BT_CTX.peekingDirection = 'eyes_right';
    }
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
  if (settingsMenu.style.display === 'block') {
    settingsMenu.style.display = 'none';
    return;
  }
  if (currentPhase === 'alert') {
    window.petAPI.dismissAlert();
    BT_CTX.alertJustDismissed = true;
    BT_CTX.currentPhase = 'idle';
    currentPhase = 'idle';
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

setInterval(checkWindowEdge, 2000);

(async () => {
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

      const catStateMap = {
        idle: 'idle',
        focusing: 'sleeping',
        'short-break': 'resting',
        'long-break': 'resting',
        alert: 'alert',
      };
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
