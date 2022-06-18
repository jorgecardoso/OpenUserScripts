// ==UserScript==
// @name         CSS Selectors Sandbox
// @namespace    http://jorgecardoso.eu
// @version      0.45
// @description  Shows a list of CSS selectors and allows you to test any selector on any site.
// @author       jorgecardoso
// @match        *://*/*
// @noframes
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @resource     style  https://cssselectorsdemo.jorgecardoso.repl.co/selectorsmenu.css
// @resource     html   https://cssselectorsdemo.jorgecardoso.repl.co/selectorsmenu.html
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_log
// @license 	 MIT
// @updateURL https://openuserjs.org/meta/jorgecardoso/CSS_Selectors_Sandbox.meta.js
// @downloadURL https://openuserjs.org/install/jorgecardoso/CSS_Selectors_Sandbox.user.js
// @copyright 2022, jorgecardoso (https://openuserjs.org/users/jorgecardoso)
// ==/UserScript==


(function() {
    'use strict';
    let open = false;
    let injectedStyle = null;
    let windowObjectReference = null;
    let openMenuCommand = null;
    let closeMenuCommand = null;

    registerOpen();

    function registerOpen() {
        openMenuCommand = GM_registerMenuCommand("Open CSS Selectors Menu", openCSSSelectorsMenu, "o");
        GM_log("registered open menu command: ", openMenuCommand);
    }

    function registerClose() {
        closeMenuCommand = GM_registerMenuCommand("Close CSS Selectors Menu", closeCSSSelectorsMenu, "c");
        GM_log("registered close menu command: ", closeMenuCommand);
    }

    function unregisterOpen() {
        GM_unregisterMenuCommand(openMenuCommand);
    }

    function unregisterClose() {
        GM_unregisterMenuCommand(closeMenuCommand);
    }


    function openCSSSelectorsMenu() {
        if (open) return;
        open = true;
        GM_log("Opening CSS Selectors Menu");

        injectedStyle = GM_addStyle(GM_getResourceText("style"));

        let windowFeatures = "popup,width=300,height=600";
        windowObjectReference = window.open("https://cssselectorsdemo.jorgecardoso.repl.co/selectorsmenu.html", "popup", windowFeatures);

        GM_log(openMenuCommand);
        unregisterOpen();
        registerClose();
    }

    function closeCSSSelectorsMenu() {
        if (!open) return;
        open = false;
        GM_log("Closing CSS Selectors Menu");
        //GM_log(in
        windowObjectReference.close();
        $(injectedStyle).remove();

        unregisterClose();
        registerOpen();
    }


    function highlight(selection) {
        console.log("Highlighting: " + selection);
        var $jquerySelection;
        if (! (selection instanceof jQuery) ) {
            $jquerySelection = $(selection);
        } else {
            $jquerySelection = selection;
        }
        //console.log($jquerySelection);

        $("*").removeClass("marching-ants marching");

        $jquerySelection.addClass("marching-ants marching");
    }

    window.addEventListener("message", (event) => {
        if (event.origin !== "https://cssselectorsdemo.jorgecardoso.repl.co")
            return;
        GM_log(event);

        switch (event.data) {
            case "window closing":
                closeCSSSelectorsMenu();
                break;
            default:
                highlight(event.data);
        }
    }, false);
})();