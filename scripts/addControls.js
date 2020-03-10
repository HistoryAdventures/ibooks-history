import * as TWEEN from '@scripts/js/tween';
import { toggleTooltip } from '@scripts/tooltips';

function setupTween(target) {
    new TWEEN.Tween(camera.position)
        .to(target, 1100)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(function () {
            controls.target.set(0, 1, 0);
            controls.update();
        })
        .start();
}

export const addControls = () => {
    var tooltips = document.querySelectorAll('.tooltip');
    var tooltipsCount = tooltips.length;
    document.getElementById('controls').style.display = 'block';

    document.getElementById('next').addEventListener('click', function (e) {
        e.preventDefault();
        var currentOrder = document.getElementById(controlsSelectedTooltip);
        var nextTooltip;
        if (currentOrder) {
            nextTooltip = (parseInt(currentOrder.getAttribute('data-order')) - 1);
            if (nextTooltip > 0) {
                updateTooltip(document.querySelector(`[data-order="${nextTooltip}"]`).id);
                controlsSelectedTooltip = document.querySelector(`[data-order="${nextTooltip}"]`).id;
                setupTween(cameraTargets[controlsSelectedTooltip]);
                return;
            }
        }

        updateTooltip(document.querySelector(`[data-order="${tooltipsCount}"]`).id);
        controlsSelectedTooltip = document.querySelector(`[data-order="${tooltipsCount}"]`).id;
        setupTween(cameraTargets[controlsSelectedTooltip]);
    });

    document.getElementById('prev').addEventListener('click', function (e) {
        e.preventDefault();
        var currentOrder = document.getElementById(controlsSelectedTooltip);
        var nextTooltip;
        if (currentOrder) {
            nextTooltip = (parseInt(currentOrder.getAttribute('data-order'))) % tooltipsCount + 1;
            updateTooltip(document.querySelector(`[data-order="${nextTooltip}"]`).id);
            controlsSelectedTooltip = document.querySelector(`[data-order="${nextTooltip}"]`).id;
            setupTween(cameraTargets[controlsSelectedTooltip]);
        } else {
            updateTooltip(document.querySelector(`[data-order="1"]`).id);
            controlsSelectedTooltip = document.querySelector(`[data-order="1"]`).id;
            setupTween(cameraTargets[controlsSelectedTooltip]);
        }
    });
}

function updateTooltip(tooltipId) {
    var tooltip = document.getElementById(tooltipId);
    toggleTooltip(tooltip);
}
