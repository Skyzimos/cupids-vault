/*
             
     ____  _             _ _        __  __
    / ___|| |_ _   _  __| (_) ___   \ \/ /
    \___ \| __| | | |/ _` | |/ _ \   \  / 
     ___) | |_| |_| | (_| | | (_) |  /  \ 
    |____/ \__|\__,_|\__,_|_|\___/  /_/\_\                       


    Studio X, LLC Internal Framework
	Written by Jesse
	Developed with a keyboard and pixie dust.

    -+-+-+- SPECIFICS -+-+-+-
	scripts/pages/home/main.js
	===========

    The main logic for the Cupid's Vault minigame.
    
    ===========

    Created: 2026-02-05
    Last Updated: 2026-02-06


*/

/*---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

/* -----------------------------
       CONFIG & CONSTANTS
----------------------------- */
const Fetch = Framework.get('Fetch');

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxPF9Xk8sVtCdhpCohApuOe6CmmPxBsg0y6k4aVYQH-Bt40zyqcK-1sQ5iVsbdBBqE8cA/exec';
const LOCAL_STORAGE_KEY = 'swag-cv-play';
const DEVICE_ID_KEY = 'swag-cv-device_id';
const SERVER_TESTING = false;
const GAME_ACTIVE = true;

const STOP_ANGLES = {
    lose: [0, -107],
    win: [50, -55, 100]
};

/* -----------------------------
        DOM REFERENCES
----------------------------- */
const elements = {
    background: document.querySelector('.background'),
    logo: document.querySelector('.logo'),
    directions: document.querySelector('._directions'),
    nameContainer: document.getElementById('_contentNameContainer'),
    gameContainer: document.getElementById('_contentGameContainer'),
    result: document.getElementById('_contentResult'),
    firstName: document.getElementById('input_firstName'),
    lastInitial: document.getElementById('input_lastInitial'),
    playButton: document.getElementById('_playButton'),
    wheel: document.querySelector('._contentGameWheel'),
    spinButton: document.querySelector('._contentGameWheelSpinButton'),
    carrot: document.querySelector('._contentGameWheelCarrot')
};

/* -----------------------------
       STATE MANAGEMENT
----------------------------- */
let serverVerdict = null;
let hasPlayed = false;
let currentRotation = 0;
let isSpinning = false;

/* -----------------------------
        INITIALIZATION
----------------------------- */
if (SERVER_TESTING) {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
}

restorePreviousPlay();
attachEvents();
animateBackground();

/* -----------------------------
        EVENT BINDINGS
----------------------------- */
function attachEvents() {
    elements.playButton.addEventListener('click', handlePlay);
}

/* -----------------------------
           PLAY FLOW
----------------------------- */
async function handlePlay() {
    const first = elements.firstName.value.trim();
    const last = elements.lastInitial.value.trim();

    if (!/^[A-Za-z]+$/.test(first)) {
        alert('Enter a valid first name (letters only).');
        return;
    }

    if (!/^[A-Za-z]$/.test(last)) {
        alert('Enter a single last initial (A-Z).');
        return;
    }

    if (localStorage.getItem(LOCAL_STORAGE_KEY)) {
        alert('You have already played.');
        return;
    }

    const name = formatName(first, last);
    lockInputs(true);
    setResultRow('Retrieving game certificate. <span class="loader"></span>', true);

    const deviceId = getDeviceId();

    try {
        const params = new URLSearchParams({ action: 'play', name, deviceId });
        const json = await Fetch.post(APPS_SCRIPT_URL, params);
        console.log(json)

        setTimeout(() => processServerResponse(json, name, deviceId), 100);
    } catch (e) {
        console.error(e);
        unlockAfterError('Internal server error. (err. 402)');
    }
}

function processServerResponse(json, name, deviceId) {
    setResultRow('Validating certificate.. <span class="loader"></span>', true);

    if (json.error === 'name_already_played') {
        alert('Name already played. Contact admin for further assistance.');
        resetInputs();
        return;
    }

    serverVerdict = json;
    elements.playButton.innerHTML = 'Played';

    savePlayResult(json, name, deviceId);

    setTimeout(() => {
        setResultRow('Loading game... <span class="loader"></span>', true);
        setTimeout(showGame, 400);
    }, 400);
}

/* -----------------------------
          GAME DISPLAY
----------------------------- */
function showGame() {
    elements.gameContainer.style.display = 'block';
    elements.directions.style.display = 'none';
    elements.logo.style.width = '32.5%';

    elements.nameContainer.parentNode.insertBefore(elements.result, elements.nameContainer);
    elements.nameContainer.parentNode.insertBefore(elements.gameContainer, elements.nameContainer);

    elements.result.innerHTML = 'Click "Spin" to see if you win!';

    elements.spinButton.scrollIntoView({ block: 'center', behavior: 'smooth' });
    elements.spinButton.onclick = () => {
        if (!hasPlayed) {
            spinWheel(serverVerdict.result === 'win');
            hasPlayed = true;
        }
    };
}

/* -----------------------------
         WHEEL LOGIC
----------------------------- */
function spinWheel(isWin) {
    if (isSpinning) return;
    isSpinning = true;

    const targetAngle = pickRandom(STOP_ANGLES[isWin ? 'win' : 'lose']);
    const extraSpins = Math.floor(Math.random() * 3) + 13;
    const normalized = ((currentRotation % 360) + 360) % 360;

    const finalRotation =
        currentRotation -
        extraSpins * 360 +
        (targetAngle - normalized);

    const overshoot = finalRotation - 6;

    resetWheel();
    preloadSpin();

    setTimeout(() => mainSpin(overshoot, finalRotation, targetAngle), 220);
}

