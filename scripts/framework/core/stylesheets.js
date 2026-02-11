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
    framework/modules/core/stylesheets.js
    ===========

    Working with stylesheets sucks. They look clunky at the top of the code, you never know
    how to load them, and if you load them dynamically, they don't immediately load.

    By some miracle, through this code, I have been able to do the following:
        - Load the stylesheets dynamically, in parallel, at run time;
        - Clean up the style links into one simple json array;
        - Preload important assets to prevent an "unprofessional" look caused by long loading times.
    
    ===========

    Dependencies:
        scripts/ - Used to access the utilities.

    Created: 2026-02-05
    Last Updated: 2026-02-05


*/

/*---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

const loadedStyles = new Set();

function loadStylesheetOnce(href) {
    if (loadedStyles.has(href)) return;
    loadedStyles.add(href);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

function preloadImage(src) {
    const img = new Image();
    img.src = src;
}

preloadImage('/cupids-vault/media/background/background.jpg');
JSON.parse(
    document.getElementById("_styles").textContent
).forEach(loadStylesheetOnce);