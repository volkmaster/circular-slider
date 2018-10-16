/**
 * Class for drawing responsive circular sliders on the SVG container.
 * @param options   an object containing circular slider properties
 */
function CircularSlider(options) {
    /**
     * Class variables.
     * Read variable values from options.
     */
    const container = options['container'];
    const color = options['color'];
    const min = options['min'];
    const max = options['max'];
    const step = options['step'];
    let radius = options['radius'];

    /**
     * Area and scale calculations.
     * Determine width and height available for drawing.
     * Specify slider area drawing dimensions and data drawing dimensions.
     * If area dedicated for data drawing would be too small, then draw dimensions
     * as well as some slider options are rescaled.
     */
    const containerWidth = container.clientWidth || container.parentNode.clientWidth;
    const containerHeight = container.clientHeight || container.parentNode.clientHeight;
    const windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const width = containerWidth < windowWidth ? containerWidth : windowWidth;
    const height = containerHeight < windowHeight ? containerHeight : windowHeight;

    let drawWidth, drawHeight, dataWidth, dataHeight;
    let scale = 1.0;
    let portrait;

    if (width >= height) {
        portrait = false;
        if (height / width <= 0.8) {
            drawWidth = height;
            drawHeight = height;
            dataWidth = width - drawWidth;
            dataHeight = height;
        } else {
            drawWidth = height * 0.8;
            drawHeight = height * 0.8;
            dataWidth = width - drawWidth;
            dataHeight = drawHeight;
            radius *= 0.8;
            scale = 0.8;
        }
    } else {
        portrait = true;
        if (width / height <= 0.8) {
            drawWidth = width;
            drawHeight = width;
            dataWidth = width;
            dataHeight = height - drawHeight;
        } else {
            drawWidth = width * 0.8;
            drawHeight = width * 0.8;
            dataWidth = drawWidth;
            dataHeight = height - drawHeight;
            radius *= 0.8;
            scale = 0.8;
        }
    }

    /**
     * Helper functions.
     */
    function radiansToDegress(rad) {
        return rad / Math.PI * 180;
    }

    function degreesToRadians(deg) {
        return deg * Math.PI / 180;
    }

    function polarToCartesian(deg) {
        return {
            'x': cx - (radius * Math.cos(degreesToRadians(deg + 90))),
            'y': cy - (radius * Math.sin(degreesToRadians(deg + 90)))
        }
    }

    /**
     * Draw inner, outer and handler circle.
     * Inner circle is underlying circle with gray stroke.
     * Outer circle is the front circle (SVG path element) with stroke of the specified color in options,
     * which represents the current actual value of the slider.
     * Handler circle is placed at the current position of the outer circle offset
     * and has mousedown and touchstart event listeners bound to it.
     * Value (offset) of the outer circle (and handler position) is initialized
     * with a random value.
     */
    const cx = drawWidth / 2;
    const cy = drawHeight / 2;
    const startOffset = Math.random() * 360;
    const minOffset = 0;
    const maxOffset = 359;
    const minPos = polarToCartesian(minOffset);
    const maxPos = polarToCartesian(maxOffset);

    const innerCircle = new SVGElement('circle', {
        'cx': cx,
        'cy': cy,
        'r': radius,
        'fill': 'none',
        'stroke': 'lightgray',
        'stroke-width': 25 * scale,
        'stroke-dasharray': '8 1',
        'stroke-dashoffset': '0'
    });
    container.appendChild(innerCircle.element());

    const startPos = polarToCartesian(startOffset);
    const largeArcSweep = startOffset <= 180 ? '0' : '1';
    const outerCircle = new SVGElement('path', {
        'fill': 'none',
        'stroke': color,
        'stroke-width': 25 * scale,
        'd': ['M', cx, cy - radius,
              'A', radius, radius, 0, largeArcSweep, 1, startPos['x'], startPos['y']].join(' ')
    });
    container.appendChild(outerCircle.element());

    const handler = new SVGElement('circle', {
        'cx': startPos['x'],
        'cy': startPos['y'],
        'r': 20 * scale,
        'fill': 'white',
        'stroke': 'gray',
        'stroke-width': 2
    });
    container.appendChild(handler.element());

    /**
     * Data calculations and update logic.
     * Calculate number of bins and actual bin borders.
     * Find the correct bin according to the current offset value and update the data (SVG text element).
     */
    const nBins = (max - min) / step + 1;
    const bins = [];
    for (let i = 0; i < nBins; i++) {
        bins.push(i * step + min);
    }

    function findBin(ratio) {
        const val = ratio * (max - min) + min;
        for (let i = 1; i <= nBins; i++) {
            if (val < bins[i]) {
                return bins[i - 1];
            }
        }
    }

    function updateData(offset) {
        switch (offset) {
            case minOffset:
                text.element().textContent = min;
                break;
            case maxOffset:
                text.element().textContent = max;
                break;
            default:
                text.element().textContent = findBin(offset / 360);
        }
    }

    /**
     * Draw data elements.
     * Data elements are placed in a SVG group with an id 'dataPlaceholder'.
     * When the first slider is created the placeholder is created and
     * appended to the container. In further iterations, just a reference to the
     * placeholder is obtained (it is not recreated).
     * Elements appended to the placeholder are SVG groups which consist of
     * small colored rectangles and a text element (used for displaying the bin).
     */
    let placeholder = container.getElementById('dataPlaceholder');
    if (placeholder === null) {
        placeholder = new SVGElement('g', {
            'id': 'dataPlaceholder',
            'transform': 'translate(' + (portrait ? 0 : drawWidth) + ' '
                                      + (portrait ? drawHeight : (0.1 * dataHeight)) + ')'
        }).element();
        container.appendChild(placeholder);
    }

    const counter = placeholder.getElementsByTagName('g').length;
    const g = new SVGElement('g', {
        'transform': 'translate(' + (portrait ? (0.4 * dataWidth) : (0.05 * dataWidth)) + ' '
                                  + (portrait ? (counter * 0.15 * dataHeight) : (counter * 0.1 * dataHeight)) + ')'
    });
    placeholder.appendChild(g.element());

    const rect = new SVGElement('rect', {
        'width': portrait ? (0.05 * dataWidth) : (0.05 * dataHeight),
        'height': portrait ? (0.05 * dataWidth) : (0.05 * dataHeight),
        'fill': color,
    });
    g.appendChild(rect.element());

    const text = new SVGElement('text', {
        'x': portrait ? (0.1 * dataWidth) : (0.1 * dataHeight),
        'y': portrait ? (0.04 * dataWidth) : (0.04 * dataHeight),
        'fill': 'black',
        'font-size': '16px',
        'font-family': 'Verdana'
    });
    g.appendChild(text.element());

    updateData(startOffset);

    /**
     * Setup event listeners.
     * Handler circle element is bound with 'mousedown' and 'touchstart' event listeners.
     * They both prevent default behavior of the event (such as scrolling and text highlighting of other elements in the
     * container while moving a finger on a mobile device), as well as add 'mousemove'/'touchmove' event listeners to
     * the window element, so that if handler loses focus sliding actually continues.
     * 'touchmove' event listener ignores multi-touch events.
     * 'mouseup'/'touchend' event listeners remove previously added listeners.
     */
    handler.addEventListener('mousedown', mousedown);
    handler.addEventListener('touchstart', touchstart);

    function mousedown(event) {
        event.preventDefault();
        window.addEventListener('mousemove', mousemove);
        window.addEventListener('mouseup', mouseup);
    }

    function touchstart(event) {
        event.preventDefault();
        window.addEventListener('touchmove', touchmove);
        window.addEventListener('touchend', touchend);
    }

    function mousemove(event) {
        event.preventDefault();
        moveHandler(event.clientX, event.clientY);
    }

    function touchmove(event) {
        event.preventDefault();
        // Ignore multi-touch
        if (event.touches.length > 1) {
            return;
        }
        moveHandler(event.touches[0].pageX, event.touches[0].pageY);
    }

    function mouseup(event) {
        event.preventDefault();
        window.removeEventListener('mousemove', mousemove);
        window.removeEventListener('mouseup', mouseup);
    }

    function touchend(event) {
        event.preventDefault();
        window.removeEventListener('touchmove', touchmove);
        window.removeEventListener('touchend', touchend);
    }

    /**
     * Move handler logic.
     * 'moveHandler' function is called from mousemove/touchmove event listeners.
     * It updates the positon of the handler, value (offset) of the outer circle and updates the data.
     * Handler is locked in two different situations:
     *  - when sliding in counterclockwise direction and reaching minimum (top of the circle)
     *  - when sliding in clockwise direction and reaching maximum (top of the circle)
     */
    function setHandlerPosition(centerX, centerY) {
        handler.set('cx', centerX);
        handler.set('cy', centerY);
    }

    function setCircleOffset(x, y) {
        const largeArcSweep = x >= cx ? '0' : '1';
        outerCircle.set(
            'd', [
                'M', cx, cy - radius,
                'A', radius, radius,
                0, largeArcSweep, 1, x, y
            ].join(' ')
        );
    }

    let oldX = cx;
    let oldOffset = startOffset;
    function moveHandler(x, y) {
        // calculate new handler position
        const dx = x - cx;
        const dy = y - cy;
        const scale = radius / Math.hypot(dx, dy);
        let newX = dx * scale + cx;
        let newY = dy * scale + cy;
        let offset;

        // handler is locked at min or max position
        if ((oldOffset === minOffset && newX < oldX) || (oldOffset === maxOffset && newX > oldX)) {
            return;
        }

        // lock handler circle if it reaches min from the anticlockwise direction
        if (oldX > cx && newX <= cx && newY < cy) {
            newX = minPos['x'];
            newY = minPos['y'];
            offset = minOffset;
        }
        // lock handler circle if it reaches max from the clockwise direction
        else if (oldX < cx && newX >= cx && newY < cy) {
            newX = maxPos['x'];
            newY = maxPos['y'];
            offset = maxOffset;
        }
        // otherwise
        else {
            // calculate offset (between 0 and 360 degrees)
            let fi = Math.atan(dx / -dy);
            if (y >= cy)
                fi += Math.PI;
            else if (x <= cx && y <= cy)
                fi += 2 * Math.PI;
            offset = radiansToDegress(fi);

            // save current x coordinate
            oldX = newX;
        }

        // save current offset
        oldOffset = offset;

        // set new handler circle position
        setHandlerPosition(newX, newY);

        // change outer circle offset
        setCircleOffset(newX, newY);

        // update data panel
        updateData(offset);
    }
}

/**
 * Helper class for creating and manipulating SVG elements.
 * @param type      SVG element type
 * @param options   an object of element attributes
 */
function SVGElement(type, options) {
    this.create = function(type) {
        this.elem = document.createElementNS('http://www.w3.org/2000/svg', type);
    };
    this.get = function(key) {
        return this.elem.getAttributeNS(null, key);
    };
    this.set = function(key, val) {
        this.elem.setAttributeNS(null, key, val);
    };
    this.setBulk = function(options) {
        for (let key in options) {
            if (options.hasOwnProperty(key)) {
                this.set(key, options[key]);
            }
        }
    };
    this.addClass = function(cls) {
        this.elem.classList.add(cls);
    };
    this.removeClass = function(cls) {
        this.elem.classList.remove(cls);
    };
    this.addEventListener = function(type, func) {
        this.elem.addEventListener(type, func);
    };
    this.removeEventListener = function(type, func) {
        this.elem.removeEventListener(type, func);
    };
    this.appendChild = function(child) {
        this.elem.appendChild(child);
    };
    this.removeChild = function(child) {
        this.elem.removeChild(child);
    };
    this.element = function() {
        return this.elem;
    };

    this.create(type);
    if (options !== null) {
        this.setBulk(options);
    }
}
