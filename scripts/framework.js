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
	framework.js
	===========

    Working with as many different modules as Home requires is difficult across-scripts. To combat this,
    I developed this custom web framework that allows every script to communicate and share with each other.
        - Efficient with client memory.
        - Add new modules incredibly easily.
        - Includes a built-in messaging/event system.
        - Each module can dip into another module's methods. (e.g., UI needs Hue's cache, so it simply calls Hue.GetCache() from the framework.)

    Just include a script tag for each module you need! [ Core modules are always required to be loaded. ]
    
    ===========

    Dependencies:
        scripts/ - Used to register each module to the global framework.

    Created: 2025-07-12
    Last Updated: 2025-07-12


*/

/*---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

window.Framework = window.Framework || {
    eventstream: {
        listeners: {},
        on(Event, Callback) {
            this.listeners[Event] = this.listeners[Event] || [];
            this.listeners[Event].push(Callback);
        },
        emit(Event, Data) {
            (this.listeners[Event] || []).forEach(Callback => Callback(Data));
        }
    },

    modules: {},
    state: {},

    register(Name, Module) {
        this.modules[Name] = Module;
    },
    get(Name) {
        return this.modules[Name];
    },
};