export const toggleTooltip = function (activeTooltip) {
    document.querySelectorAll('.tooltip').forEach(function (tooltip) {
        tooltip.classList.remove('active');
    });

    if (activeTooltip) {
        activeTooltip.classList.add('active');
        document.getElementById('tooltips').classList.add('tooltip-open');
    } else {
        document.getElementById('tooltips').classList.remove('tooltip-open');
    }
}

export default () => {
    var uiTooltips = document.getElementById('tooltips');

    if (uiTooltips) {
        uiTooltips.addEventListener('click', function (e) {
            if (e.target.matches('.tooltip-close')) {
                selectedTooltip = null;
                toggleTooltip(null);
            }
        });
    }
}
