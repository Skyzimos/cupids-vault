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
    fastflags.js
    ===========

    Vanilla JavaScript is a pain when it comes to working with flags, especially when they need to be global.
    FastFlags fixes this with a few simple tricks:
        - Manages the flags for you, and updates throughout the codebase instantly.
        - For safety throughout the code with one flag used in multiple sections, FastFlags includes "DefineOnce"
        which will only create the flag if it doesn't exist.
        - Easily enable, disable, and toggle (switch boolean to opposite value) the flag.
        - Includes optional metadata; useful for keeping track of which flags do what within the code.
    
    ===========

    Dependencies:
        scripts/ - Used to access the utilities.

    Created: 2025-07-14
    Last Updated: 2026-02-05


*/

/*---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/


/* -+-+-+- VARIABLES -+-+-+- */
window.FastFlags = {};

/*---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/


/* -+-+-+- INTERNAL FUNCTIONS -+-+-+- */
window.FFlags = (() => {
    const StorageKey = 'FastFlagsSession';

    const SessionCache = (() => {
        try {
            return JSON.parse(sessionStorage.getItem(StorageKey)) || {};
        } catch {
            return {};
        }
    })();

    const SaveSession = () => {
        sessionStorage.setItem(StorageKey, JSON.stringify(SessionCache));
    };

    return {
        Define: (Name, DefaultValue = false, Metadata = {}) => {
            const SessionValue = SessionCache[Name];
            const FinalValue = SessionValue !== undefined ? SessionValue : DefaultValue;

            FastFlags[Name] = {
                Value: FinalValue,
                Meta: Metadata,
            };

            return FastFlags[Name].Value;
        },

        DefineOnce: (Name, DefaultValue = false, Metadata = {}) => {
            if (!(Name in FastFlags)) {
                const SessionValue = SessionCache[Name];
                const FinalValue = Metadata.Overwrite && Metadata.Overwrite == false && SessionValue !== undefined ? SessionValue : DefaultValue;

                FastFlags[Name] = {
                    Value: FinalValue,
                    Meta: Metadata,
                };
            }

            return FastFlags[Name].Value;
        },

        Enable: (Name) => {
            if (FastFlags[Name]) {
                FastFlags[Name].Value = true;
                SessionCache[Name] = true;
                SaveSession();
            }
        },

        Disable: (Name) => {
            if (FastFlags[Name]) {
                FastFlags[Name].Value = false;
                SessionCache[Name] = false;
                SaveSession();
            }
        },

        Toggle: (Name) => {
            if (FastFlags[Name]) {
                const NewValue = !FastFlags[Name].Value;
                FastFlags[Name].Value = NewValue;
                SessionCache[Name] = NewValue;
                SaveSession();
            }
        },

        Is: (Name) => !!FastFlags[Name]?.Value,

        Get: (Name) => FastFlags[Name] ?? null,

        GetMeta: (Name) => FastFlags[Name]?.Meta ?? {},

        GetValue: (Name) => FastFlags[Name]?.Value,

        SetValue: (Name, Value) => {
            if (FastFlags[Name]) {
                FastFlags[Name].Value = Value;
                SessionCache[Name] = Value;
                SaveSession();
            }
        },

        Update: (Name, { Value, Meta } = {}) => {
            if (!FastFlags[Name]) return;
            if (Value !== undefined) {
                FastFlags[Name].Value = Value;
                SessionCache[Name] = Value;
                SaveSession();
            }
            if (Meta) {
                FastFlags[Name].Meta = { ...FastFlags[Name].Meta, ...Meta };
            }
        },

        GetAll: () => Object.fromEntries(
            Object.entries(FastFlags).map(([Name, Data]) => [Name, Data.Value])
        ),

        ClearSession: () => {
            sessionStorage.removeItem(StorageKey);
        }
    };
})();