define([
    'require',
    'jquery',
    'base/js/namespace',
], function (
    requirejs,
    $,
    Jupyter,
) {
    "use strict";

    // define default values for config parameters
    // [mode]: use Dark Mode? 0-no. 1-yes. If follow_system == 1, will be automatically be assigned the system preference.
    // [follow_system]: follow system's Dark Mode preference? 0-Nope, 1-yes.
    var params = {
        mode: 0,
        follow_system: 1,
    };

    var hasDarkmodeCss = function () {
        var link = document.getElementById('darkmode-stylesheet');
        if (link && link.tagName == 'LINK') {
            return true
        }
    }

    var addDarkmodeCss = function () {
        // add our extension's css to the page
        $('<link/>')
            .attr({
                rel: 'stylesheet',
                type: 'text/css',
                id: 'darkmode-stylesheet',
                href: requirejs.toUrl('./darkmode.css')
            })
            .appendTo('head');
    }

    var removeDarkmodeCss = function () {
        var link = document.getElementById('darkmode-stylesheet');
        if (link && link.tagName == 'LINK') {
            link.parentNode.removeChild(link);
        }
    }
    var setDarkMode = function (flag) {
        params.mode = flag
        if (flag == 1) {
            // enable dark mode
            if (!hasDarkmodeCss()) addDarkmodeCss()

        }
        else {
            // disable dark mode
            if (hasDarkmodeCss()) removeDarkmodeCss()
        }
    }

    // regularly apply latest Dark Mode settings
    setInterval(() => {
        if (params.follow_system == 1) {
            var sys_mode = window.matchMedia("(prefers-color-scheme: dark)").matches;
            setDarkMode(sys_mode)
        }
    }, 1000);

    var initialize = function () {
        // update params with any specified in the server's config file.
        // the "darkmode" value of the Jupyter notebook config's
        // data may be undefined, but that's ok when using JQuery's extend
        $.extend(true, params, Jupyter.notebook.config.darkmode);

        // add a menu item for Dark Mode under the View menu
        var el = $("ul[aria-labelledby='viewlink']")

        var submenu = $('<ul class="dropdown-menu" id="darkmode-toolbar-submenu">')
            .append($('<li data-name="Follow System"><a href="#">Follow System</a></li>').on("click", function () { params.follow_system = 1; }))
            .append($('<li data-name="Light"><a href="#">Light</a></li>').on("click", function () { params.follow_system = 0; setDarkMode(0) }))
            .append($('<li data-name="Dark"><a href="#">Dark</a></li>').on("click", function () { params.follow_system = 0; setDarkMode(1) }))

        var menuitem = $("<li id='darkmode-toolbar'/>").addClass("dropdown-submenu").append(
            $('<a href="#" role="menuitem" aria-haspopup="true" aria-expanded="false" class="dropdown-toggle" data-toggle="dropdown">Dark Mode</a>')
        ).append(submenu)
        el.append(menuitem)

    };

    var load_ipython_extension = function () {
        return Jupyter.notebook.config.loaded.then(initialize);
    };

    // return object to export public methods
    return {
        load_ipython_extension: load_ipython_extension
    };
});