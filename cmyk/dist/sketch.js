/**
 * CMYK.
 * Including module: p5ex (Copyright 2018 FAL, licensed under MIT).
 * Website => https://www.fal-works.com/
 * @copyright 2018 FAL
 * @author FAL <falworks.contact@gmail.com>
 * @version 0.1.0
 * @license CC-BY-SA-3.0
 */

(function () {
'use strict';

/**
 * Spatial region.
 */
class Region {
}
/**
 * Rectangle-shaped spatial region.
 */
class RectangleRegion extends Region {
    get width() { return this.rightPositionX - this.leftPositionX; }
    get height() { return this.bottomPositionY - this.topPositionY; }
    get area() { return this.width * this.height; }
    constructor(x1, y1, x2, y2, margin = 0) {
        super();
        this.leftPositionX = x1 - margin;
        this.topPositionY = y1 - margin;
        this.rightPositionX = x2 + margin;
        this.bottomPositionY = y2 + margin;
    }
    contains(position, margin = 0) {
        return (position.x >= this.leftPositionX - margin && position.x <= this.rightPositionX + margin &&
            position.y >= this.topPositionY - margin && position.y <= this.bottomPositionY + margin);
    }
    constrain(position, margin = 0) {
        if (position.x < this.leftPositionX - margin)
            position.x = this.leftPositionX - margin;
        else if (position.x > this.rightPositionX + margin)
            position.x = this.rightPositionX + margin;
        if (position.y < this.topPositionY - margin)
            position.y = this.topPositionY - margin;
        else if (position.y > this.bottomPositionY + margin)
            position.y = this.bottomPositionY + margin;
    }
}
// default region -> add

/**
 * (To be filled)
 * @hideConstructor
 */
class ScalableCanvas {
    constructor(p5Instance, parameter, node, rendererType) {
        this.p = p5Instance;
        this.canvasElement = p5Instance.createCanvas(parameter.scaledWidth, parameter.scaledHeight, rendererType);
        if (this.canvasElement && 'parent' in this.canvasElement) {
            this.canvasElement.parent(node);
        }
        this.region = new RectangleRegion(0, 0, 0, 0);
        this.nonScaledShortSideLength = parameter.nonScaledShortSideLength;
        this.updateSize();
    }

    /**
     * (To be filled)
     */
    get scaleFactor() {
        return this._scaleFactor;
    }
    /**
     * (To be filled)
     */
    get nonScaledWidth() {
        return this._nonScaledWidth;
    }
    /**
     * (To be filled)
     */
    get nonScaledHeight() {
        return this._nonScaledHeight;
    }
    /**
     * (To be filled)
     */
    get aspectRatio() {
        return this._aspectRatio;
    }
    /**
     * (To be filled)
     * @param parameter
     */
    resize(parameter) {
        this.p.resizeCanvas(parameter.scaledWidth, parameter.scaledHeight);
        this.nonScaledShortSideLength = parameter.nonScaledShortSideLength;
        this.updateSize();
    }
    /**
     * (To be filled)
     */
    updateSize() {
        const p = this.p;
        this._scaleFactor = Math.min(p.width, p.height) / this.nonScaledShortSideLength;
        this._inversedScaleFactor = 1 / this._scaleFactor;
        this._nonScaledWidth = p.width / this._scaleFactor;
        this._nonScaledHeight = p.height / this._scaleFactor;
        this._aspectRatio = p.width / p.height;
        this.region.rightPositionX = this._nonScaledWidth;
        this.region.bottomPositionY = this._nonScaledHeight;
    }
    /**
     * Runs scale() of the current p5 instance for fitting the sketch to the current canvas.
     * Should be called every frame before drawing objects on the canvas.
     */
    scale() {
        this.p.scale(this._scaleFactor);
    }
    /**
     * Runs scale() with the inversed scale factor.
     */
    cancelScale() {
        this.p.scale(this._inversedScaleFactor);
    }
    /**
     * Converts a length value on the scaled canvas to the non-scaled one.
     * Typically used for interpreting mouseX and mouseY.
     * @param {number} scaledLength - scaled length value
     */
    getNonScaledValueOf(scaledLength) {
        return scaledLength / this._scaleFactor;
    }
}
ScalableCanvas.DUMMY_PARAMETERS = {
    scaledWidth: 100,
    scaledHeight: 100,
    nonScaledShortSideLength: 100,
};

/**
 * (To be filled)
 * (This is not implemented as an enum because it is not supported by rollup)
 */
const ScalableCanvasTypes = {
    SQUARE640x640: 'SQUARE640x640',
    RECT640x480: 'RECT640x480',
    FULL: 'FULL',
    CUSTOM: 'CUSTOM',
};

class NormalColorUnit {
    constructor(p, p5Color) {
        this.p = p;
        this.p5Color = p5Color;
    }
    stroke() {
        this.p.currentRenderer.stroke(this.p5Color);
    }
    fill() {
        this.p.currentRenderer.fill(this.p5Color);
    }
}
class NoColorUnit {
    constructor(p) {
        this.p = p;
    }
    stroke() {
        this.p.currentRenderer.noStroke();
    }
    fill() {
        this.p.currentRenderer.noFill();
    }
}
class UndefinedColorUnit {
    stroke() {
    }
    fill() {
    }
}
class AlphaColorUnit {
    constructor(p, c, alphaResolution = 256) {
        this.p = p;
        const array = [];
        for (let alphaFactor = 0; alphaFactor < alphaResolution; alphaFactor += 1) {
            array.push(p.color(p.red(c), p.green(c), p.blue(c), p.alpha(c) * alphaFactor / (alphaResolution - 1)));
        }
        this.colorArray = array;
        this.maxIndex = alphaResolution - 1;
    }
    stroke(alphaValue) {
        this.p.currentRenderer.stroke(this.getColor(alphaValue));
    }
    fill(alphaValue) {
        this.p.currentRenderer.fill(this.getColor(alphaValue));
    }
    getColor(alphaValue) {
        return this.colorArray[alphaValue ? Math.floor(this.p.map(alphaValue, 0, 255, 0, this.maxIndex)) : this.maxIndex];
    }
}
function colorUnit(p, p5Color, alphaEnabled, alphaResolution) {
    if (!p || p5Color === undefined)
        return new UndefinedColorUnit();
    if (p5Color === null)
        return new NoColorUnit(p);
    if (alphaEnabled)
        return new AlphaColorUnit(p, p5Color, alphaResolution);
    return new NormalColorUnit(p, p5Color);
}
/**
 * Composition of two p5.Color instances. One for stroke(), one for fill().
 */
class ShapeColor {
    /**
     *
     * @param p - p5ex instance.
     * @param {p5.Color | null | undefined} strokeColor - Color for stroke(). Null means noStroke().
     * @param {p5.Color | null | undefined} fillColor - Color for fill(). Null means noFill().
     * @param {boolean} [alphaEnabled]
     * @param {number} [alphaResolution]
     */
    constructor(p, strokeColor, fillColor, alphaEnabled, alphaResolution) {
        this.strokeColor = colorUnit(p, strokeColor, alphaEnabled, alphaResolution);
        this.fillColor = colorUnit(p, fillColor, alphaEnabled, alphaResolution);
    }
    /**
     * Applies colors to the current p5 renderer.
     * @param {number} alphaValue - Alpha channel value (0 - 255)
     */
    applyColor(alphaValue) {
        this.strokeColor.stroke(alphaValue);
        this.fillColor.fill(alphaValue);
    }
}
/**
 * Undefined object of p5ex.ShapeColor.
 * @static
 */
ShapeColor.UNDEFINED = new ShapeColor(undefined, undefined, undefined);

/**
 * An empty function.
 */
const EMPTY_FUNCTION = () => { };
/**
 * 1.5 * PI
 */
const ONE_AND_HALF_PI = 1.5 * Math.PI;

const dummyP5 = new p5((p) => {
    p.setup = () => {
        p.noCanvas();
    };
});
const TWO_PI = 2 * Math.PI;
// Temporal vectors for calculation use in getClosestPositionOnLineSegment()
const tmpVectorAP = dummyP5.createVector();
const tmpVectorAB = dummyP5.createVector();
/**
 * Returns the position on the line segment AB which is closest to the reference point P.
 * @param {p5.Vector} P - The position of the reference point.
 * @param {p5.Vector} A - The position of the line segment start point.
 * @param {p5.Vector} B - The position of the line segment end point.
 * @param {p5.Vector} target - The vector to receive the result.
 */

/**
 * Just lerp.
 * @param startValue - The start value.
 * @param endValue - The end value.
 * @param ratio - The ratio between 0 and 1.
 */
function lerp(startValue, endValue, ratio) {
    return startValue + ratio * (endValue - startValue);
}

/**
 * Container class of number.
 */
class NumberContainer {
    /**
     * @constructor
     * @param {number} value
     */
    constructor(value = 0) {
        this.value = value;
    }
    valueOf() {
        return this.value;
    }
}
/**
 * Null object of NumberContainer.
 * @static
 */
NumberContainer.NULL = new NumberContainer();
/**
 * easeOutQuart.
 * @param ratio
 */
function easeOutQuart(ratio) {
    return -Math.pow(ratio - 1, 4) + 1;
}

/**
 * Returns true if the mouse is within the canvas.
 * @param p - The p5 instance.
 */
function mouseIsInCanvas(p) {
    if (p.mouseX < 0)
        return false;
    if (p.mouseX > p.width)
        return false;
    if (p.mouseY < 0)
        return false;
    if (p.mouseY > p.height)
        return false;
    return true;
}

function loopArrayLimited(array, callback, arrayLength) {
    let i = 0;
    while (i < arrayLength) {
        callback(array[i], i, array);
        i += 1;
    }
}
function loopArrayBackwardsLimited(array, callback, arrayLength) {

    while (arrayLength--) {
        callback(array[arrayLength], arrayLength, array);
    }
}
/**
 * @callback loopArrayCallBack
 * @param {} currentValue
 * @param {number} [index]
 * @param {Array} [array]
 */

function roundRobinLimited(array, callback, arrayLength) {
    for (let i = 0, len = arrayLength - 1; i < len; i += 1) {
        for (let k = i + 1; k < arrayLength; k += 1) {
            callback(array[i], array[k]);
        }
    }
}
/**
 * @callback roundRobinCallBack
 * @param {} element
 * @param {} otherElement
 */

function nestedLoopJoinLimited(array, otherArray, callback, arrayLength, otherArrayLength) {
    for (let i = 0; i < arrayLength; i += 1) {
        for (let k = 0; k < otherArrayLength; k += 1) {
            callback(array[i], otherArray[k]);
        }
    }
}
/**
 * @callback nestedLoopJoinCallBack
 * @param {} element
 * @param {} otherElement
 */

/**
 * A class containing an array and several loop methods.
 */
class LoopableArray {
    /**
     * @param {number} initialCapacity
     */
    constructor(initialCapacity = 256) {

        this.array = new Array(initialCapacity);
        this.length = 0;
    }
    /**
     * Returns a specific element.
     * It is recommended to check that you are going to specify a valid index number
     * before calling this method.
     * @returns The specified element.
     */
    get(index) {
        return this.array[index];
    }
    /**
     * Returns the last element.
     * It is recommended to check that this array is not empty before calling this method.
     * @returns The last element.
     */
    getLast() {
        return this.array[this.length - 1];
    }
    /**
     * Adds one element to the end of the array and returns the new length of the array.
     * @param {} element - The element to add to the end of the array.
     */
    push(element) {
        this.array[this.length] = element;
        this.length += 1;
        return this.length;
    }
    /**
     * Adds elements to the end of the array and returns the new length of the array.
     * @param {Array} array - The elements to add to the end of the array.
     */
    pushRawArray(array, arrayLength = array.length) {
        for (let i = 0; i < arrayLength; i += 1) {
            this.array[this.length + i] = array[i];
        }
        this.length += arrayLength;
        return this.length;
    }
    /**
     * Adds all elements from another LoopableArray and returns the new length of the array.
     * @param {LoopableArray} otherLoopableArray
     */
    pushAll(otherLoopableArray) {
        return this.pushRawArray(otherLoopableArray.array, otherLoopableArray.length);
    }
    /**
     * Removes and returns the last element.
     * It is recommended to check that this array is not empty before calling this method.
     * @returns The last element.
     */
    pop() {
        this.length -= 1;
        return this.array[this.length];
    }
    /**
     * Clears the array.
     */
    clear() {
        this.length = 0;
    }
    /**
     * @callback loopArrayCallBack
     * @param {} currentValue
     * @param {number} [index]
     * @param {Array} [array]
     */
    /**
     * Executes a provided function once for each array element.
     * @param {loopArrayCallBack} callback
     */
    loop(callback) {
        loopArrayLimited(this.array, callback, this.length);
    }
    /**
     * Executes a provided function once for each array element in descending order.
     * @param {loopArrayCallBack} callback
     */
    loopBackwards(callback) {
        loopArrayBackwardsLimited(this.array, callback, this.length);
    }
    /**
     * @callback elementPairCallBack
     * @param {} element
     * @param {} otherElement
     */
    /**
     * Executes a provided function once for each pair within the array.
     * @param {elementPairCallback} callback
     */
    roundRobin(callback) {
        roundRobinLimited(this.array, callback, this.length);
    }
    /**
     * Joins two arrays and executes a provided function once for each joined pair.
     * @param {LoopableArray} otherArray
     * @param {elementPairCallback} callback
     */
    nestedLoopJoin(otherArray, callback) {
        nestedLoopJoinLimited(this.array, otherArray.array, callback, this.length, otherArray.length);
    }
}

/**
 * (To be filled)
 */
class DrawableArray extends LoopableArray {
    static drawFunction(value) {
        value.draw();
    }
    /**
     * Draws all child elements.
     */
    draw() {
        this.loop(DrawableArray.drawFunction);
    }
}

/**
 * (To be filled)
 */
class SteppableArray extends LoopableArray {
    static stepFunction(value) {
        value.step();
    }
    /**
     * Steps all child elements.
     */
    step() {
        this.loop(SteppableArray.stepFunction);
    }
}

/**
 * (To be filled)
 */
class SpriteArray extends LoopableArray {
}
SpriteArray.prototype.step = SteppableArray.prototype.step;
SpriteArray.prototype.draw = DrawableArray.prototype.draw;

/**
 * (To be filled)
 */
class CleanableArray extends LoopableArray {
    /**
     *
     * @param initialCapacity
     */
    constructor(initialCapacity) {
        super(initialCapacity);
        this.recentRemovedElements = new LoopableArray(initialCapacity);
    }
    /**
     * Updates the variable 'isToBeRemoved'.
     * If it has cleanable child elements, calls clean() recursively and
     * removes the child elements which are to be removed.
     */
    clean() {
        this.recentRemovedElements.clear();
        let validElementCount = 0;
        for (let i = 0; i < this.length; i += 1) {
            this.array[i].clean();
            if (this.array[i].isToBeRemoved) {
                this.recentRemovedElements.push(this.array[i]);
                continue;
            }
            this.array[validElementCount] = this.array[i];
            validElementCount += 1;
        }
        this.length = validElementCount;
    }
}

/**
 * (To be filled)
 */
class CleanableSpriteArray extends CleanableArray {
}
CleanableSpriteArray.prototype.draw = SpriteArray.prototype.draw;
CleanableSpriteArray.prototype.step = SpriteArray.prototype.step;

/**
 * (To be filled)
 */
class ScaleFactor {
    /**
     *
     * @param p - p5ex instance.
     * @param { number } [value = 1]
     */
    constructor(p, value = 1) {
        this.p = p;
        this.internalValue = value;
        this.internalReciprocalValue = 1 / value;
    }
    /**
     * The numeric value of the scale factor.
     */
    get value() {
        return this.internalValue;
    }
    set value(v) {
        if (v === 0) {
            this.internalValue = 0.0001;
            this.internalReciprocalValue = 10000;
            return;
        }
        this.internalValue = v;
        this.internalReciprocalValue = 1 / v;
    }
    /**
     * The reciprocal value of the scale factor.
     */
    get reciprocalValue() {
        return this.internalReciprocalValue;
    }
    /**
     * Calls scale().
     */
    applyScale() {
        this.p.currentRenderer.scale(this.internalValue);
    }
    /**
     * Calls scale() with the reciprocal value.
     */
    cancel() {
        this.p.currentRenderer.scale(this.internalReciprocalValue);
    }
}
/**
 * (To be filled)
 */
class Drawer {
    /**
     *
     * @param p
     * @param element
     * @param drawParam
     */
    constructor(p, element, drawParam) {
        this.p = p;
        this.set(element, drawParam);
    }
    /**
     * (To be filled)
     * @param element
     * @param drawParam
     */
    set(element, drawParam) {
        this.element = element;
        this.position = drawParam.positionRef || this.p.createVector();
        this.offsetPosition = drawParam.offsetPositionRef || this.p.createVector();
        this.rotation = drawParam.rotationAngleRef || NumberContainer.NULL;
        this.scaleFactor = drawParam.scaleFactorRef || new ScaleFactor(this.p);
        this.shapeColor = drawParam.shapeColorRef || ShapeColor.UNDEFINED;
        this.alphaChannel = drawParam.alphaChannelRef || NumberContainer.NULL;
        this.strokeWeight = drawParam.strokeWeightRef || NumberContainer.NULL;
        this.textSize = drawParam.textSizeRef || NumberContainer.NULL;
        this.procedureList = this.createProcedureList(drawParam);
        this.procedureListLength = this.procedureList.length;
    }
    /**
     * Draws the content.
     */
    draw() {
        for (let i = 0, len = this.procedureListLength; i < len; i += 1) {
            this.procedureList[i](this);
        }
    }
    drawElement(drawer) {
        drawer.element.draw();
    }
    createProcedureList(drawParam) {
        const procedureList = [];
        if (drawParam.shapeColorRef) {
            if (drawParam.alphaChannelRef)
                procedureList.push(this.alphaColor);
            else
                procedureList.push(this.color);
        }
        if (drawParam.textSizeRef)
            procedureList.push(this.applyTextSize);
        if (drawParam.strokeWeightRef)
            procedureList.push(this.applyStrokeWeight);
        if (drawParam.positionRef) {
            if (drawParam.offsetPositionRef)
                procedureList.push(this.translateWithOffset);
            else
                procedureList.push(this.translate);
        }
        else if (drawParam.offsetPositionRef)
            procedureList.push(this.translateOnlyOffset);
        if (drawParam.scaleFactorRef)
            procedureList.push(this.scale);
        if (drawParam.rotationAngleRef)
            procedureList.push(this.rotate);
        procedureList.push(this.drawElement);
        if (drawParam.rotationAngleRef)
            procedureList.push(this.cancelRotate);
        if (drawParam.scaleFactorRef)
            procedureList.push(this.cancelScale);
        if (drawParam.positionRef) {
            if (drawParam.offsetPositionRef)
                procedureList.push(this.cancelTranslateWithOffset);
            else
                procedureList.push(this.cancelTranslate);
        }
        else if (drawParam.offsetPositionRef)
            procedureList.push(this.cancelTranslateOnlyOffset);
        return procedureList;
    }
    translate(drawer) {
        drawer.p.currentRenderer.translate(drawer.position.x, drawer.position.y);
    }
    cancelTranslate(drawer) {
        drawer.p.currentRenderer.translate(-drawer.position.x, -drawer.position.y);
    }
    translateOnlyOffset(drawer) {
        drawer.p.currentRenderer.translate(drawer.offsetPosition.x, drawer.offsetPosition.y);
    }
    cancelTranslateOnlyOffset(drawer) {
        drawer.p.currentRenderer.translate(-drawer.offsetPosition.x, -drawer.offsetPosition.y);
    }
    translateWithOffset(drawer) {
        drawer.p.currentRenderer.translate(drawer.position.x + drawer.offsetPosition.x, drawer.position.y + drawer.offsetPosition.y);
    }
    cancelTranslateWithOffset(drawer) {
        drawer.p.currentRenderer.translate(-(drawer.position.x + drawer.offsetPosition.x), -(drawer.position.y + drawer.offsetPosition.y));
    }
    rotate(drawer) {
        drawer.p.currentRenderer.rotate(drawer.rotation.value);
    }
    cancelRotate(drawer) {
        drawer.p.currentRenderer.rotate(-drawer.rotation.value);
    }
    scale(drawer) {
        if (drawer.scaleFactor.value === 1)
            return;
        drawer.scaleFactor.applyScale();
    }
    cancelScale(drawer) {
        if (drawer.scaleFactor.value === 1)
            return;
        drawer.scaleFactor.cancel();
    }
    color(drawer) {
        drawer.shapeColor.applyColor();
    }
    alphaColor(drawer) {
        drawer.shapeColor.applyColor(drawer.alphaChannel.value);
    }
    applyStrokeWeight(drawer) {
        drawer.p.currentRenderer.strokeWeight(drawer.strokeWeight.value);
    }
    applyTextSize(drawer) {
        drawer.p.currentRenderer.textSize(drawer.textSize.value);
    }
}

// temporal vectors for use in QuadraticBezierCurve.
const tmpMidPoint1 = dummyP5.createVector();
const tmpMidPoint2 = dummyP5.createVector();
/**
 * Set color to the specified pixel.
 * Should be used in conjunction with loadPixels() and updatePixels().
 * @param renderer - Instance of either p5 or p5.Graphics.
 * @param x - The x index of the pixel.
 * @param y - The y index of the pixel.
 * @param red - The red value (0 - 255).
 * @param green - The green value (0 - 255).
 * @param blue - The blue value (0 - 255).
 * @param pixelDensity - If not specified, renderer.pixelDensity() will be called.
 */
function setPixel(renderer, x, y, red, green, blue, alpha, pixelDensity) {
    const g = renderer;
    const d = pixelDensity || g.pixelDensity();
    for (let i = 0; i < d; i += 1) {
        for (let j = 0; j < d; j += 1) {
            const idx = 4 * ((y * d + j) * g.width * d + (x * d + i));
            g.pixels[idx] = red;
            g.pixels[idx + 1] = green;
            g.pixels[idx + 2] = blue;
            g.pixels[idx + 3] = alpha;
        }
    }
}
/**
 * Lerp color to the specified pixel. The alpha channel remains unchanged.
 * Should be used in conjunction with loadPixels() and updatePixels().
 * @param renderer - Instance of either p5 or p5.Graphics.
 * @param x - The x index of the pixel.
 * @param y - The y index of the pixel.
 * @param red - The red value (0 - 255).
 * @param green - The green value (0 - 255).
 * @param blue - The blue value (0 - 255).
 * @param pixelDensity - If not specified, renderer.pixelDensity() will be called.
 * @param lerpRatio - The lerp ratio (0 - 1). If 1, the color will be replaced.
 */
function lerpPixel(renderer, x, y, red, green, blue, pixelDensity, lerpRatio = 1) {
    const g = renderer;
    const d = pixelDensity || g.pixelDensity();
    for (let i = 0; i < d; i += 1) {
        for (let j = 0; j < d; j += 1) {
            const idx = 4 * ((y * d + j) * g.width * d + (x * d + i));
            g.pixels[idx] = lerp(g.pixels[idx], red, lerpRatio);
            g.pixels[idx + 1] = lerp(g.pixels[idx + 1], green, lerpRatio);
            g.pixels[idx + 2] = lerp(g.pixels[idx + 2], blue, lerpRatio);
            // g.pixels[idx + 3] = 255;
        }
    }
}
function lerpPixelForRandomTexture(renderer, x, y, red, green, blue, alpha) {
    lerpPixel(renderer, x, y, red, green, blue, undefined, alpha / 255);
}
/**
 * Sets the specified color (default: black) to each pixel with a random alpha value.
 * @param renderer - Instance of either p5 or p5.Graphics.
 * @param {number} maxAlpha - The max value of alpha channel (1 - 255).
 * @param {boolean} [blend] - Set true for blending, false for replacing.
 * @param {number} [red]
 * @param {number} [green]
 * @param {number} [blue]
 */
function applyRandomTexture(renderer, maxAlpha, blend = true, red = 0, green = 0, blue = 0) {
    const g = renderer;
    const width = g.width;
    const height = g.height;
    const operatePixel = blend ? lerpPixelForRandomTexture : setPixel;
    g.loadPixels();
    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            operatePixel(renderer, x, y, red, green, blue, Math.random() * maxAlpha);
        }
    }
    g.updatePixels();
    return g;
}

