const scenes = [
  { id: 'bear', label: 'Bear & pizza', model: 'Qwen-Image', caption: 'The pizza shrinks beside the bear.', input: 'A bear stands behind a pizza almost as wide as its body.', output: 'The same bear stands behind a much smaller pizza.' },
  { id: 'rabbit', label: 'Rabbit & laptop', model: 'GPT-Image-2', caption: 'The rabbit grows while the orange and 8-ball shrink.', input: 'A small rabbit, large orange and large 8-ball flank a laptop.', output: 'A larger rabbit, smaller orange and smaller 8-ball flank the same laptop.' },
  { id: 'cow', label: 'Cow & banana', model: 'FLUX.2', caption: 'The cow grows and the bananas shrink.', input: 'A bunch of bananas looks oversized beside a cow.', output: 'The cow is larger and the bunch of bananas is smaller.' },
  { id: 'bus', label: 'Bus & bat', model: 'Z-Image-Turbo', caption: 'The baseball bat shrinks beside the bus.', input: 'A baseball bat spans much of the width of a parked bus.', output: 'A smaller baseball bat lies in front of the same bus.' },
  { id: 'cat', label: 'Cat & cork', model: 'SD3.5-Large', caption: 'The cat grows and the cork shrinks.', input: 'A cork stands nearly as tall as a seated cat.', output: 'The cat is taller and the cork beside it is smaller.' },
  { id: 'sheep', label: 'Sheep & salt shaker', model: 'Grok Imagine', caption: 'The sheep grows and the salt shaker shrinks.', input: 'A sheep, a metal bin and a large salt shaker stand on a gray floor.', output: 'A larger sheep and smaller salt shaker stand beside the same bin.' }
];
const baselines = [
  { id: 'zebra', label: 'Zebra & pizza', note: 'Both methods see the same input. PhyScale makes the pizza smaller relative to the zebra.' },
  { id: 'penguin', label: 'Penguin & apple', note: 'Both methods shrink the oversized apple. PhyScale also enlarges the penguin.' },
  { id: 'hydrant', label: 'Hydrant & mug', note: 'The source mug is nearly half as tall as the fire hydrant. Compare its size and the guitar in the background after correction.' }
];
const $ = id => document.getElementById(id);
function setImage(id, file, description) {
  const img = $(id);
  img.src = 'assets/' + file + '.webp';
  img.alt = description;
}
function picker(container, choices, select, thumbnails) {
  const group = $(container);
  for (const [i, choice] of choices.entries()) {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-pressed', String(i === 0));
    if (thumbnails) {
      const img = document.createElement('img');
      img.src = 'assets/' + choice.id + '-thumb.webp';
      img.width = 60; img.height = 60; img.alt = '';
      button.append(img);
    }
    button.append(document.createTextNode(choice.label));
    button.addEventListener('click', () => {
      select(choice);
      for (const option of group.children) option.setAttribute('aria-pressed', String(option === button));
    });
    group.append(button);
  }
}
picker('scene-picker', scenes, scene => {
  setImage('original', scene.id + '-input', scene.input);
  setImage('corrected', scene.id + '-corrected', scene.output);
  $('scene-caption').textContent = scene.caption;
  $('generator').textContent = scene.model;
}, true);
picker('baseline-picker', baselines, scene => {
  for (const [role, name] of [['input', 'Original'], ['rescale', 'ReScale'], ['physcale', 'PhyScale']]) {
    setImage('baseline-' + role, scene.id + '-' + role, name + ' image for ' + scene.label + '.');
  }
  $('baseline-note').textContent = scene.note;
}, false);
const slider = $('wipe');
function moveSlider() {
  $('frames').style.setProperty('--split', slider.value + '%');
  slider.setAttribute('aria-valuetext', slider.value + ' percent original');
}
slider.addEventListener('input', moveSlider);
const modeButtons = document.querySelectorAll('[data-mode]');
function setMode(mode) {
  const wipe = mode === 'wipe';
  $('comparison').classList.toggle('wipe', wipe);
  slider.hidden = !wipe;
  for (const button of modeButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
  }
  moveSlider();
}
for (const button of modeButtons) {
  button.addEventListener('click', () => setMode(button.dataset.mode));
}
setMode('wipe');
$('copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText($('bibtex').textContent.trim());
    $('copy').textContent = 'Copied';
    $('copy-status').textContent = 'Citation copied.';
    setTimeout(() => { $('copy').textContent = 'Copy BibTeX'; }, 2000);
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents($('bibtex'));
    selection.removeAllRanges(); selection.addRange(range);
    $('copy').textContent = 'Text selected';
    $('copy-status').textContent = 'Citation selected. Use the copy command for your device.';
  }
});
document.documentElement.classList.add('js');
