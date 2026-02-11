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
    framework/modules/core/fetch.js
    ===========

    Vanilla JavaScript uses the fetch method to access API endpoints. However, fetch has both
    an incredibly confusing API, and without proper error handling, breaks randomly. This fetch
    wrapper aims to fix this by doing the following: 
        - Turns the fetch API into 4 quick and easy methods; "get", "post", "put", and "delete".
        - Automatically parses responses, improving code readability.
        - Handles errors gracefully, so the rest of the code never breaks.
    
    ===========

    Dependencies:
        scripts/ - Used to access the utilities.

    Created: 2025-09-06
    Last Updated: 2026-02-05


*/

/*---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

/* -+-+-+- MAIN -+-+-+- */
async function Request(Method, URL, Data = null, Options = {}) {
    const Configuration = {
        method: Method,
        headers: {
            //'Content-Type': 'application/json',
            ...(Options.headers || {})
        },
        ...Options
    };

    if (Data) Configuration.body = Data;

    console.log(Configuration)

    try {
        const Response = await fetch(URL, Configuration);
        const ContentType = Response.headers.get('content-type') || '';
        let Parsed;

        if (ContentType.includes('application/json')) {
            Parsed = await Response.json();
        } else {
            Parsed = await Response.text();
        }

        if (!Response.ok) {
            throw new Error(`API error: ${Response.status} ${Response.statusText}`);
        }

        Framework.eventstream.emit('api:response', { Method, URL, Data: Parsed });
        return Parsed;
    } catch (Error) {
        Framework.eventstream.emit('api:error', { Method, URL, Error: Error });
        throw Error;
    }
}


/* -+-+-+- REGISTER -+-+-+- */
Framework.register('Fetch', {
    get(URL, Options) {
        return Request('GET', URL, null, Options);
    },
    post(URL, Data, Options) {
        return Request('POST', URL, Data, Options);
    },
    put(URL, Data, Options) {
        return Request('PUT', URL, Data, Options);
    },
    delete(URL, Options) {
        return Request('DELETE', URL, null, Options);
    }
})