// -----getElements-----
const sheets = document.querySelector('.sheets');
const currentColor = document.querySelector('.current-color');
const prevColor = document.querySelector('.prev-color');
const redColor = document.querySelector('.red-color');
const blueColor = document.querySelector('.blue-color');
const canvas = document.querySelector('.canvas ul');

// when whole page is loaded, get from localstorage canvas DOM tree
// and rewriting on top of the canvas on the current page.
window.onload = () => {
  const saved = localStorage.getItem('canvas');
  if (saved) {
    canvas.innerHTML = saved;
  }
};

// object for localstore
const obj = {
  current: 'gray',
  previous: 'green',
};
if (localStorage.getItem('current')) {
  obj.current = JSON.parse(localStorage.getItem('current'));
} else obj.current = 'gray';
if (localStorage.getItem('previous')) {
  obj.previous = JSON.parse(localStorage.getItem('previous'));
} else obj.previous = 'green';

const proxied = new Proxy(obj, {
  set(target, prop, value) {
    localStorage.setItem(`${prop}`, JSON.stringify(value));
    return Reflect.set(target, prop, value);
  },
});

proxied.current = obj.current;
proxied.previous = obj.previous;

// ----- current and previuse color of circles -----
function currentChange(current) {
  const buff = currentColor.querySelector('.circle');
  buff.style.backgroundColor = current;
}
const buffCurr = currentColor.querySelector('.circle');
buffCurr.style.backgroundColor = proxied.current;

function prevChange(previous) {
  const buff = prevColor.querySelector('.circle');
  buff.style.backgroundColor = previous;
}
const buff = prevColor.querySelector('.circle');
buff.style.backgroundColor = proxied.previous;

// -----Sheets events-----
const pipetteEvent = (event) => {
  proxied.previous = proxied.current;
  prevChange(proxied.previous);
  proxied.current = window.getComputedStyle(event.target).backgroundColor;
  currentChange(proxied.current);
};

const bucketEvent = (event) => {
  const e = event;
  e.target.style.backgroundColor = proxied.current;
  localStorage.setItem('canvas', canvas.innerHTML);
};

let buffer = '';
const dragStart = (event) => {
  buffer = event.target;
};

const dragOver = (event) => {
  event.preventDefault();
};

const drop = (e) => {
  const droppable = e.target.outerHTML;
  e.target.outerHTML = buffer.outerHTML;
  buffer.outerHTML = droppable;
  localStorage.setItem('canvas', canvas.innerHTML);
};

const transformEvent = (event) => {
  const e = event;
  if (e.target.style.borderRadius !== '50%') {
    e.target.style.borderRadius = '50%';
  } else e.target.style.borderRadius = '0%';
  localStorage.setItem('canvas', canvas.innerHTML);
};

// -----color panel events-----
const swapEvent = () => {
  const swapBuff = proxied.current;
  proxied.current = proxied.previous;
  proxied.previous = swapBuff;
  currentChange(proxied.current);
  prevChange(proxied.previous);
};

const redBlueEvent = color => () => {
  proxied.previous = proxied.current;
  prevChange(proxied.previous);
  proxied.current = color;
  currentChange(proxied.current);
};

// -----removeEvents after choose another sheet tool-----
const removeEvents = () => {
  canvas.removeEventListener('click', bucketEvent);
  canvas.removeEventListener('click', pipetteEvent);
  canvas.removeEventListener('click', transformEvent);
  canvas.removeEventListener('dragstart', dragStart);
  canvas.removeEventListener('dragover', dragOver);
  canvas.removeEventListener('drop', drop);
}
// -----sheets panel-----
const sheetClickEvent = (event, keyUpBuffer) => {
  // *bucket*
  if (event.target.parentNode.classList.contains('bucket') || keyUpBuffer === 49) {
    removeEvents();
    canvas.addEventListener('click', bucketEvent);
    canvas.style.cursor = 'pointer';
  }

  // *pipette*
  if (event.target.parentNode.classList.contains('choose-color') || keyUpBuffer === 50) {
    removeEvents();
    canvas.addEventListener('click', pipetteEvent);
    canvas.style.cursor = 'pointer';
  }

  // *move*
  if (event.target.parentNode.classList.contains('move') || keyUpBuffer === 51) {
    removeEvents();
    canvas.addEventListener('dragstart', dragStart);
    canvas.addEventListener('dragover', dragOver, false);
    canvas.addEventListener('drop', drop);
    canvas.style.cursor = 'pointer';
  }

  // *transform
  if (event.target.parentNode.classList.contains('transform') || keyUpBuffer === 52) {
    removeEvents();
    canvas.addEventListener('click', transformEvent);
    canvas.style.cursor = 'pointer';
  }
};
sheets.addEventListener('click', sheetClickEvent);


// -----color panel-----
// *prev onclick color functionality*
prevColor.addEventListener('click', swapEvent);


// *red color button*
redColor.addEventListener('click', redBlueEvent('red'));
// *blue color button*
blueColor.addEventListener('click', redBlueEvent('blue'));

// ----- keyup event. Hotkeys are: 1,2,3,4,x -----
const keyup = (event) => {
  let keyUpBuffer = 0;
  switch (event.which) {
    case 49: keyUpBuffer = 49; break; // keyboard button '1'
    case 50: keyUpBuffer = 50; break; // keyboard button '2'
    case 51: keyUpBuffer = 51; break; // keyboard button '3'
    case 52: keyUpBuffer = 52; break; // keyboard button '4'
    case 88: { // swap previouse and current colors / button 'x'
      swapEvent();
      return;
    } default: return;
  }
  sheetClickEvent(event, keyUpBuffer);
};

document.addEventListener('keyup', keyup);