/**
 * (To be filled)
 */
class AngleQuantity {
    /**
     * Null object of AngleQuantity.
     * @static
     */
    static get NULL() { return NULL$1; }
    /**
     *
     * @param angle
     * @param angleVelocity
     */
    constructor(angle = 0, angleVelocity = 0) {
        this.angleReference = new NumberContainer(angle);
        this.angleVelocityReference = new NumberContainer(angleVelocity);
    }
    /**
     * Current angle value.
     */
    get angle() { return this.angleReference.value; }
    set angle(v) { this.angleReference.value = v; }
    /**
     * Current anglular velocity value.
     */
    get angleVelocity() { return this.angleVelocityReference.value; }
    set angleVelocity(v) { this.angleVelocityReference.value = v; }
    /**
     * Updates the angle.
     */
    step() {
        this.angle += this.angleVelocity;
    }
}
class NullAngleQuantity extends AngleQuantity {
    get angle() { return 0; }
    set angle(v) { }
    get angleVelocity() { return 0; }
    set angleVelocity(v) { }
    step() { }
}
const NULL$1 = new NullAngleQuantity();

const temporalVector = dummyP5.createVector();

/**
 * (To be filled)
 */
class FrameCounter {
    constructor() {
        this.count = 0;
    }
    /**
     * Resets the counter.
     * @param count
     */
    resetCount(count = 0) {
        this.count = count;
        return this;
    }
    /**
     * Increments the frame count.
     */
    step() {
        this.count += 1;
    }
    /**
     * Returns the mod.
     * @param divisor
     */
    mod(divisor) {
        return this.count % divisor;
    }
}

