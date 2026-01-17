let video;
let asciiDiv;
let asciiContentDiv;
let promptDiv;
let chars = '@#W$%88B0MXYU+=|\\/*:;-,. ';
let prompts = [
  "Are you still there?",
  "Say something...",
  "Please wait...",
];

let currentPrompt = '';
let charIndex = 0;
let typing = true;
let waiting = false;
let waitStart = 0;
let waitDuration = 2000;

let glitchTimer = 0;
let glitchInterval = 100;

let cols, rows;
let charW = 6;
let charH = 12;

function setup() {
  noCanvas();
  createASCIIDiv();
  setupVideo();
  pickNewPrompt();
}

function draw() {
  video.loadPixels();
  let asciiImage = '';

  for (let y = 0; y < video.height; y++) {
    for (let x = 0; x < video.width; x++) {
      // Mirror image horizontally
      let mirroredX = video.width - x - 1;
      let i = (mirroredX + y * video.width) * 4;
      const r = video.pixels[i + 0];
      const g = video.pixels[i + 1];
      const b = video.pixels[i + 2];
      const avg = (r + g + b) / 3;

      const len = chars.length;
      let charIndex = floor(map(avg, 0, 255, len - 1, 0));
      let c = chars.charAt(charIndex);

      if (random() < 0.01) {
        c = chars.charAt(floor(random(chars.length)));
      }

      asciiImage += c === ' ' ? '&nbsp;' : c;
    }
    asciiImage += '<br/>';
  }

  // Glitchy flicker
  if (millis() - glitchTimer > glitchInterval) {
    glitchTimer = millis();
    if (random() < 0.2) {
      asciiContentDiv.style('transform', `translate(${random(-0.5, 0.5)}px, ${random(-0.5, 0.5)}px)`);
    } else {
      asciiContentDiv.style('transform', 'translate(0, 0)');
    }
  }

  asciiContentDiv.html(asciiImage);
  handlePromptTyping();
}

function setupVideo() {
  cols = floor(windowWidth / charW);
  rows = floor(windowHeight / charH);

  if (video) video.remove();

  video = createCapture(VIDEO);
  video.size(cols, rows);
  video.hide();
}

function createASCIIDiv() {
  asciiDiv = createDiv();
  asciiDiv.style('font-family', 'monospace');
  asciiDiv.style('font-size', charH + 'px');
  asciiDiv.style('color', 'white');
  asciiDiv.style('background-color', 'rgb(0, 0, 139)');
  asciiDiv.style('line-height', charH + 'px');
  asciiDiv.style('white-space', 'pre');
  asciiDiv.style('padding', '0');
  asciiDiv.style('margin', '0');
  asciiDiv.style('position', 'absolute');
  asciiDiv.style('top', '0');
  asciiDiv.style('left', '0');
  asciiDiv.style('width', '100%');
  asciiDiv.style('height', '100%');
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
  promptDiv.style('background-color', 'rgba(0, 0, 139, 0.85)');
  promptDiv.style('border-radius', '4px');
  promptDiv.style('color', 'white');
  promptDiv.style('font-family', 'monospace');
  promptDiv.style('font-size', '16px');
}

function handlePromptTyping() {
  if (waiting) {
    if (millis() - waitStart > waitDuration) {
      waiting = false;
      typing = !typing;
      if (typing) pickNewPrompt();
    }
    return;
  }

  let typoGlitch = random() < 0.05;

  if (typing) {
    if (charIndex < currentPrompt.length) {
      charIndex++;
      let partial = currentPrompt.substring(0, charIndex);
      if (typoGlitch && charIndex > 1) {
        let typo = partial.substring(0, partial.length - 1) + random(chars);
        promptDiv.html('/' + typo);
      } else {
        promptDiv.html('/' + partial);
      }
    } else {
      waiting = true;
      waitStart = millis();
    }
  } else {
    if (charIndex > 0) {
      charIndex--;
      promptDiv.html('/' + currentPrompt.substring(0, charIndex));
    } else {
      waiting = true;
      waitStart = millis();
    }
  }

  if (random() < 0.05) {
    let dx = random(-2, 2);
    let dy = random(-2, 2);
    promptDiv.style('transform', `translate(${dx}px, ${dy}px)`);
  } else {
    promptDiv.style('transform', 'translate(0,0)');
  }
}

function pickNewPrompt() {
  currentPrompt = random(prompts);
  charIndex = 0;
}

function windowResized() {
  setupVideo(); // Resize video when window changes
}
