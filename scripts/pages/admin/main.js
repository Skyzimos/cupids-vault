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

    Created: 2026-02-06
    Last Updated: 2026-02-06


*/

/*---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

/* -----------------------------
       CONFIG & CONSTANTS
----------------------------- */
const Fetch = Framework.get('Fetch');

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyK5Ofze2z0RoVTAm8wSC3fQ335YDnrrEkllraEcxn4WQ4Pp7Eg1PBpxdpYbDA58nfHEQ/exec';

/* -----------------------------
        DOM REFERENCES
----------------------------- */
const elements = {
    background: document.querySelector('.background'),
    directions: document.querySelector('._directions'),
    nameContainer: document.getElementById('_contentNameContainer'),
    username: document.getElementById('input_firstName'),
    password: document.getElementById('input_lastInitial'),
    verifyCridentials: document.getElementById('_verifyCridentialsButton'),
};

/* -----------------------------
       STATE MANAGEMENT
----------------------------- */
let cridentials = ``;

/* -----------------------------
        INITIALIZATION
----------------------------- */
attachEvents();

/* -----------------------------
        EVENT BINDINGS
----------------------------- */
function attachEvents() {
    elements.verifyCridentials.addEventListener('click', checkCridentials);
}

/* -----------------------------
           PANEL FLOW
----------------------------- */
function recreateNode(el, withChildren = false) {
    if (withChildren) {
      el.parentNode.replaceChild(el.cloneNode(true), el);
    }
    else {
      var newEl = el.cloneNode(false);
      while (el.hasChildNodes()) newEl.appendChild(el.firstChild);
      el.parentNode.replaceChild(newEl, el);
      return newEl;
    }
  }
  
function checkCridentials() {
    if (`${elements.username.value.trim()}${elements.password.value.trim()}` == 'Skyzimos1464') {
        console.log(`${elements.username.value.trim()}${elements.password.value.trim()}`)
        elements.directions.innerHTML = 'Please enter the name of the user you want to delete.'

        const node = recreateNode(elements.verifyCridentials);
        elements.verifyCridentials = node;
        elements.verifyCridentials.addEventListener('click', deleteUser);    
    }
}

async function deleteUser() {
    const params = new URLSearchParams({ action: 'delete', name, cridentials: `${elements.username.value.trim()} ${elements.password.value.trim()}` });
    const json = await Fetch.post(APPS_SCRIPT_URL, params);

    console.log(json)
}

(async () => {
    const json = await Fetch.get(APPS_SCRIPT_URL);
    document.querySelector('.plays').innerHTML = json.plays;
})();