/**
 * (To be filled)
 */
class TimedFrameCounter extends FrameCounter {
    /**
     * True if this counter is activated.
     */
    get isOn() { return this._isOn; }

    /**
     *
     * @param durationFrameCount
     * @param completeBehavior
     */
    constructor(durationFrameCount, completeBehavior = EMPTY_FUNCTION) {
        super();
        this._isOn = true;
        this.completeBehavior = completeBehavior;
        this.durationFrameCount = durationFrameCount;
    }
    /**
     * Activate this counter.
     * @param duration
     * @chainable
     */
    on(duration) {
        this._isOn = true;
        if (duration)
            this.durationFrameCount = duration;
        return this;
    }
    /**
     * Deactivate this counter.
     * @chainable
     */
    off() {
        this._isOn = false;
        return this;
    }
    /**
     * @override
     */
    step() {
        if (!this._isOn)
            return;
        this.count += 1;
        if (this.count > this.durationFrameCount) {
            this.completeCycle();
        }
    }
}

/**
 * (To be filled)
 */
class NonLoopedFrameCounter extends TimedFrameCounter {
    /**
     * True if the given frame count duration has ellapsed already.
     */
    get isCompleted() { return this._isCompleted; }

    /**
     *
     * @param durationFrameCount
     * @param completeBehavior
     */
    constructor(durationFrameCount, completeBehavior) {
        super(durationFrameCount, completeBehavior);
        this._isCompleted = false;
    }
    /**
     * @override
     * @chainable
     */
    on(duration) {
        super.on(duration);
        return this;
    }
    /**
     * @override
     * @chainable
     */
    off() {
        super.off();
        return this;
    }
    /**
     * @override
     */
    resetCount() {
        super.resetCount();
        this._isCompleted = false;
        return this;
    }
    /**
     * @override
     */
    getProgressRatio() {
        return this._isCompleted ? 1 : this.count / this.durationFrameCount;
    }
    /**
     * @override
     */
    completeCycle() {
        this._isCompleted = true;
        this._isOn = false;
        this.completeBehavior();
    }
}