function resetWheel() {
    elements.wheel.style.transition = 'none';
    elements.wheel.style.transform = `translate(-50%, -50%) rotate(${currentRotation}deg)`;
    elements.wheel.getBoundingClientRect();
}

function preloadSpin() {
    elements.wheel.style.transition = 'transform 0.22s cubic-bezier(0.4, 0, 0.6, 1)';
    elements.wheel.style.transform = `translate(-50%, -50%) rotate(${currentRotation + 40}deg)`;
}

function mainSpin(overshoot, finalRotation, targetAngle) {
    elements.wheel.style.transition = 'transform 6.7s cubic-bezier(0.15, 0.85, 0.25, 1)';
    elements.wheel.style.transform = `translate(-50%, -50%) rotate(${overshoot}deg)`;

    setTimeout(() => settleSpin(finalRotation, targetAngle), 6700);
}

function settleSpin(finalRotation, targetAngle) {
    elements.wheel.style.transition = 'transform 0.18s ease-out';
    elements.wheel.style.transform = `translate(-50%, -50%) rotate(${finalRotation}deg)`;

    setTimeout(() => {
        currentRotation = finalRotation;
        isSpinning = false;
        checkWin(getSpinMessage(targetAngle));
    }, 180);
}

/* -----------------------------
        RESULT HANDLING
----------------------------- */
function checkWin(message) {
    const win = serverVerdict.result === 'win';

    elements.result.style.flexDirection = 'column';
    elements.result.innerHTML = win
        ? `${message}<br><b>WINNER! Show this code to claim: 🎉</b> <code style="background:#fff;padding:2px 6px;color:#111">${serverVerdict.claimCode}</code>`
        : `${message}<br>Better luck next time! 💔`;

    setTimeout(() => applyEndState(win), 500);
}

function applyEndState(win) {
    elements.wheel.style.filter = win ? 'saturate(110%) brightness(110%)' : 'saturate(110%) brightness(80%)';
    elements.spinButton.style.filter = win ? 'saturate(110%) brightness(90%)' : 'saturate(110%) brightness(60%)';
    elements.carrot.style.filter = win ? 'saturate(110%) brightness(130%)' : 'saturate(110%) brightness(100%)';

    [elements.wheel, elements.spinButton, elements.carrot].forEach(el => el.style.pointerEvents = 'none');
}

/* -----------------------------
      BACKGROUND ANIMATION
----------------------------- */
function animateBackground() {
    let start = performance.now();

    function frame(time) {
        const t = (time - start) / 1000;
        const x = Math.sin(t / 12) * 50;
        const y = Math.sin(t / 18) * 50;

        elements.background.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.03)`;
        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}

/* -----------------------------
           UTILITIES
----------------------------- */
function formatName(first, last) {
    return `${first.charAt(0).toUpperCase()}${first.slice(1).toLowerCase()} ${last.toUpperCase()}`;
}

function getDeviceId() {
    let id = localStorage.getItem(DEVICE_ID_KEY) || localStorage.getItem('swag-ff-device_id');
    if (!id) {
        id = 'dev-' + Math.random().toString(36).slice(2, 10);
        localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
}

function savePlayResult(json, name, deviceId) {
    const data = json.result === 'win'
        ? { result: 'win', claimCode: json.claimCode, name, deviceId }
        : { result: 'lose', name, deviceId };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
}

function restorePreviousPlay() {
    if (!GAME_ACTIVE) {
        elements.directions.style.display = 'none';
    
        elements.nameContainer.innerHTML = `<div style="padding:12px;margin-bottom:10px;background:#F0F4F5;border-radius:8px;color:#111">Sorry, this experience is no longer available. 💔</div>`;
        elements.result.style.display = 'none';
    
        return;
    }

    const data = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    if (!data) return;

    elements.directions.style.display = 'none';

    let msg = data.result === 'win'
        ? `You already played on this device, <b>${data.name}</b>.<br>🎉 <b>You WON! Your code:</b> <code style="background:#fff;padding:2px 6px;color:#111">${data.claimCode}</code>`
        : `You already played on this device, <b>${data.name}</b>.<br>😅 <b>You did not win this time.</b>`;

    elements.nameContainer.innerHTML = `<div style="padding:12px;margin-bottom:10px;background:#F0F4F5;border-radius:8px;color:#111">${msg}</div>`;
    elements.result.style.display = 'none';
}

function lockInputs(state) {
    elements.playButton.disabled = state;
    elements.firstName.disabled = state;
    elements.lastInitial.disabled = state;
}

function resetInputs() {
    lockInputs(false);
    elements.firstName.value = '';
    elements.lastInitial.value = '';
    elements.result.innerHTML = 'Double check your name before playing.';
}

function unlockAfterError(msg) {
    elements.result.innerHTML = msg;
    lockInputs(false);
}

function setResultRow(html, row = false) {
    elements.result.style.flexDirection = row ? 'row' : 'column';
    elements.result.innerHTML = html;
}

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getSpinMessage(angle) {
    return {
        '0': '🏹 Uh oh, Cupid\'s arrow broke mid-flight!',
        '-107': '🔐 Oh no! The vault jammed when you tried to open it!',
        '50': '💖 Cupid gave you his blessing to unlock the vault!',
        '100': '🎯 Cupid shot for the target and nailed it! Yipee!',
        '-55': '✉️ Yay, you found Cupid\'s lost love letter!'
    }[angle] || '_internalError';
}