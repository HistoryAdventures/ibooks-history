import * as THREE from '@scripts/build/three.module.js';
import { toggleTooltip } from '@scripts/tooltips';
var touchStartFresh = false;
var mouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();

function onDocumentClick(event) {
    if (event.target.matches('.tooltip') || event.target.closest('.tooltip')) {
        return;
    }

    if (event.target.matches('.controls') ||
        event.target.closest('.controls')
    ) {
        return;
    }

    selectedTooltip = getIntersects(event);

    var activeTooltip = document.getElementById(selectedTooltip);
    toggleTooltip(activeTooltip);

    if (selectedTooltip) {
        controlsSelectedTooltip = selectedTooltip;
    }
}

function getIntersects(event) {
    let clientX;
    let clientY;
    if (('ontouchstart' in window) || window.TouchEvent || window.DocumentTouch && document instanceof DocumentTouch) {
        clientX = event.changedTouches ? event.changedTouches[0].clientX : event.clientX;
        clientY = event.changedTouches ? event.changedTouches[0].clientY : event.clientY;
        mouse.x = (clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (clientY / window.innerHeight) * 2 + 1;
    } else {
        if (event.srcEvent) {
            mouse.x = (event.srcEvent.clientX / window.innerWidth) * 2 - 1;
            mouse.y = - (event.srcEvent.clientY / window.innerHeight) * 2 + 1;
        } else {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
        }
    }

    raycaster.setFromCamera(mouse, window.camera);

    var interStack = [];

    hotspots.forEach(function (hotspot) {
        var inter = raycaster.intersectObject(hotspot, true);
        if (inter.length) {
            interStack = interStack.concat(inter);

            // play document sound
            if (audioLib && audioLib.hotspots && !audioLib.mute &&
                (inter[0].object.name.indexOf('hotspot') > -1) ||
                (inter[0].object.name.indexOf('Opium') > -1)
            ) {
                muteAllHotspots();
                audioLib.hotspots[inter[0].object.name] && audioLib.hotspots[inter[0].object.name].play();
            }

            if (audioLib && audioLib.papers && audioLib.papers.length && !audioLib.mute) {
                muteAllPapers();
                let newAudioIndex = Math.floor(Math.random() * 4);
                while (newAudioIndex === audioLib.lastPlayedPaperIndex) {
                    newAudioIndex = Math.floor(Math.random() * 4);
                }
                audioLib.lastPlayedPaperIndex = newAudioIndex;
                audioLib.papers[newAudioIndex].play();
            }
        }
    });

    if (interStack.length && interStack[0].object.name.indexOf('Opium') > -1) {
        return 'hotspot-opium1';
    }

    if (interStack.length && interStack[0].object.name.indexOf('hotspot-mirror') > -1) {
        return 'hotspot-mirror-back';
    }

    if (interStack.length && interStack[0].object.name !== 'Table') {
        return interStack[0].object.name || (interStack[0].object.parent && interStack[0].object.parent.name);
    }

    return null;
}

function muteAllPapers() {
    if (audioLib && audioLib.papers.length) {
        audioLib.papers.forEach((audio) => {
            audio.pause();
            audio.currentTime = 0;
        });
    }
}

function muteAllHotspots() {
    if (audioLib && audioLib.hotspots.length) {
        Object.keys(audioLib.hotspots).forEach((key) => {
            audioLib.hotspots[key].pause();
            audioLib.hotspots[key].currentTime = 0;
        });
    }
}

export const addEvents = () => {
    if (('ontouchstart' in window) || window.TouchEvent || window.DocumentTouch && document instanceof DocumentTouch) {
        window.addEventListener('touchstart', () => {
            touchStartFresh = true;

            setTimeout(() => {
                touchStartFresh = false;
            }, 200);
        });

        window.addEventListener('touchend', (ev) => {
            if (touchStartFresh) {
                onDocumentClick(ev);
            }
        });

        window.addEventListener('touchcancel', () => {
            touchStartFresh = false;
        });
    } else {
        window.addEventListener('click', (ev) => {
            onDocumentClick(ev);
        });
    }

    window.addEventListener('click', (ev) => {
        if (!ev.target.closest('.controls')) {
            onDocumentClick(ev);
        }
    });
}