/**
 * Extension of p5 class.
 */
class p5exClass extends p5 {
    /**
     * Sets the current renderer object.
     * @param renderer
     */
    setCurrentRenderer(renderer) {
        this.currentRenderer = renderer;
    }
    /**
      * The non-scaled width of the canvas.
      */
    get nonScaledWidth() {
        return this.scalableCanvas.nonScaledWidth;
    }
    /**
     * The non-scaled height of the canvas.
     */
    get nonScaledHeight() {
        return this.scalableCanvas.nonScaledHeight;
    }

    /**
     * The ideal frame rate which was set by setFrameRate().
     */
    get idealFrameRate() { return this._idealFrameRate; }
    /**
     * Anglular displacement in radians per frame which corresponds to 1 cycle per second.
     * Set by setFrameRate().
     */
    get unitAngleSpeed() { return this._unitAngleSpeed; }
    /**
     * Positional displacement per frame which corresponds to 1 unit length per second.
     * Set by setFrameRate().
     */
    get unitSpeed() { return this._unitSpeed; }
    /**
     * Change of speed per frame which corresponds to 1 unit speed per second.
     * Set by setFrameRate().
     */
    get unitAccelerationMagnitude() { return this._unitAccelerationMagnitude; }
    /**
     * Constructor of class p5ex.
     * @param sketch
     * @param node
     * @param sync
     */
    constructor(sketch, node, sync) {
        super(sketch, typeof node === 'string' ? document.getElementById(node) || undefined : node, sync);
        if (!node || typeof node === 'boolean') {
            this.node = document.body;
        }
        else {
            this.node = typeof node === 'string' ? document.getElementById(node) || document.body : node;
        }
        this.currentRenderer = this;
        this.maxCanvasRegion = {
            width: 0,
            height: 0,
            getShortSideLength() { return Math.min(this.width, this.height); },
        };
        this.updateMaxCanvasRegion();
        this.setFrameRate();
    }
    /**
     * Calls frameRate() and sets variables related to the frame rate.
     * @param {number} [fps=60] - The ideal frame rate per second.
     */
    setFrameRate(fps = 60) {
        this.frameRate(fps);
        if (fps) {
            this._idealFrameRate = fps;
            this._unitAngleSpeed = 2 * Math.PI / this._idealFrameRate;
            this._unitSpeed = 1 / this._idealFrameRate;
            this._unitAccelerationMagnitude = this._unitSpeed / this._idealFrameRate;
        }
        return this;
    }
    /**
     * Updates the value of the variable maxCanvasRegion.
     */
    updateMaxCanvasRegion() {
        this.maxCanvasRegion.width = this.windowWidth;
        this.maxCanvasRegion.height = this.windowHeight;
        if (this.node === document.body)
            return;
        const containerRect = this.node.getBoundingClientRect();
        this.maxCanvasRegion.width = containerRect.width;
        this.maxCanvasRegion.height = containerRect.height;
    }
    /**
     * Create an instance of ScalableCanvas. This includes calling of createCanvas().
     * @param {ScalableCanvasType} type - Type chosen from p5ex.ScalableCanvasTypes.
     * @param {ScalableCanvasParameters} [parameters] - Parameters for type CUSTOM.
     * @param {string} [rendererType] - Either P2D or WEBGL.
     */
    createScalableCanvas(type, parameters, rendererType) {
        this.scalableCanvasType = type;
        this.scalableCanvas = new ScalableCanvas(this, this.createScalableCanvasParameter(type, parameters), this.node, rendererType);
    }
    /**
     * Resizes the ScalableCanvas. Does not work on OpenProcessing.
     * @param {ScalableCanvasType} [type] - Type chosen from p5ex.ScalableCanvasTypes.
     *     If undefined, the last used type will be used again.
     * @param {ScalableCanvasParameters} [parameters] - Parameters for type CUSTOM.
     */
    resizeScalableCanvas(type, parameters) {
        this.scalableCanvas.resize(this.createScalableCanvasParameter(type || this.scalableCanvasType, parameters));
    }
    createScalableCanvasParameter(type, parameters) {
        this.updateMaxCanvasRegion();
        const maxShortSide = this.maxCanvasRegion.getShortSideLength();
        switch (type) {
            case ScalableCanvasTypes.SQUARE640x640:
                return {
                    scaledWidth: maxShortSide,
                    scaledHeight: maxShortSide,
                    nonScaledShortSideLength: 640,
                };
            case ScalableCanvasTypes.RECT640x480:
                return {
                    scaledWidth: maxShortSide,
                    scaledHeight: 0.75 * maxShortSide,
                    nonScaledShortSideLength: 480,
                };
            case ScalableCanvasTypes.FULL:
                return {
                    scaledWidth: this.maxCanvasRegion.width,
                    scaledHeight: this.maxCanvasRegion.height,
                    nonScaledShortSideLength: 640,
                };
            default:
                return parameters || ScalableCanvas.DUMMY_PARAMETERS;
        }
    }
}

