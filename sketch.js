let video;

// Containers
let asciiDiv;
let asciiContentDiv;
let promptDiv;
let startDiv;

// Characters
let chars = '@#W$%88B0MXYU+=|\\/*:;-,. ';

// Grid
let cols, rows;
let charW = 6;
let charH = 12;

// State
let started = false;

// ---------- START BUTTON ----------
let startWord = 'CLICK TO CONNECT';
let startTyped = 0;
let startLastType = 0;
let typeInterval = 140;

let cursorOn = true;
let cursorLast = 0;
let cursorInterval = 450;

// ---------- PROMPT ----------
let prompts = [
  'Are you still there?',
  'Say something...',
  'Please wait...'
];
let currentPrompt = '';
let promptIndex = 0;
let typing = true;
let waiting = false;
let waitStart = 0;
let waitDuration = 2000;

// ---------- WAVES ----------
let waveOffset = 0;

function setup() {
  noCanvas();
  createASCIIDiv();
  createStartButton();
}

function draw() {
  if (!started) {
    drawOrganicWaves();
    animateStartButton();
    return;
  }

  if (!video) return;

  video.loadPixels();
  let output = '';

  for (let y = 0; y < video.height; y++) {
    for (let x = 0; x < video.width; x++) {
      let mx = video.width - x - 1;
      let i = (mx + y * video.width) * 4;

      let r = video.pixels[i];
      let g = video.pixels[i + 1];
      let b = video.pixels[i + 2];
      let avg = (r + g + b) / 3;

      let index = floor(map(avg, 0, 255, chars.length - 1, 0));
      output += chars.charAt(index);
    }
    output += '<br/>';
  }

  asciiContentDiv.html(output);
  handlePromptTyping();
}

// ---------- ORGANIC WAVES ----------
function drawOrganicWaves() {
  cols = floor(windowWidth / charW);
  rows = floor(windowHeight / charH);

  let output = '';
  waveOffset += 0.02;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let n = noise(x * 0.08, y * 0.08, waveOffset);
      let index = floor(map(n, 0, 1, 0, chars.length - 1));
      output += chars.charAt(index);
    }
    output += '<br/>';
  }

  asciiContentDiv.html(output);
}

// ---------- START BUTTON ----------
function createStartButton() {
  startDiv = createDiv('');
  startDiv.parent(asciiDiv);

  startDiv.style('position', 'absolute');
  startDiv.style('top', '50%');
  startDiv.style('left', '50%');
  startDiv.style('transform', 'translate(-50%, -50%)');
  startDiv.style('padding', '26px 36px');
  startDiv.style('border', '1px solid white');
  startDiv.style('background', 'rgba(0,0,139,0.85)');
  startDiv.style('color', 'white');
  startDiv.style('font-family', 'monospace');
  startDiv.style('font-size', '36px');
  startDiv.style('line-height', '36px');
  startDiv.style('cursor', 'pointer');
  startDiv.style('user-select', 'none');

  startDiv.mousePressed(startExperience);
}

function animateStartButton() {
  let now = millis();

  if (startTyped < startWord.length && now - startLastType > typeInterval) {
    startLastType = now;
    startTyped++;
  }

  if (now - cursorLast > cursorInterval) {
    cursorLast = now;
    cursorOn = !cursorOn;
  }

  let text = startWord.substring(0, startTyped);
  let cursor = cursorOn ? '|' : '&nbsp;';

  startDiv.html('/' + text + cursor);
}

// ---------- START EXPERIENCE ----------
function startExperience() {
  if (started) return;

  started = true;
  startDiv.remove();

  setupVideo();
  pickNewPrompt();
}

// ---------- VIDEO ----------
function setupVideo() {
  cols = floor(windowWidth / charW);
  rows = floor(windowHeight / charH);

  video = createCapture(VIDEO);
  video.size(cols, rows);
  video.hide();
}

// ---------- PROMPT ----------
function handlePromptTyping() {
  if (waiting) {
    if (millis() - waitStart > waitDuration) {
      waiting = false;
      typing = !typing;
      if (typing) pickNewPrompt();
    }
    return;
  }

  if (typing) {
    if (promptIndex < currentPrompt.length) {
      promptIndex++;
      promptDiv.html('/' + currentPrompt.substring(0, promptIndex));
    } else {
      waiting = true;
      waitStart = millis();
    }
  } else {
    if (promptIndex > 0) {
      promptIndex--;
      promptDiv.html('/' + currentPrompt.substring(0, promptIndex));
    } else {
      waiting = true;
      waitStart = millis();
    }
  }
}

function pickNewPrompt() {
  currentPrompt = random(prompts);
  promptIndex = 0;
}

// ---------- BASE LAYOUT ----------
function createASCIIDiv() {
  asciiDiv = createDiv();
  asciiDiv.style('position', 'absolute');
  asciiDiv.style('top', '0');
  asciiDiv.style('left', '0');
  asciiDiv.style('width', '100%');
  asciiDiv.style('height', '100%');
  asciiDiv.style('background', 'rgb(0,0,139)');
  asciiDiv.style('font-family', 'monospace');
  asciiDiv.style('font-size', charH + 'px');
  asciiDiv.style('line-height', charH + 'px');
  asciiDiv.style('color', 'white');
  asciiDiv.style('white-space', 'pre');
  asciiDiv.style('overflow', 'hidden');

  asciiContentDiv = createDiv();
  asciiContentDiv.parent(asciiDiv);

  promptDiv = createDiv('/');
  promptDiv.parent(asciiDiv);
  promptDiv.style('position', 'absolute');
  promptDiv.style('bottom', '20px');
  promptDiv.style('left', '20px');
  promptDiv.style('padding', '6px 10px');
  promptDiv.style('border', '1px solid white');
  promptDiv.style('background', 'rgba(0,0,139,0.85)');
  promptDiv.style('font-family', 'monospace');
  promptDiv.style('font-size', '16px');
}
