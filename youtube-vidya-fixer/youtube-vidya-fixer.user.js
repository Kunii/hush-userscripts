// ==UserScript==
// @name         Youtube Vidya Fixer
// @version      1.2
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    "use strict";

    var cSpeed = 1.0;
    var speedIntervalAdjustment = 0.5;
    var lDate = Date.now();
    var divID = "movie_player";

    var video = document.querySelector("video");
    if (!video) return;

    // --- CSS injected once, not on every speed change ---
    var css = "#SpeedDisplayThingy div { user-select: none; position: fixed; z-index: 10000; background-color: rgba(0, 0, 0, 0.25); margin: 0 auto; width: 450px; } #SpeedDisplayThingy div div { user-select: none; z-index: 10000; color: #FFF; text-align: center; margin: 0; padding: 0; font-size: 10em; }";

    var styleEl = document.createElement("style");
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    // --- DOM element reused, not recreated ---
    var container = document.createElement("div");
    var inner = document.createElement("div");
    var textEl = document.createElement("div");
    container.id = "SpeedDisplayThingy";
    inner.appendChild(textEl);
    container.appendChild(inner);
    container.style.display = "none";
    document.getElementById(divID).appendChild(container);

    // --- Destroy timer only while visible ---
    setInterval(function() {
        if (!container.style.display && (Date.now() - lDate >= 500)) {
            container.style.display = "none";
        }
    }, 250);

    video.addEventListener("progress", function() {
        if (video.playbackRate !== cSpeed) {
            lDate = Date.now();
            showSpeed();
        }
        video.playbackRate = cSpeed;
    });

    function showSpeed() {
        textEl.textContent = cSpeed + "x";
        container.style.display = "";
    }

    function isInputFocused() {
        var tag = document.activeElement.tagName.toLowerCase();
        return tag === "input" || tag === "textarea";
    }

    document.addEventListener("keydown", function(e) {
        if (!window.location.href.includes("watch?")) return;
        if (isInputFocused()) return;

        if (e.code === "KeyH") {
            cSpeed += speedIntervalAdjustment;
        } else if (e.code === "KeyG") {
            cSpeed -= speedIntervalAdjustment;
        } else {
            return;
        }

        lDate = Date.now();
        showSpeed();
        video.playbackRate = cSpeed;
    });
})();