const SKETCH_NAME = 'CMYK';
class ColorObject {
    constructor(p, position, velocity) {
        this.p = p;
        this.position = position;
        this.velocity = velocity;
        this.isToBeRemoved = false;
        this.isActive = true;
        this.remainingBoundCount = 1;
        this.postBirthTimer = new NonLoopedFrameCounter(30);
        if (velocity.magSq() < 1.1 * 1.1)
            velocity.set(p5.Vector.random2D().mult(1.1));
    }
    step() {
        if (!this.isActive)
            return;
        this.postBirthTimer.step();
        const speedSquared = this.velocity.magSq();
        if (speedSquared > 8)
            this.velocity.mult(0.95);
        else if (speedSquared < 2)
            this.velocity.mult(1.1);
        this.position.add(this.velocity);
    }
    clean() {
        if (this.remainingBoundCount > 0) {
            if (this.position.x < 0 || this.position.x > this.p.nonScaledWidth) {
                this.p.constrain(this.position.x, 0, this.p.nonScaledWidth);
                this.velocity.x *= -1;
                this.remainingBoundCount -= 1;
            }
            if (this.position.y < 0 || this.position.y > this.p.nonScaledHeight) {
                this.p.constrain(this.position.y, 0, this.p.nonScaledHeight);
                this.velocity.y *= -1;
                this.remainingBoundCount -= 1;
            }
            return;
        }
        const margin = this.size;
        if (this.position.x < -margin || this.position.x > this.p.nonScaledWidth + margin ||
            this.position.y < -margin || this.position.y > this.p.nonScaledHeight + margin) {
            this.isToBeRemoved = true;
        }
    }
    draw() {
    }
    hasColor(color) {
        return true;
    }
    hasCommonColor(otherObject) {
        return true;
    }
    setSize(v) {
    }
}
class UnitColorObject extends ColorObject {
    constructor(p, color, velocity) {
        super(p, p.createVector(p.scalableCanvas.getNonScaledValueOf(p.mouseX), p.scalableCanvas.getNonScaledValueOf(p.mouseY)), velocity);
        this.p = p;
        this.color = color;
        this.rotation = new AngleQuantity(p.random(p.TWO_PI), p.random(-1, 1) * 0.01 * p.TWO_PI);
        this.size = 12;
        this.drawer = new Drawer(p, {
            draw: () => {
                p.rect(-0.4 * this.size, -0.4 * this.size, this.size, this.size);
            },
        }, {
            shapeColorRef: color,
            rotationAngleRef: this.rotation.angleReference,
        });
    }
    step() {
        super.step();
        this.rotation.step();
    }
    draw() {
        if (this.isActive)
            this.p.translate(this.position.x, this.position.y);
        this.drawer.draw();
        if (this.isActive)
            this.p.translate(-this.position.x, -this.position.y);
    }
    hasColor(color) {
        return this.color === color;
    }
    hasCommonColor(otherObject) {
        return otherObject.hasColor(this.color);
    }
    setSize(v) {
        this.size = v;
    }
}
class CompositeColorObject extends ColorObject {
    constructor(p, objectA, objectB) {
        super(p, p5.Vector.add(objectA.position, objectB.position).mult(0.5), p5.Vector.add(objectA.velocity, objectB.velocity).mult(0.5));
        this.objectA = objectA;
        this.objectB = objectB;
        objectA.position.set(0, 0);
        objectB.position.set(0, 0);
        objectA.isActive = false;
        objectB.isActive = false;
        this.setSize(Math.max(objectA.size, objectB.size) * 1.2);
    }
    step() {
        super.step();
        this.objectA.step();
        this.objectB.step();
    }
    draw() {
        this.p.translate(this.position.x, this.position.y);
        this.objectA.draw();
        this.objectB.draw();
        if (!this.postBirthTimer.isCompleted) {
            const ratio = this.postBirthTimer.getProgressRatio();
            if (ratio < 1) {
                CompositeColorObject.effectColor.applyColor((1 - ratio) * 255);
                const diameter = 60 * easeOutQuart(ratio);
                this.p.strokeWeight((1 - ratio) * 4);
                this.p.ellipse(0, 0, diameter, diameter);
            }
        }
        this.p.translate(-this.position.x, -this.position.y);
    }
    hasColor(color) {
        return this.objectA.hasColor(color) || this.objectB.hasColor(color);
    }
    hasCommonColor(otherObject) {
        return this.objectA.hasCommonColor(otherObject) || this.objectB.hasCommonColor(otherObject);
    }
    setSize(v) {
        this.size = v;
        this.objectA.setSize(v);
        this.objectB.setSize(v);
    }
}
const sketch = (p) => {
    // ---- variables
    let backgroundColor;
    let backgroundPixels;
    let timeoutId = -1;
    let colorObjects;
    let newColorObjects;
    let colorArray;
    let currentColorIndex = 0;
    let cursorColor;
    let mousePosition;
    // ---- functions
    function reset() {
        p.blendMode(p.BLEND);
        p.background(backgroundColor);
        applyRandomTexture(p, 8, true, 0, 0, 32);
        p.loadPixels();
        backgroundPixels = p.pixels;
        p.blendMode(p.DIFFERENCE);
    }
    function processCollision() {
        colorObjects.roundRobin((element, otherElement) => {
            if (element.postBirthTimer.isCompleted &&
                otherElement.postBirthTimer.isCompleted &&
                !element.isToBeRemoved &&
                !otherElement.isToBeRemoved &&
                !element.hasCommonColor(otherElement) &&
                Math.abs(element.position.x - otherElement.position.x) < 10 &&
                Math.abs(element.position.y - otherElement.position.y) < 10) {
                element.isToBeRemoved = true;
                otherElement.isToBeRemoved = true;
                newColorObjects.push(new CompositeColorObject(p, element, otherElement));
            }
        });
    }
    function spawn(angle) {
        newColorObjects.push(new UnitColorObject(p, colorArray[currentColorIndex], p5.Vector.fromAngle(angle).mult(8)));
    }
    function drawCursor() {
        p.stroke(cursorColor);
        p.strokeWeight(3);
        p.line(mousePosition.x - 10, mousePosition.y, mousePosition.x + 10, mousePosition.y);
        p.line(mousePosition.x, mousePosition.y - 10, mousePosition.x, mousePosition.y + 10);
    }
    // ---- Setup & Draw etc.
    p.preload = () => {
    };
    p.setup = () => {
        p.createScalableCanvas(ScalableCanvasTypes.SQUARE640x640);
        backgroundColor = p.color(255, 255, 255);
        colorObjects = new CleanableSpriteArray();
        newColorObjects = new SpriteArray();
        colorArray = [
            new ShapeColor(p, null, p.color(255, 0, 0)),
            new ShapeColor(p, null, p.color(0, 255, 0)),
            new ShapeColor(p, null, p.color(0, 0, 255)),
        ];
        CompositeColorObject.effectColor = new ShapeColor(p, p.color(255, 255, 255), null, true);
        cursorColor = p.color(160, 160, 160);
        mousePosition = p.createVector(0.5 * p.nonScaledWidth, 0.5 * p.nonScaledHeight);
        reset();
    };
    p.draw = () => {
        p.pixels = backgroundPixels;
        p.updatePixels();
        mousePosition.set(p.scalableCanvas.getNonScaledValueOf(p.mouseX), p.scalableCanvas.getNonScaledValueOf(p.mouseY));
        p.scalableCanvas.scale();
        colorObjects.step();
        colorObjects.clean();
        colorObjects.draw();
        drawCursor();
        p.scalableCanvas.cancelScale();
        processCollision();
        if (mouseIsInCanvas(p) && p.mouseIsPressed && p.frameCount % 2 === 0) {
            const angle = p.TWO_PI * (p.frameCount % 31 / 31);
            spawn(angle);
            spawn(angle + p.PI);
        }
        colorObjects.pushAll(newColorObjects);
        newColorObjects.clear();
    };
    p.windowResized = () => {
        if (timeoutId !== -1)
            clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            p.resizeScalableCanvas();
            reset();
        }, 200);
    };
    p.mousePressed = () => {
        // if (p.mouseButton === p.RIGHT) p.noLoop();
        if (mouseIsInCanvas(p))
            return false;
    };
    p.mouseReleased = () => {
        currentColorIndex = (currentColorIndex + 1) % colorArray.length;
    };
    p.keyTyped = () => {
        // if (p.key === 's') p.saveCanvas('image', 'png');
    };
};
new p5exClass(sketch, SKETCH_NAME);

}());
//# sourceMappingURL=sketch.js.map
