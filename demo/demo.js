document.addEventListener('DOMContentLoaded', function (event) {
    const container = document.getElementById('container');

    new CircularSlider({
        'container': container,
        'color': '#c0392b',
        'min': 500,
        'max': 1000,
        'step': 5,
        'radius': 40
    });

    new CircularSlider({
        'container': container,
        'color': '#d35400',
        'min': 5000,
        'max': 10000,
        'step': 100,
        'radius': 80
    });

    new CircularSlider({
        'container': container,
        'color': '#e67e22',
        'min': 100,
        'max': 6000,
        'step': 50,
        'radius': 120
    });

    new CircularSlider({
        'container': container,
        'color': '#f1c40f',
        'min': 0,
        'max': 360,
        'step': 36,
        'radius': 160
    });
})
