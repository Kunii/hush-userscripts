// ==UserScript==
// @name         Youtube Vidya Fixer
// @version      1.3
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    "use strict";

    var cSpeed = 1.0;
    var speedIntervalAdjustment = 0.25;
    var lDate = Date.now();
    var divID = "movie_player";
    var videoAttached = false;

    // --- CSS injected once ---
    var css = "#SpeedDisplayThingy div { user-select: none; position: fixed; z-index: 10000; background-color: rgba(0, 0, 0, 0.25); margin: 0 auto; width: 450px; } #SpeedDisplayThingy div div { user-select: none; z-index: 10000; color: #FFF; text-align: center; margin: 0; padding: 0; font-size: 10em; }";

    var styleEl = document.createElement("style");
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    // --- DOM element reused ---
    var container = document.createElement("div");
    var inner = document.createElement("div");
    var textEl = document.createElement("div");
    container.id = "SpeedDisplayThingy";
    inner.appendChild(textEl);
    container.appendChild(inner);
    container.style.display = "none";

    // --- Hide timer ---
    setInterval(function() {
        if (!container.style.display && (Date.now() - lDate >= 500)) {
            container.style.display = "none";
        }
    }, 250);

    function showSpeed() {
        textEl.textContent = cSpeed + "x";
        container.style.display = "";
    }

    function isInputFocused() {
        var tag = document.activeElement.tagName.toLowerCase();
        return tag === "input" || tag === "textarea";
    }

    function attachVideoListeners() {
        if (videoAttached) return;

        var video = document.querySelector("video");
        if (!video) return;

        videoAttached = true;

        // Append display container to player div
        var player = document.getElementById(divID);
        if (player && !document.getElementById("SpeedDisplayThingy")) {
            player.appendChild(container);
        }

        video.addEventListener("progress", function() {
            if (video.playbackRate !== cSpeed) {
                lDate = Date.now();
                showSpeed();
            }
            video.playbackRate = cSpeed;
        });
    }

    // Try immediately
    attachVideoListeners();

    // If video not ready yet, observe DOM for it
    if (!videoAttached) {
        var observer = new MutationObserver(function() {
            if (!videoAttached) {
                attachVideoListeners();
                if (videoAttached) {
                    observer.disconnect();
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Also re-attach on YouTube SPA navigation (page changes without reload)
    var lastLocation = location.href;
    setInterval(function() {
        if (location.href !== lastLocation) {
            lastLocation = location.href;
            videoAttached = false;
            attachVideoListeners();
        }
    }, 1000);

    // --- Keydown handler (works regardless of video state) ---
    document.addEventListener("keydown", function(e) {
        if (!location.href.includes("watch?")) return;
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

        var video = document.querySelector("video");
        if (video) {
            video.playbackRate = cSpeed;
        }
    });
})();
