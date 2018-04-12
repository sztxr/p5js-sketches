/**
 * Object Pool.
 * Website => https://www.fal-works.com/
 * Including module: p5ex (Copyright 2018 FAL, licensed under MIT).
 * @copyright 2018 FAL
 * @author FAL <falworks.contact@gmail.com>
 * @version 0.1.1
 * @license CC-BY-SA-3.0
 */

(function () {
'use strict';

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
 * 1.5 * PI
 */
const ONE_AND_HALF_PI = 1.5 * Math.PI;

const dummyP5 = new p5((p) => {
    p.setup = () => {
        p.noCanvas();
    };
});

/**
 * Calculates the squared value of the Euclidean distance between
 * two points (considering a point as a vector object).
 */
function distSq(v1, v2) {
    return Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2) + Math.pow(v2.z - v1.z, 2);
}
const TWO_PI = 2 * Math.PI;
// Temporal vectors for calculation use in getClosestPositionOnLineSegment()
const tmpVectorAP = dummyP5.createVector();
const tmpVectorAB = dummyP5.createVector();

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
 * A Naive implementation of an edge between two objects.
 */
class NaiveEdge {
    /**
     *
     * @param nodeA
     * @param nodeB
     */
    constructor(nodeA, nodeB) {
        this.nodeA = nodeA;
        this.nodeB = nodeB;
    }
    /**
     * Returns true if the provided node is incident to this edge.
     * @param node
     */
    isIncidentTo(node) {
        return node === this.nodeA || node === this.nodeB;
    }
    /**
     * Returns the adjacent node of the given node via this edge.
     * If this edge is not incident to the given node, returns always the end point node.
     * @param {T} node - any node which is incident to this edge
     */
    getAdjacentNode(node) {
        if (node === this.nodeB)
            return this.nodeA;
        return this.nodeB;
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

// temporal vectors for use in QuadraticBezierCurve.
const tmpMidPoint1 = dummyP5.createVector();
const tmpMidPoint2 = dummyP5.createVector();

/**
 * (To be filled)
 */
class KinematicQuantity {
    constructor() {
        this.position = new p5.Vector();
        this.velocity = new p5.Vector();
    }
    /**
     * Updates the position.
     */
    step() {
        this.position.add(this.velocity);
    }
    /**
     * Returns the current speed.
     */
    getSpeed() {
        return this.velocity.mag();
    }
    /**
     * Returns the current direction angle.
     */
    getDirection() {
        return this.velocity.heading();
    }
    /**
     * Adds the given value to the current speed.
     * @param speedChange
     */
    addSpeed(speedChange) {
        this.velocity.setMag(Math.max(0, this.velocity.mag() + speedChange));
    }
}

const temporalVector = dummyP5.createVector();
/**
 * (To be filled)
 */
class PhysicsBody {
    constructor() {
        this.kinematicQuantity = new KinematicQuantity();
        this.position = this.kinematicQuantity.position;
        this.velocity = this.kinematicQuantity.velocity;
        this.mass = 1;
        this.collisionRadius = 0;
        this.hasFriction = false;
        this.decelerationFactor = 1;
    }
    /**
     * X position.
     */
    get x() {
        return this.position.x;
    }
    /**
     * Y position.
     */
    get y() {
        return this.position.y;
    }
    /**
     * Z position.
     */
    get z() {
        return this.position.z;
    }
    /**
     * X velocity.
     */
    get vx() {
        return this.velocity.x;
    }
    /**
     * Y velocity.
     */
    get vy() {
        return this.velocity.y;
    }
    /**
     * Z velocity.
     */
    get vz() {
        return this.velocity.z;
    }
    /**
     * Returns the current speed.
     */
    getSpeed() {
        return this.kinematicQuantity.getSpeed();
    }
    /**
     * Returns the current direction angle.
     */
    getDirection() {
        return this.kinematicQuantity.getDirection();
    }
    /**
     * Sets the friction of the body.
     * @param constant
     */
    setFriction(constant) {
        if (constant === 0) {
            this.hasFriction = false;
            return;
        }
        this.hasFriction = true;
        this.decelerationFactor = 1 - constant;
    }
    /**
     * Constrains the current speed. Should be called every time if needed.
     * @param maxSpeed
     */
    constrainSpeed(maxSpeed) {
        if (this.velocity.magSq() > maxSpeed * maxSpeed)
            this.velocity.setMag(maxSpeed);
    }
    /**
     * Updates the body.
     */
    step() {
        this.kinematicQuantity.step();
        if (this.hasFriction) {
            this.kinematicQuantity.velocity.mult(this.decelerationFactor);
        }
    }
    /**
     * Accelerates the body.
     * @param x
     * @param y
     * @param z
     */
    accelerate(x, y, z) {
        this.kinematicQuantity.velocity.add(x, y, z);
    }
    /**
     * Apply the provided force to the body.
     * @param force
     */
    applyForce(force) {
        this.accelerate(force.x / this.mass, force.y / this.mass, force.z / this.mass);
    }
    /**
     * Add the provided value to the speed of the body.
     * @param speedChange
     */
    addSpeed(speedChange) {
        this.kinematicQuantity.addSpeed(speedChange);
    }
    /**
     * Returns true if the body collides the provided body.
     * @param other
     */
    collides(other) {
        return (distSq(this.position, other.position) <
            this.collisionRadius * this.collisionRadius + other.collisionRadius * other.collisionRadius);
    }
    /**
     * (To be filled)
     * @param normalUnitVector
     * @param restitution
     */
    bounce(normalUnitVector, restitution = 1) {
        this.velocity.add(p5.Vector.mult(normalUnitVector, (1 + restitution) * p5.Vector.dot(this.velocity, p5.Vector.mult(normalUnitVector, -1))));
    }
    /**
     * Applies attraction force to both this and the target body.
     * @param {PhysicsBody} other - the other body to interact with
     * @param {number} magnitudeFactor - the factor of magnitude other than the distance
     * @param {number} minMag - the minimum magnitude
     * @param {number} maxMag - the maximum magnitude
     * @param {number} cutoffMag - does not apply force if magnitude is smaller than this
     */
    attractEachOther(other, magnitudeFactor, minMag = 0, maxMag, cutoffMag) {
        const force = this.calculateAttractionForce(other.position, magnitudeFactor, minMag, maxMag, cutoffMag);
        if (!force)
            return;
        this.applyForce(force);
        force.mult(-1);
        other.applyForce(force);
    }
    /**
     * Applies attraction force to this body.
     * @param {p5.Vector} targetPosition - the target position
     * @param {number} magnitudeFactor - the factor of magnitude other than the distance
     * @param {number} minMag - the minimum magnitude
     * @param {number} maxMag - the maximum magnitude
     * @param {number} cutoffMag - does not apply force if magnitude is smaller than this
     */
    attractToPoint(targetPosition, magnitudeFactor, minMag = 0, maxMag, cutoffMag) {
        const force = this.calculateAttractionForce(targetPosition, magnitudeFactor, minMag, maxMag, cutoffMag);
        if (!force)
            return;
        this.applyForce(force);
    }
    calculateAttractionForce(targetPosition, magnitudeFactor, minMag = 0, maxMag, cutoffMag) {
        const tmpVec = temporalVector;
        p5.Vector.sub(targetPosition, this.position, tmpVec); // set relative position
        const distanceSquared = tmpVec.magSq();
        let magnitude = Math.abs(magnitudeFactor) / distanceSquared;
        if (cutoffMag && magnitude < cutoffMag)
            return null;
        if (maxMag)
            magnitude = Math.min(Math.max(magnitude, minMag), maxMag);
        else
            magnitude = Math.max(magnitude, minMag);
        tmpVec.setMag(magnitude); // set force
        if (magnitudeFactor < 0)
            tmpVec.mult(-1);
        return tmpVec;
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

class KanjiNode extends PhysicsBody {
    constructor(p, character, font) {
        super();
        this.p = p;
        this.character = character;
        this.position.set(p.random(-320, 320), p.random(-320, 320));
        this.setFriction(0.07);
        this.graphics = p.createGraphics(40, 40);
        const g = this.graphics;
        g.strokeWeight(2);
        g.stroke(128, 128, 128);
        g.rectMode(p.CENTER);
        g.rect(0.5 * g.width, 0.5 * g.height, g.width - 2, g.height - 2, 4);
        g.textAlign(p.CENTER, p.CENTER);
        g.textFont(font, 0.75 * g.height);
        g.noStroke();
        g.fill(32, 32, 32);
        g.text(character, 0.5 * g.width, 0.4 * g.height);
    }
    step() {
        super.step();
    }
    draw() {
        // this.p.stroke(0, 0, 0);
        // this.p.fill(255, 255, 255);
        // this.p.rect(this.position.x, this.position.y, 30, 30, 4);
        // this.p.noStroke();
        // this.p.fill(0, 0, 0);
        // this.p.text(this.character, this.position.x, this.position.y);
        this.p.image(this.graphics, this.position.x, this.position.y);
    }
    toString() {
        return this.character;
    }
}

class PhysicsBodyEdge extends NaiveEdge {
    constructor(p, nodeA, nodeB) {
        super(nodeA, nodeB);
        this.p = p;
        this.relativePositionA = p.createVector();
        this.relativePositionB = p.createVector();
        this.update();
    }
    step() {
        this.update();
    }
    update() {
        this.relativePositionA.set(this.nodeA.position.x - this.nodeB.position.x, this.nodeA.position.y - this.nodeB.position.y);
        this.relativePositionB.set(this.nodeB.position.x - this.nodeA.position.x, this.nodeB.position.y - this.nodeA.position.y);
        this.directionAngleA = this.relativePositionA.heading();
        this.directionAngleB = this.directionAngleA + this.p.PI;
        if (this.directionAngleB > this.p.TWO_PI)
            this.directionAngleB -= this.p.TWO_PI;
        this.distanceSquared = distSq(this.nodeA.position, this.nodeB.position);
    }
    getRelativePosition(referenceNode) {
        if (referenceNode === this.nodeB)
            return this.relativePositionA;
        return this.relativePositionB;
    }
    getDirectionAngle(referenceNode) {
        if (referenceNode === this.nodeB)
            return this.directionAngleA;
        return this.directionAngleB;
    }
}

class PhysicsSpring extends PhysicsBodyEdge {
    constructor(p, nodeA, nodeB, equilibriumLength = 100, springConstant = 0.005) {
        super(p, nodeA, nodeB);
        if (!PhysicsSpring.isInitialized) {
            PhysicsSpring.temporalVector = p.createVector();
            PhysicsSpring.isInitialized = true;
        }
        this.equilibriumLength = equilibriumLength;
        this.springConstant = springConstant;
    }
    step() {
        super.step();
        const bodyA = this.nodeA;
        const bodyB = this.nodeB;
        const stretchLength = this.p.sqrt(this.distanceSquared) - this.equilibriumLength;
        const tmpVec = PhysicsSpring.temporalVector;
        tmpVec.set(this.relativePositionB);
        tmpVec.setMag(this.springConstant * stretchLength); // set spring force to be applied to A
        bodyA.applyForce(tmpVec);
        tmpVec.mult(-1); // set spring force to be applied to B
        bodyB.applyForce(tmpVec);
    }
}
PhysicsSpring.isInitialized = false;

class KanjiEdge extends PhysicsSpring {
    constructor(p, nodeA, nodeB) {
        super(p, nodeA, nodeB, 70, 0.001);
    }
    step() {
        super.step();
    }
    draw() {
        this.p.line(this.nodeA.position.x, this.nodeA.position.y, this.nodeB.position.x, this.nodeB.position.y);
    }
    toString() {
        return this.nodeA + ' -> ' + this.nodeB;
    }
}

class KanjiGraph {
    constructor(p, lines, font) {
        this.p = p;
        this.nodes = new SpriteArray();
        this.edges = new SpriteArray();
        this.nodeMap = new Map();
        this.applyRepulsion = (element, otherElement) => {
            // Maybe not correct, but works for now
            element.attractEachOther(otherElement, -7000000 * this.p.unitAccelerationMagnitude, 0, 10000 * this.p.unitAccelerationMagnitude, 200 * this.p.unitAccelerationMagnitude);
        };
        this.font = font;
        for (const line of lines) {
            const characters = p.split(line, '\t');
            const lastIndex = characters.length - 1;
            const lastCharacter = characters[lastIndex];
            for (let i = 0; i < lastIndex; i += 1) {
                this.addEdge(characters[i], lastCharacter);
            }
        }
        this.averagePosition = p.createVector();
    }
    toString() {
        let s = '';
        for (let i = 0, len = this.edges.length; i < len; i += 1) {
            s += this.edges.array[i] + '\n';
        }
        return s;
    }
    step() {
        this.edges.step();
        this.nodes.step();
        this.nodes.roundRobin(this.applyRepulsion);
    }
    draw() {
        this.p.stroke(0, 0, 0);
        this.edges.draw();
        this.nodes.draw();
    }
    addEdge(predecessorCharacter, successorCharacter) {
        const predecessorKanji = this.getOrCreateNode(predecessorCharacter);
        const successorKanji = this.getOrCreateNode(successorCharacter);
        // Check if already added
        for (let i = 0; i < this.edges.length; i += 1) {
            const copmaringEdge = this.edges.get(i);
            if (predecessorKanji === copmaringEdge.nodeA && successorKanji === copmaringEdge.nodeB)
                return;
        }
        this.edges.push(new KanjiEdge(this.p, predecessorKanji, successorKanji));
    }
    getAveragePosition() {
        this.averagePosition.set(0, 0);
        this.nodes.loop((body) => {
            this.averagePosition.add(body.position);
        });
        this.averagePosition.div(Math.max(1, this.nodes.length));
        return this.averagePosition;
    }
    getOrCreateNode(character) {
        const existingKanji = this.nodeMap.get(character);
        if (existingKanji)
            return existingKanji;
        const kanji = new KanjiNode(this.p, character, this.font);
        this.nodeMap.set(character, kanji);
        this.nodes.push(kanji);
        return kanji;
    }
}

p5.disableFriendlyErrors = true;
const SKETCH_NAME = 'KanjiNetwork';
new p5();
const sketch = (p) => {
    // ---- constants
    const backgroundColor = p.color(248);
    // ---- variables
    let currentFont;
    const mousePosition = p.createVector();
    let kanjiData;
    let kanjiGraph;
    // ---- Setup & Draw etc.
    p.preload = () => {
        // currentFont = p.loadFont('./assets/mplus-1p-regular.ttf');
        currentFont = p.loadFont('./assets/mplus-1p-light.ttf');
        kanjiData = p.loadStrings('./assets/kanji-data.txt');
    };
    p.setup = () => {
        window.noCanvas();
        p.createScalableCanvas(ScalableCanvasTypes.SQUARE640x640);
        kanjiGraph = new KanjiGraph(p, kanjiData, currentFont);
        p.rectMode(p.CENTER);
        p.textFont(currentFont, 20);
        p.textAlign(p.CENTER, p.CENTER);
        p.fill(0, 0, 0);
        p.imageMode(p.CENTER);
        p.frameRate(30);
    };
    p.draw = () => {
        p.background(backgroundColor);
        p.scalableCanvas.scale();
        p.translate(0.5 * p.nonScaledWidth, 0.5 * p.nonScaledHeight);
        p.scale(0.5);
        kanjiGraph.step();
        kanjiGraph.draw();
    };
    p.windowResized = () => {
        p.resizeScalableCanvas();
        p.background(255);
    };
    p.mouseMoved = () => {
        if (!p.scalableCanvas)
            return;
        mousePosition.set(p.scalableCanvas.getNonScaledValueOf(p.mouseX), p.scalableCanvas.getNonScaledValueOf(p.mouseY));
    };
    p.mousePressed = () => {
    };
    p.touchMoved = () => {
        if (p.mouseX < 0)
            return;
        if (p.mouseY > p.width)
            return;
        if (p.mouseY < 0)
            return;
        if (p.mouseY > p.height)
            return;
        return false;
    };
};
new p5exClass(sketch, SKETCH_NAME);

}());
//# sourceMappingURL=sketch.js.map
