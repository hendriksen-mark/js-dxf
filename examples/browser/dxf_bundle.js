require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class AppId extends DatabaseObject {
    constructor(name) {
        super(["AcDbSymbolTableRecord", "AcDbRegAppTableRecord"]);
        this.name = name;
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-6E3140E9-E560-4C77-904E-480382F0553E
        await manager.push(0, "APPID");
        await super.tags(manager);
        await manager.push(2, this.name);
        /* No flags set */
        await manager.push(70, 0);
    }
}

module.exports = AppId;

},{"./DatabaseObject":8,"./TagsManager":27}],3:[function(require,module,exports){
const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class Arc extends DatabaseObject {
    /**
     * @param {number} x - Center x
     * @param {number} y - Center y
     * @param {number} r - radius
     * @param {number} startAngle - degree
     * @param {number} endAngle - degree
     */
    constructor(x, y, r, startAngle, endAngle) {
        super(["AcDbEntity", "AcDbCircle"]);
        this.x = x;
        this.y = y;
        this.r = r;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-0B14D8F1-0EBA-44BF-9108-57D8CE614BC8
        await manager.push(0, "ARC");
        await super.tags(manager);
        await manager.push(8, this.layer.name);
        await manager.point(this.x, this.y);
        await manager.push(40, this.r);
        await manager.push(100, "AcDbArc");
        await manager.push(50, this.startAngle);
        await manager.push(51, this.endAngle);
    }
}

module.exports = Arc;

},{"./DatabaseObject":8,"./TagsManager":27}],4:[function(require,module,exports){
const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class Block extends DatabaseObject {
    constructor(name) {
        super(["AcDbEntity", "AcDbBlockBegin"]);
        this.name = name;
        this.end = new DatabaseObject(["AcDbEntity", "AcDbBlockEnd"]);
        this.recordHandle = null;
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-66D32572-005A-4E23-8B8B-8726E8C14302
        await manager.push(0, "BLOCK");
        await super.tags(manager);
        await manager.push(2, this.name);
        /* No flags set */
        await manager.push(70, 0);
        /* Block top left corner */
        await manager.point(0, 0);
        await manager.push(3, this.name);
        /* xref path name - nothing */
        await manager.push(1, "");

        //XXX dump content here

        await manager.push(0, "ENDBLK");
        await this.end.tags(manager);
    }
}

module.exports = Block;

},{"./DatabaseObject":8,"./TagsManager":27}],5:[function(require,module,exports){
const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class BlockRecord extends DatabaseObject {
    constructor(name) {
        super(["AcDbSymbolTableRecord", "AcDbBlockTableRecord"]);
        this.name = name;
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-A1FD1934-7EF5-4D35-A4B0-F8AE54A9A20A
        await manager.push(0, "BLOCK_RECORD");
        await super.tags(manager);
        await manager.push(2, this.name);
        /* No flags set */
        await manager.push(70, 0);
        /* Block explodability */
        await manager.push(280, 0);
        /* Block scalability */
        await manager.push(281, 1);
    }
}

module.exports = BlockRecord;

},{"./DatabaseObject":8,"./TagsManager":27}],6:[function(require,module,exports){
const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class Circle extends DatabaseObject {
    /**
     * @param {number} x - Center x
     * @param {number} y - Center y
     * @param {number} r - radius
     */
    constructor(x, y, r) {
        super(["AcDbEntity", "AcDbCircle"]);
        this.x = x;
        this.y = y;
        this.r = r;
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-8663262B-222C-414D-B133-4A8506A27C18
        await manager.push(0, "CIRCLE");
        await super.tags(manager);
        await manager.push(8, this.layer.name);
        await manager.point(this.x, this.y);
        await manager.push(40, this.r);
    }
}

module.exports = Circle;

},{"./DatabaseObject":8,"./TagsManager":27}],7:[function(require,module,exports){
const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class Cylinder extends DatabaseObject {
    /**
     * @param {number} x - Center x
     * @param {number} y - Center y
     * @param {number} z - Center z
     * @param {number} r - radius
     * @param {number} thickness - thickness
     * @param {number} extrusionDirectionX - Extrusion Direction x
     * @param {number} extrusionDirectionY - Extrusion Direction y
     * @param {number} extrusionDirectionZ - Extrusion Direction z
     */
    constructor(
        x,
        y,
        z,
        r,
        thickness,
        extrusionDirectionX,
        extrusionDirectionY,
        extrusionDirectionZ
    ) {
        super(["AcDbEntity", "AcDbCircle"]);
        this.x = x;
        this.y = y;
        this.z = z;
        this.r = r;
        this.thickness = thickness;
        (this.extrusionDirectionX = extrusionDirectionX),
            (this.extrusionDirectionY = extrusionDirectionY),
            (this.extrusionDirectionZ = extrusionDirectionZ);
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-8663262B-222C-414D-B133-4A8506A27C18
        await manager.push(0, "CIRCLE");
        await super.tags(manager);
        await manager.push(8, this.layer.name);
        await manager.point(this.x, this.y, this.z);
        await manager.push(40, this.r);
        await manager.push(39, this.thickness);
        await manager.push(210, this.extrusionDirectionX);
        await manager.push(220, this.extrusionDirectionY);
        await manager.push(230, this.extrusionDirectionZ);
    }
}

module.exports = Cylinder;

},{"./DatabaseObject":8,"./TagsManager":27}],8:[function(require,module,exports){
const Handle = require("./Handle");
const TagsManager = require("./TagsManager");

class DatabaseObject {
    constructor(subclass = null) {
        this.handle = Handle.next();
        this.ownerObjectHandle = "0";
        this.subclassMarkers = [];
        if (subclass) {
            if (Array.isArray(subclass)) {
                this.subclassMarkers.push(...subclass);
            } else {
                this.subclassMarkers.push(subclass);
            }
        }
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        await manager.push(5, this.handle);
        await manager.push(330, this.ownerObjectHandle);

        for (const s of this.subclassMarkers) {
            await manager.push(100, s);
        }
    }
}

module.exports = DatabaseObject;

},{"./Handle":13,"./TagsManager":27}],9:[function(require,module,exports){
const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class Dictionary extends DatabaseObject {
    constructor() {
        super("AcDbDictionary");
        this.children = {};
    }

    /**
     *
     * @param {*} name
     * @param {DatabaseObject} dictionary
     */
    addChildDictionary(name, dictionary) {
        dictionary.ownerObjectHandle = this.handle;
        this.children[name] = dictionary;
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-40B92C63-26F0-485B-A9C2-B349099B26D0
        await manager.push(0, "DICTIONARY");
        await super.tags(manager);
        /* Duplicate record cloning flag - keep existing */
        await manager.push(281, 1);

        const entries = Object.entries(this.children);
        for (const entry of entries) {
            const [name, dic] = entry;
            await manager.push(3, name);
            await manager.push(350, dic.handle);
        }

        const children = Object.values(this.children);
        for (const c of children) {
            await c.tags(manager);
        }
    }
}

module.exports = Dictionary;

},{"./DatabaseObject":8,"./TagsManager":27}],10:[function(require,module,exports){
const DatabaseObject = require("./DatabaseObject");
const Table = require("./Table");
const TagsManager = require("./TagsManager");

class DimStyleTable extends Table {
    constructor(name) {
        super(name);
        this.subclassMarkers.push("AcDbDimStyleTable");
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-F2FAD36F-0CE3-4943-9DAD-A9BCD2AE81DA
        await manager.push(0, "TABLE");
        await manager.push(2, this.name);
        await DatabaseObject.prototype.tags.call(this, manager);
        await manager.push(70, this.elements.length);
        /* DIMTOL */
        await manager.push(71, 1);

        for (const e of this.elements) {
            await e.tags(manager);
        }

        await manager.push(0, "ENDTAB");
    }
}

module.exports = DimStyleTable;

},{"./DatabaseObject":8,"./Table":26,"./TagsManager":27}],11:[function(require,module,exports){
const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class Ellipse extends DatabaseObject {
    /**
     * Creates an ellipse.
     * @param {number} x - Center x
     * @param {number} y - Center y
     * @param {number} majorAxisX - Endpoint x of major axis, relative to center
     * @param {number} majorAxisY - Endpoint y of major axis, relative to center
     * @param {number} axisRatio - Ratio of minor axis to major axis
     * @param {number} startAngle - Start angle
     * @param {number} endAngle - End angle
     */
    constructor(x, y, majorAxisX, majorAxisY, axisRatio, startAngle, endAngle) {
        super(["AcDbEntity", "AcDbEllipse"]);
        this.x = x;
        this.y = y;
        this.majorAxisX = majorAxisX;
        this.majorAxisY = majorAxisY;
        this.axisRatio = axisRatio;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-107CB04F-AD4D-4D2F-8EC9-AC90888063AB
        await manager.push(0, "ELLIPSE");
        await super.tags(manager);
        await manager.push(8, this.layer.name);
        await manager.point(this.x, this.y);
        await manager.push(11, this.majorAxisX);
        await manager.push(21, this.majorAxisY);
        await manager.push(31, 0);

        await manager.push(40, this.axisRatio);
        await manager.push(41, this.startAngle);
        await manager.push(42, this.endAngle);
    }
}

module.exports = Ellipse;

},{"./DatabaseObject":8,"./TagsManager":27}],12:[function(require,module,exports){
const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class Face extends DatabaseObject {
    constructor(x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4) {
        super(["AcDbEntity", "AcDbFace"]);
        this.x1 = x1;
        this.y1 = y1;
        this.z1 = z1;
        this.x2 = x2;
        this.y2 = y2;
        this.z2 = z2;
        this.x3 = x3;
        this.y3 = y3;
        this.z3 = z3;
        this.x4 = x4;
        this.y4 = y4;
        this.z4 = z4;
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-747865D5-51F0-45F2-BEFE-9572DBC5B151
        await manager.push(0, "3DFACE");
        await super.tags(manager);
        await manager.push(8, this.layer.name);
        await manager.point(this.x1, this.y1, this.z1);

        await manager.push(11, this.x2);
        await manager.push(21, this.y2);
        await manager.push(31, this.z2);

        await manager.push(12, this.x3);
        await manager.push(22, this.y3);
        await manager.push(32, this.z3);

        await manager.push(13, this.x4);
        await manager.push(23, this.y4);
        await manager.push(33, this.z4);
    }
}

module.exports = Face;

},{"./DatabaseObject":8,"./TagsManager":27}],13:[function(require,module,exports){
class Handle {
    static seed = 0;

    static next() {
        return (++Handle.seed).toString(16).toUpperCase();
    }

    static peek() {
        return (Handle.seed + 1).toString(16).toUpperCase();
    }

    static reset() {
        Handle.seed = 0;
    }
}

module.exports = Handle;

},{}],14:[function(require,module,exports){
const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");
const {
    buildHelixControlPoints,
    createUniformKnotsLegacy,
} = require("./HelixSplineSupport");

const DEFAULT_MAJOR_RELEASE_NUMBER = 29;
const DEFAULT_MAINTENANCE_RELEASE_NUMBER = 63;
const DEFAULT_SEGMENTS_PER_TURN = 12;

class Helix extends DatabaseObject {
    /**
     * Creates a helix entity backed by spline data.
     * @param {[number, number, number]} axisBasePoint - A point on the helix axis
     * @param {[number, number, number]} startPoint - The helix start point
     * @param {[number, number, number]} axisVector - The helix axis direction vector
     * @param {number} turns - Number of turns
     * @param {number} turnHeight - Height per turn
     * @param {number} handedness - 0 = left, 1 = right
     * @param {number} constrainType - 0 = turn height, 1 = turns, 2 = height
     * @param {number} majorReleaseNumber - AcDbHelix major release number
     * @param {number} maintenanceReleaseNumber - AcDbHelix maintenance release number
     * @param {number} segmentsPerTurn - Number of spline control points generated per turn
     */
    constructor(
        axisBasePoint,
        startPoint,
        axisVector,
        turns,
        turnHeight,
        handedness = 1,
        constrainType = 0,
        majorReleaseNumber = DEFAULT_MAJOR_RELEASE_NUMBER,
        maintenanceReleaseNumber = DEFAULT_MAINTENANCE_RELEASE_NUMBER,
        segmentsPerTurn = DEFAULT_SEGMENTS_PER_TURN
    ) {
        super(["AcDbEntity", "AcDbSpline"]);

        if (turns <= 0) {
            throw new Error("Helix turns must be greater than zero.");
        }

        if (segmentsPerTurn < 1) {
            throw new Error("Helix segmentsPerTurn must be greater than zero.");
        }

        this.axisBasePoint = toPoint3d(axisBasePoint, "axisBasePoint");
        this.startPoint = toPoint3d(startPoint, "startPoint");
        this.axisVector = toPoint3d(axisVector, "axisVector");
        this.turns = turns;
        this.turnHeight = turnHeight;
        this.handedness = handedness;
        this.constrainType = constrainType;
        this.majorReleaseNumber = majorReleaseNumber;
        this.maintenanceReleaseNumber = maintenanceReleaseNumber;
        this.degree = 3;
        this.type = 0;

        const splineData = buildHelixControlPoints({
            axisBasePoint: this.axisBasePoint,
            startPoint: this.startPoint,
            axisVector: this.axisVector,
            turns: this.turns,
            turnHeight: this.turnHeight,
            handedness: this.handedness,
            degree: this.degree,
            segmentsPerTurn,
        });

        this.radius = splineData.radius;
        this.controlPoints = splineData.controlPoints;
        this.knots = createUniformKnotsLegacy(
            this.controlPoints.length,
            this.degree
        );
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-76DB3ABF-3C8C-47D1-8AFB-72942D9AE1FF
        await manager.push(0, "HELIX");
        await super.tags(manager);
        await manager.push(8, this.layer.name);

        await manager.push(210, 0.0);
        await manager.push(220, 0.0);
        await manager.push(230, 1.0);

        await manager.push(70, this.type);
        await manager.push(71, this.degree);
        await manager.push(72, this.knots.length);
        await manager.push(73, this.controlPoints.length);
        await manager.push(74, 0);

        await manager.push(42, 1e-7);
        await manager.push(43, 1e-7);
        await manager.push(44, 1e-10);

        for (const knot of this.knots) {
            await manager.push(40, knot);
        }

        for (const point of this.controlPoints) {
            await manager.point(point[0], point[1], point[2]);
        }

        await manager.push(100, "AcDbHelix");
        await manager.push(90, this.majorReleaseNumber);
        await manager.push(91, this.maintenanceReleaseNumber);

        await manager.push(10, this.axisBasePoint[0]);
        await manager.push(20, this.axisBasePoint[1]);
        await manager.push(30, this.axisBasePoint[2]);

        await manager.push(11, this.startPoint[0]);
        await manager.push(21, this.startPoint[1]);
        await manager.push(31, this.startPoint[2]);

        await manager.push(12, this.axisVector[0]);
        await manager.push(22, this.axisVector[1]);
        await manager.push(32, this.axisVector[2]);

        await manager.push(40, this.radius);
        await manager.push(41, this.turns);
        await manager.push(42, this.turnHeight);
        await manager.push(290, this.handedness);
        await manager.push(280, this.constrainType);
    }
}

function toPoint3d(point, name) {
    if (!Array.isArray(point) || point.length !== 3) {
        throw new Error(`${name} must be a 3D point in the form [x, y, z].`);
    }

    return [point[0], point[1], point[2]];
}

module.exports = Helix;

},{"./DatabaseObject":8,"./HelixSplineSupport":16,"./TagsManager":27}],15:[function(require,module,exports){
const DatabaseObject = require("./DatabaseObject");
const {
    buildHelixControlPoints,
    createUniformKnotsLegacy,
} = require("./HelixSplineSupport");

const DEFAULT_MAJOR_RELEASE_NUMBER = 29;
const DEFAULT_MAINTENANCE_RELEASE_NUMBER = 63;
const DEFAULT_SEGMENTS_PER_TURN = 72;

class HelixLean extends DatabaseObject {
    /**
     * Lean HELIX writer that still emits required spline data,
     * but with fewer control points than the full HELIX implementation.
     */
    constructor(
        axisBasePoint,
        startPoint,
        axisVector,
        turns,
        turnHeight,
        handedness = 1,
        constrainType = 0,
        majorReleaseNumber = DEFAULT_MAJOR_RELEASE_NUMBER,
        maintenanceReleaseNumber = DEFAULT_MAINTENANCE_RELEASE_NUMBER,
        segmentsPerTurn = DEFAULT_SEGMENTS_PER_TURN
    ) {
        super(["AcDbEntity", "AcDbSpline"]);

        const normalized = normalizeHelixLeanArgs({
            turns,
            turnHeight,
            handedness,
            constrainType,
            majorReleaseNumber,
            maintenanceReleaseNumber,
            segmentsPerTurn,
        });

        this.axisBasePoint = toPoint3d(axisBasePoint, "axisBasePoint");
        this.startPoint = toPoint3d(startPoint, "startPoint");
        this.axisVector = toPoint3d(axisVector, "axisVector");
        this.turns = normalized.turns;
        this.turnHeight = normalized.turnHeight;
        this.handedness = normalized.handedness;
        this.constrainType = normalized.constrainType;
        this.majorReleaseNumber = normalized.majorReleaseNumber;
        this.maintenanceReleaseNumber = normalized.maintenanceReleaseNumber;
        this.degree = 1;
        this.type = 0;

        const splineData = buildHelixControlPoints({
            axisBasePoint: this.axisBasePoint,
            startPoint: this.startPoint,
            axisVector: this.axisVector,
            turns: this.turns,
            turnHeight: this.turnHeight,
            handedness: this.handedness,
            degree: this.degree,
            segmentsPerTurn: normalized.segmentsPerTurn,
        });

        this.radius = splineData.radius;
        this.controlPoints = splineData.controlPoints;
        this.knots = createUniformKnotsLegacy(
            this.controlPoints.length,
            this.degree
        );
    }

    async tags(manager) {
        await manager.push(0, "HELIX");
        await super.tags(manager);
        await manager.push(8, this.layer.name);

        await manager.push(210, 0.0);
        await manager.push(220, 0.0);
        await manager.push(230, 1.0);

        await manager.push(70, this.type);
        await manager.push(71, this.degree);
        await manager.push(72, this.knots.length);
        await manager.push(73, this.controlPoints.length);
        await manager.push(74, 0);

        await manager.push(42, 1e-7);
        await manager.push(43, 1e-7);
        await manager.push(44, 1e-10);

        for (const knot of this.knots) {
            await manager.push(40, knot);
        }

        for (const point of this.controlPoints) {
            await manager.push(10, point[0]);
            await manager.push(20, point[1]);
            await manager.push(30, point[2]);
        }

        await manager.push(100, "AcDbHelix");
        await manager.push(90, this.majorReleaseNumber);
        await manager.push(91, this.maintenanceReleaseNumber);

        await manager.push(10, this.axisBasePoint[0]);
        await manager.push(20, this.axisBasePoint[1]);
        await manager.push(30, this.axisBasePoint[2]);

        await manager.push(11, this.startPoint[0]);
        await manager.push(21, this.startPoint[1]);
        await manager.push(31, this.startPoint[2]);

        await manager.push(12, this.axisVector[0]);
        await manager.push(22, this.axisVector[1]);
        await manager.push(32, this.axisVector[2]);

        await manager.push(40, this.radius);
        await manager.push(41, this.turns);
        await manager.push(42, this.turnHeight);

        await manager.push(290, this.handedness);
        await manager.push(280, this.constrainType);
    }
}

function toPoint3d(point, name) {
    if (!Array.isArray(point) || point.length !== 3) {
        throw new Error(`${name} must be a 3D point in the form [x, y, z].`);
    }

    return [point[0], point[1], point[2]];
}

function normalizeHelixLeanArgs({
    turns,
    turnHeight,
    handedness,
    constrainType,
    majorReleaseNumber,
    maintenanceReleaseNumber,
    segmentsPerTurn,
}) {
    const looksLegacyOrdering =
        Number.isFinite(turns) &&
        Number.isFinite(turnHeight) &&
        Number.isFinite(handedness) &&
        ![0, 1].includes(handedness) &&
        [0, 1, 2].includes(constrainType);

    let resolvedTurns = turns;
    let resolvedTurnHeight = turnHeight;
    let resolvedHandedness = handedness;
    let resolvedConstrainType = constrainType;
    let resolvedMajorReleaseNumber = majorReleaseNumber;
    let resolvedMaintenanceReleaseNumber = maintenanceReleaseNumber;
    let resolvedSegmentsPerTurn = segmentsPerTurn;

    if (looksLegacyOrdering) {
        resolvedTurns = turnHeight;
        resolvedTurnHeight = handedness;
        resolvedHandedness = constrainType;
        resolvedConstrainType = majorReleaseNumber;
        resolvedMajorReleaseNumber = maintenanceReleaseNumber;
        resolvedMaintenanceReleaseNumber =
            Number.isFinite(segmentsPerTurn)
                ? segmentsPerTurn
                : DEFAULT_MAINTENANCE_RELEASE_NUMBER;
        resolvedSegmentsPerTurn = DEFAULT_SEGMENTS_PER_TURN;
    }

    if (!Number.isFinite(resolvedTurns) || resolvedTurns <= 0) {
        throw new Error("Helix turns must be greater than zero.");
    }

    if (!Number.isFinite(resolvedTurnHeight)) {
        throw new Error("Helix turnHeight must be a finite number.");
    }

    if (![0, 1].includes(resolvedHandedness)) {
        throw new Error("Helix handedness must be 0 (left) or 1 (right).");
    }

    if (![0, 1, 2].includes(resolvedConstrainType)) {
        throw new Error(
            "Helix constrainType must be 0 (turn height), 1 (turns), or 2 (height)."
        );
    }

    if (!Number.isFinite(resolvedSegmentsPerTurn) || resolvedSegmentsPerTurn < 1) {
        throw new Error("Helix segmentsPerTurn must be greater than zero.");
    }

    return {
        turns: resolvedTurns,
        turnHeight: resolvedTurnHeight,
        handedness: resolvedHandedness,
        constrainType: resolvedConstrainType,
        majorReleaseNumber: resolvedMajorReleaseNumber,
        maintenanceReleaseNumber: resolvedMaintenanceReleaseNumber,
        segmentsPerTurn: resolvedSegmentsPerTurn,
    };
}

module.exports = HelixLean;

},{"./DatabaseObject":8,"./HelixSplineSupport":16}],16:[function(require,module,exports){
const TAU = Math.PI * 2;

function subtractVectors(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function addVectors(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function scaleVector(vector, scalar) {
    return [vector[0] * scalar, vector[1] * scalar, vector[2] * scalar];
}

function dotProduct(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function crossProduct(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ];
}

function magnitude(vector) {
    return Math.sqrt(dotProduct(vector, vector));
}

function normalizeVector(vector, name) {
    const length = magnitude(vector);

    if (length === 0) {
        throw new Error(`${name} must not be a zero-length vector.`);
    }

    return scaleVector(vector, 1 / length);
}

function buildHelixControlPoints({
    axisBasePoint,
    startPoint,
    axisVector,
    turns,
    turnHeight,
    handedness,
    degree,
    segmentsPerTurn,
}) {
    const axisDirection = normalizeVector(axisVector, "axisVector");
    const startOffset = subtractVectors(startPoint, axisBasePoint);
    const startHeight = dotProduct(startOffset, axisDirection);
    const startHeightOffset = scaleVector(axisDirection, startHeight);
    const radialVector = subtractVectors(startOffset, startHeightOffset);
    const radius = magnitude(radialVector);

    if (radius === 0) {
        throw new Error("Helix startPoint must not lie on the helix axis.");
    }

    const radialDirection = normalizeVector(radialVector, "startPoint");
    const perpendicularDirection = normalizeVector(
        crossProduct(axisDirection, radialDirection),
        "helix perpendicular direction"
    );

    const points = [];
    const pointCount = Math.max(
        Math.ceil(turns * segmentsPerTurn) + 1,
        degree + 1
    );

    const handednessSign = handedness === 0 ? -1 : 1;
    const totalAngle = TAU * turns;

    for (let i = 0; i < pointCount; i++) {
        const ratio = pointCount === 1 ? 0 : i / (pointCount - 1);
        const angle = totalAngle * ratio;
        const radialComponent = addVectors(
            scaleVector(radialDirection, Math.cos(angle)),
            scaleVector(perpendicularDirection, Math.sin(angle) * handednessSign)
        );
        const height = startHeight + turnHeight * angle / TAU;
        const axisComponent = scaleVector(axisDirection, height);
        const point = addVectors(
            axisBasePoint,
            addVectors(scaleVector(radialComponent, radius), axisComponent)
        );

        points.push(point);
    }

    return {
        radius,
        controlPoints: points,
    };
}

function createUniformKnotsLegacy(controlPointCount, degree) {
    const knots = [];

    for (let i = 0; i < degree + 1; i++) {
        knots.push(0);
    }

    for (let i = 1; i < controlPointCount - degree; i++) {
        knots.push(i);
    }

    for (let i = 0; i < degree + 1; i++) {
        knots.push(controlPointCount - degree);
    }

    return knots;
}

module.exports = {
    buildHelixControlPoints,
    createUniformKnotsLegacy,
};

},{}],17:[function(require,module,exports){
const DatabaseObject = require("./DatabaseObject");

const LAYER_NAME_BANNED_REGEX = /<|>|\/|\\|"|:|;|\?|\*|\||=|'/g;

function isInvalidLayerName(name) {
    return LAYER_NAME_BANNED_REGEX.test(name);
}

class Layer extends DatabaseObject {
    constructor(name, colorNumber, lineTypeName = null) {
        if (isInvalidLayerName(name)) {
            throw new Error(
                `Layer name ${name} cannot include the following characters: < > / \ " : ; ? * | = ’`
            );
        }

        super(["AcDbSymbolTableRecord", "AcDbLayerTableRecord"]);
        this.name = name;
        this.colorNumber = colorNumber;
        this.lineTypeName = lineTypeName;
        this.shapes = [];
        this.trueColor = -1;
        this.plotStyleNameHandle = "0";
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-D94802B0-8BE8-4AC9-8054-17197688AFDB
        await manager.push(0, "LAYER");
        await super.tags(manager);
        await manager.push(2, this.name);

        if (this.trueColor !== -1) await manager.push(420, this.trueColor);
        else await manager.push(62, this.colorNumber);

        await manager.push(70, 0);

        if (this.lineTypeName) await manager.push(6, this.lineTypeName);

        /* Hard-pointer handle to PlotStyleName object; seems mandatory, but any value seems OK,
         * including 0.
         */
        await manager.push(390, this.plotStyleNameHandle);
    }

    setTrueColor(color) {
        this.trueColor = color;
    }

    /**
     * @param {Space} space
     * @param {TagsManager} manager
     * @param {Shape} shape
     * @returns {Promise<void>}
     */
    async writeShape(space, manager, shape) {
      shape.layer = this;
      shape.ownerObjectHandle = space.handle;
      await shape.tags(manager);
  }
}

module.exports = Layer;

},{"./DatabaseObject":8}],18:[function(require,module,exports){
const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class Line extends DatabaseObject {
    constructor(x1, y1, x2, y2) {
        super(["AcDbEntity", "AcDbLine"]);
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-FCEF5726-53AE-4C43-B4EA-C84EB8686A66
        await manager.push(0, "LINE");
        await super.tags(manager);
        await manager.push(8, this.layer.name);
        await manager.point(this.x1, this.y1);

        await manager.push(11, this.x2);
        await manager.push(21, this.y2);
        await manager.push(31, 0);
    }
}

module.exports = Line;

},{"./DatabaseObject":8,"./TagsManager":27}],19:[function(require,module,exports){
const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class Line3d extends DatabaseObject {
    constructor(x1, y1, z1, x2, y2, z2) {
        super(["AcDbEntity", "AcDbLine"]);
        this.x1 = x1;
        this.y1 = y1;
        this.z1 = z1;
        this.x2 = x2;
        this.y2 = y2;
        this.z2 = z2;
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-FCEF5726-53AE-4C43-B4EA-C84EB8686A66
        await manager.push(0, "LINE");
        await super.tags(manager);
        await manager.push(8, this.layer.name);
        await manager.point(this.x1, this.y1, this.z1);

        await manager.push(11, this.x2);
        await manager.push(21, this.y2);
        await manager.push(31, this.z2);
    }
}

module.exports = Line3d;

},{"./DatabaseObject":8,"./TagsManager":27}],20:[function(require,module,exports){
const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class LineType extends DatabaseObject {
  /**
   * @param {string} name
   * @param {string} description
   * @param {array} elements - if elem > 0 it is a line, if elem < 0 it is gap, if elem == 0.0 it is a
   */
  constructor(name, description, elements) {
    super(["AcDbSymbolTableRecord", "AcDbLinetypeTableRecord"]);
    this.name = name;
    this.description = description;
    this.elements = elements;
  }

  /**
   * @param {TagsManager} manager
   * @returns {Promise<void>}
   */
  async tags(manager) {
    //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-F57A316C-94A2-416C-8280-191E34B182AC
    await manager.push(0, "LTYPE");
    await super.tags(manager);
    await manager.push(2, this.name);
    await manager.push(3, this.description);
    await manager.push(70, 0);
    await manager.push(72, 65);
    await manager.push(73, this.elements.length);
    await manager.push(40, this.getElementsSum());

    for (const element of this.elements) {
      await manager.push(49, element);
      await manager.push(74, 0);
    }
  }

  getElementsSum() {
    return this.elements.reduce((sum, element) => {
      return sum + Math.abs(element);
    }, 0);
  }
}

module.exports = LineType;

},{"./DatabaseObject":8,"./TagsManager":27}],21:[function(require,module,exports){
const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class Mesh extends DatabaseObject {
    /**
     * @param {array} vertices - Array of vertices like [ [x1, y1, z3], [x2, y2, z3]... ]
     * @param {array} faceIndices - Array of face indices like [ [v1, v2, v3]... ]
     */
    constructor(vertices, faceIndices) {
        super(["AcDbEntity"]);
        this.vertices = vertices;
        this.faceIndices = faceIndices;
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-4B9ADA67-87C8-4673-A579-6E4C76FF7025
        await manager.push(0, "MESH");
        await super.tags(manager);
        await manager.push(67, 0);
        await manager.push(8, this.layer.name);
        await manager.push(6, "ByLayer");
        await manager.push(370, 25);
        await manager.push(48, 1.0);
        await manager.push(60, 0);
        // Manually add subclass here as AutoCad seems picky about its position
        await manager.push(100, "AcDbSubDMesh");
        await manager.push(71, 2);
        await manager.push(72, 0);
        await manager.push(91, 0);
        await manager.push(92, this.vertices.length);

        for (const [x, y, z] of this.vertices) {
            await manager.point(x, y, z);
        }

        // Face index count plus each index
        const faceListCount = this.faceIndices.reduce(
            (total, indices) => total + indices.length + 1,
            0
        );

        await manager.push(93, faceListCount);

        for (const indices of this.faceIndices) {
            await manager.push(90, indices.length);

            for (const index of indices) {
                await manager.push(90, index);
            }
        }

        await manager.push(90, 0);
    }
}

module.exports = Mesh;

},{"./DatabaseObject":8,"./TagsManager":27}],22:[function(require,module,exports){
const DatabaseObject = require('./DatabaseObject');
const TagsManager = require('./TagsManager');

class Point extends DatabaseObject {
  constructor(x, y, z = 0) {
    super(['AcDbEntity', 'AcDbPoint']);
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * @param {TagsManager} manager
   * @returns {Promise<void>}
   */
  async tags(manager) {
    //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-9C6AD32D-769D-4213-85A4-CA9CCB5C5317
    await manager.push(0, 'POINT');
    await super.tags(manager);
    await manager.push(8, this.layer.name);
    await manager.point(this.x, this.y, this.z);
  }
}

module.exports = Point;

},{"./DatabaseObject":8,"./TagsManager":27}],23:[function(require,module,exports){
const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class Polyline extends DatabaseObject {
    /**
     * @param {array} points - Array of points like [ [x1, y1], [x2, y2, bulge]... ]
     * @param {boolean} closed
     * @param {number} startWidth
     * @param {number} endWidth
     */
    constructor(points, closed = false, startWidth = 0, endWidth = 0) {
        super(["AcDbEntity", "AcDbPolyline"]);
        this.points = points;
        this.closed = closed;
        this.startWidth = startWidth;
        this.endWidth = endWidth;
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-748FC305-F3F2-4F74-825A-61F04D757A50
        await manager.push(0, "LWPOLYLINE");
        await super.tags(manager);
        await manager.push(8, this.layer.name);
        await manager.push(6, "ByLayer");
        await manager.push(62, 256);
        await manager.push(370, -1);
        await manager.push(90, this.points.length);
        await manager.push(70, this.closed ? 1 : 0);

        for (const point of this.points) {
            const [x, y, z] = point;
            await manager.push(10, x);
            await manager.push(20, y);
            if (this.startWidth !== 0 || this.endWidth !== 0) {
                await manager.push(40, this.startWidth);
                await manager.push(41, this.endWidth);
            }
            if (z !== undefined) await manager.push(42, z);
        }
    }
}

module.exports = Polyline;

},{"./DatabaseObject":8,"./TagsManager":27}],24:[function(require,module,exports){
const DatabaseObject = require("./DatabaseObject");
const Handle = require("./Handle");
const Vertex = require("./Vertex");
const TagsManager = require("./TagsManager");

class Polyline3d extends DatabaseObject {
    /**
     * @param {[number, number, number][]} points - Array of points like [ [x1, y1, z1], [x2, y2, z2]... ]
     */
    constructor(points) {
        super(["AcDbEntity", "AcDb3dPolyline"]);
        this.verticies = points.map((point) => {
            const [x, y, z] = point;
            const vertex = new Vertex(x, y, z);
            vertex.ownerObjectHandle = this.handle;
            return vertex;
        });
        this.seqendHandle = Handle.next();
    }
    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-ABF6B778-BE20-4B49-9B58-A94E64CEFFF3
        await manager.push(0, "POLYLINE");
        await super.tags(manager);
        await manager.push(8, this.layer.name);
        await manager.push(66, 1);
        await manager.push(70, 0);
        await manager.point(0, 0);

        for (const vertex of this.verticies) {
            vertex.layer = this.layer;
            await vertex.tags(manager);
        }

        await manager.push(0, "SEQEND");
        await manager.push(5, this.seqendHandle);
        await manager.push(100, "AcDbEntity");
        await manager.push(8, this.layer.name);
    }
}

module.exports = Polyline3d;

},{"./DatabaseObject":8,"./Handle":13,"./TagsManager":27,"./Vertex":30}],25:[function(require,module,exports){
const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class Spline extends DatabaseObject {
    /**
     * Creates a spline. See https://www.autodesk.com/techpubs/autocad/acad2000/dxf/spline_dxf_06.htm
     * @param {[Array]} controlPoints - Array of control points like [ [x1, y1], [x2, y2]... ]
     * @param {number} degree - Degree of spline: 2 for quadratic, 3 for cubic. Default is 3
     * @param {[number]} knots - Knot vector array. If null, will use a uniform knot vector. Default is null
     * @param {[number]} weights - Control point weights. If provided, must be one weight for each control point. Default is null
     * @param {[Array]} fitPoints - Array of fit points like [ [x1, y1], [x2, y2]... ]
     */
    constructor(
        controlPoints,
        degree = 3,
        knots = null,
        weights = null,
        fitPoints = []
    ) {
        super(["AcDbEntity", "AcDbSpline"]);
        if (controlPoints.length < degree + 1) {
            throw new Error(
                `For degree ${degree} spline, expected at least ${
                    degree + 1
                } control points, but received only ${controlPoints.length}`
            );
        }

        if (knots == null) {
            // Examples:
            // degree 2, 3 pts:  0 0 0 1 1 1
            // degree 2, 4 pts:  0 0 0 1 2 2 2
            // degree 2, 5 pts:  0 0 0 1 2 3 3 3
            // degree 3, 4 pts:  0 0 0 0 1 1 1 1
            // degree 3, 5 pts:  0 0 0 0 1 2 2 2 2

            knots = [];
            for (let i = 0; i < degree + 1; i++) {
                knots.push(0);
            }
            for (let i = 1; i < controlPoints.length - degree; i++) {
                knots.push(i);
            }
            for (let i = 0; i < degree + 1; i++) {
                knots.push(controlPoints.length - degree);
            }
        }

        if (knots.length !== controlPoints.length + degree + 1) {
            throw new Error(
                `Invalid knot vector length. Expected ${
                    controlPoints.length + degree + 1
                } but received ${knots.length}.`
            );
        }

        this.controlPoints = controlPoints;
        this.knots = knots;
        this.fitPoints = fitPoints;
        this.degree = degree;
        this.weights = weights;

        const closed = 0;
        const periodic = 0;
        const rational = this.weights ? 1 : 0;
        const planar = 1;
        const linear = 0;

        this.type =
            closed * 1 + periodic * 2 + rational * 4 + planar * 8 + linear * 16;

        // Not certain where the values of these flags came from so I'm going to leave them commented for now
        // const closed = 0
        // const periodic = 0
        // const rational = 1
        // const planar = 1
        // const linear = 0
        // const splineType = 1024 * closed + 128 * periodic + 8 * rational + 4 * planar + 2 * linear
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-E1F884F8-AA90-4864-A215-3182D47A9C74
        await manager.push(0, "SPLINE");
        await super.tags(manager);
        await manager.push(8, this.layer.name);

        await manager.push(210, 0.0);
        await manager.push(220, 0.0);
        await manager.push(230, 1.0);

        await manager.push(70, this.type);
        await manager.push(71, this.degree);
        await manager.push(72, this.knots.length);
        await manager.push(73, this.controlPoints.length);
        await manager.push(74, this.fitPoints.length);

        await manager.push(42, 1e-7);
        await manager.push(43, 1e-7);
        await manager.push(44, 1e-10);

        for (const knot of this.knots) {
            await manager.push(40, knot);
        }

        if (this.weights) {
            for (const weight of this.weights) {
                await manager.push(41, weight);
            }
        }

        for (const point of this.controlPoints) {
            await manager.point(point[0], point[1]);
        }
    }
}

module.exports = Spline;

},{"./DatabaseObject":8,"./TagsManager":27}],26:[function(require,module,exports){
const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class Table extends DatabaseObject {
    constructor(name) {
        super("AcDbSymbolTable");
        this.name = name;
        this.elements = [];
    }

    add(element) {
        element.ownerObjectHandle = this.handle;
        this.elements.push(element);
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-D8CCD2F0-18A3-42BB-A64D-539114A07DA0
        await manager.push(0, "TABLE");
        await manager.push(2, this.name);
        await super.tags(manager);
        await manager.push(70, this.elements.length);

        for (const element of this.elements) {
            await element.tags(manager);
        }

        await manager.push(0, "ENDTAB");
    }
}

module.exports = Table;

},{"./DatabaseObject":8,"./TagsManager":27}],27:[function(require,module,exports){
const { once } = require('./once');

const DEFAULT_WRITE_CHUNK_SIZE = 2000;
const STREAM_NOT_WRITABLE_ERROR = "Stream is not writable. Reinstantiate the TagsManager with a writable stream.";

class TagsManager {
  constructor(stream, writeChunkSize = DEFAULT_WRITE_CHUNK_SIZE) {
    this._writeChunkSize = writeChunkSize;
    this._stream = stream;
    this._lines = [];
  }

  /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {Promise<void>}
     */
  async point(x, y, z = 0) {
    await this.push(10, x);
    await this.push(20, y);
    await this.push(30, z);
  }

  /**
   * @param {string} name The name of the section
   * @returns {Promise<void>}
   */
  async start(name) {
    await this.push(0, "SECTION");
    await this.push(2, name);
  }

  /**
   * @returns {Promise<void>}
   */
  async end() {
    await this.push(0, "ENDSEC");
  }

  async addHeaderVariable(name, tagsElements) {
    await this.push(9, `$${name}`);

    for (const tagsElement of tagsElements) {
      await this.push(tagsElement[0], tagsElement[1]);
    };
  }

  async push(code, value) {
    if (!this._stream.writable) {
      throw new Error(STREAM_NOT_WRITABLE_ERROR);
    }

    this._lines.push(code, value);

    if (this._lines.length > this._writeChunkSize) {
      await this._writeChunkToStream(this._lines.splice(0, this._writeChunkSize));
    }
  }

  async finaliseWriting() {
    if (!this._stream.writable) {
      throw new Error(STREAM_NOT_WRITABLE_ERROR);
    }

    while (this._lines.length > 0) {
      await this._writeChunkToStream(this._lines.splice(0, this._writeChunkSize));
    }
  }

  async _writeChunkToStream(lines) {
    const data = lines.join("\n") + "\n";
    const mustDrain = !this._stream.write(data);
    if (mustDrain) await once(this._stream, 'drain');
  }
}

module.exports = TagsManager;

},{"./once":32}],28:[function(require,module,exports){
const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

const H_ALIGN_CODES = ["left", "center", "right"];
const V_ALIGN_CODES = ["baseline", "bottom", "middle", "top"];

class Text extends DatabaseObject {
    /**
     * @param {number} x - x
     * @param {number} y - y
     * @param {number} height - Text height
     * @param {number} rotation - Text rotation
     * @param {string} value - the string itself
     * @param {string} [horizontalAlignment="left"] left | center | right
     * @param {string} [verticalAlignment="baseline"] baseline | bottom | middle | top
     */
    constructor(
        x,
        y,
        height,
        rotation,
        value,
        horizontalAlignment = "left",
        verticalAlignment = "baseline"
    ) {
        super(["AcDbEntity", "AcDbText"]);
        this.x = x;
        this.y = y;
        this.height = height;
        this.rotation = rotation;
        this.value = value;
        this.hAlign = horizontalAlignment;
        this.vAlign = verticalAlignment;
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-62E5383D-8A14-47B4-BFC4-35824CAE8363
        await manager.push(0, "TEXT");
        await super.tags(manager);
        await manager.push(8, this.layer.name);
        await manager.point(this.x, this.y);
        await manager.push(40, this.height);
        await manager.push(1, this.value);
        await manager.push(50, this.rotation);

        if (
            H_ALIGN_CODES.includes(this.hAlign, 1) ||
            V_ALIGN_CODES.includes(this.vAlign, 1)
        ) {
            await manager.push(72, Math.max(H_ALIGN_CODES.indexOf(this.hAlign), 0));

            await manager.push(11, this.x);
            await manager.push(21, this.y);
            await manager.push(31, 0);

            /* AutoCAD needs this one more time, yes, exactly here. */
            await manager.push(100, "AcDbText");
            await manager.push(73, Math.max(V_ALIGN_CODES.indexOf(this.vAlign), 0));
        } else {
            /* AutoCAD needs this one more time. */
            await manager.push(100, "AcDbText");
        }
    }
}

module.exports = Text;

},{"./DatabaseObject":8,"./TagsManager":27}],29:[function(require,module,exports){
const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class TextStyle extends DatabaseObject {
    fontFileName = 'txt';
    constructor(name) {
        super(["AcDbSymbolTableRecord", "AcDbTextStyleTableRecord"]);
        this.name = name;
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-EF68AF7C-13EF-45A1-8175-ED6CE66C8FC9
        await manager.push(0, "STYLE");
        await super.tags(manager);
        await manager.push(2, this.name);
        /* No flags set */
        await manager.push(70, 0);
        await manager.push(40, 0);
        await manager.push(41, 1);
        await manager.push(50, 0);
        await manager.push(71, 0);
        await manager.push(42, 1);
        await manager.push(3, this.fontFileName);
        await manager.push(4, "");
    }
}

module.exports = TextStyle;

},{"./DatabaseObject":8,"./TagsManager":27}],30:[function(require,module,exports){
const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class Vertex extends DatabaseObject {
    /**
     *
     * @param {number} x The X coordinate
     * @param {number} y The Y coordinate
     * @param {number} z The Z coordinate
     */
    constructor(x, y, z) {
        super(["AcDbEntity", "AcDbVertex", "AcDb3dPolylineVertex"]);
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-0741E831-599E-4CBF-91E1-8ADBCFD6556D
        await manager.push(0, "VERTEX");
        await super.tags(manager);
        await manager.push(8, this.layer.name);
        await manager.point(this.x, this.y, this.z);
        await manager.push(70, 32);
    }
}

module.exports = Vertex;

},{"./DatabaseObject":8,"./TagsManager":27}],31:[function(require,module,exports){
const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class Viewport extends DatabaseObject {
    constructor(name, height) {
        super(["AcDbSymbolTableRecord", "AcDbViewportTableRecord"]);
        this.name = name;
        this.height = height;
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-8CE7CC87-27BD-4490-89DA-C21F516415A9
        await manager.push(0, "VPORT");
        await super.tags(manager);
        await manager.push(2, this.name);
        await manager.push(40, this.height);
        /* No flags set */
        await manager.push(70, 0);
    }
}

module.exports = Viewport;

},{"./DatabaseObject":8,"./TagsManager":27}],32:[function(require,module,exports){
module.exports = {
  once: function (target, eventName) {
    return new Promise((resolve, reject) => {
      function handler(...args) {
        cleanup();
        resolve(args.length === 1 ? args[0] : args);
      }

      function errorHandler(err) {
        cleanup();
        reject(err);
      }

      function cleanup() {
        if (target.removeEventListener) {
          target.removeEventListener(eventName, handler)
          target.removeEventListener(eventName, handler);
        }

        else if (target.removeListener) {
          target.removeListener(eventName, handler);
          target.removeListener('error', errorHandler);
        }

        else if (target.off) {
          target.off(eventName, handler);
          target.off('error', errorHandler);
        }
      }

      if (target.addEventListener) {
        target.addEventListener(eventName, handler, { once: true });
        target.addEventListener('error', errorHandler, { once: true });
      }

      else if (target.addListener) {
        target.addListener(eventName, handler);
        target.addListener('error', errorHandler);
      }

      else if (target.on) {
        target.on(eventName, handler);
        target.on('error', errorHandler);
      }
    });
  }
};

},{}],"Drawing":[function(require,module,exports){
const { once } = require('./once');
const AppId = require('./AppId');
const Arc = require('./Arc');
const Block = require('./Block');
const BlockRecord = require('./BlockRecord');
const Circle = require('./Circle');
const Cylinder = require('./Cylinder');
const Dictionary = require('./Dictionary');
const DimStyleTable = require('./DimStyleTable');
const Ellipse = require('./Ellipse');
const Face = require('./Face');
const Handle = require('./Handle');
const Helix = require('./Helix');
const HelixLean = require('./HelixLean');
const Layer = require('./Layer');
const Line = require('./Line');
const Line3d = require('./Line3d');
const LineType = require('./LineType');
const Mesh = require('./Mesh');
const Point = require('./Point');
const Polyline = require('./Polyline');
const Polyline3d = require('./Polyline3d');
const Spline = require('./Spline');
const Table = require('./Table');
const TagsManager = require('./TagsManager');
const Text = require('./Text');
const TextStyle = require('./TextStyle');
const Viewport = require('./Viewport');
const Vertex = require('./Vertex');
const StringWritableStream = require('./StringWritableStream');

class BrowserFriendlyDrawing {
  constructor(stream) {
    this._layers = {};
    this._activeLayer = null;
    this._lineTypes = {};
    this._headers = {};
    this._tables = {};
    this._blocks = {};
    this._dictionary = new Dictionary();
    this._finalStream = stream;

    this.setUnits('Unitless');

    for (const ltype of BrowserFriendlyDrawing.LINE_TYPES) {
      this.addLineType(ltype.name, ltype.description, ltype.elements);
    }

    for (const l of BrowserFriendlyDrawing.LAYERS) {
      this.addLayer(l.name, l.colorNumber, l.lineTypeName);
    }

    this.setActiveLayer('0');
    this._generateAutocadExtras();

    this._init();
  }

  _init() {
    this._tempShapes = this._createTemporaryTagsManager();
  }

  /**
   * @param {string} name The name of the block.
   * @returns {Block}
   */
  addBlock(name) {
    const block = new Block(name);
    this._blocks[name] = block;
    return block;
  }

  addLayer(name, colorNumber, lineTypeName) {
    this._layers[name] = new Layer(name, colorNumber, lineTypeName);
    return this;
  }

  /**
   * @param {string} name
   * @param {string} description
   * @param {array} elements - if elem > 0 it is a line, if elem < 0 it is gap, if elem == 0.0 it is a
   */
  addLineType(name, description, elements) {
    this._lineTypes[name] = new LineType(name, description, elements);
    return this;
  }

  /**
   * @param {string} name
   * @returns {Table}
   */
  addTable(name) {
    const table = new Table(name);
    this._tables[name] = table;
    return table;
  }

  /**
   * @param {number} x1 - Center x
   * @param {number} y1 - Center y
   * @param {number} r - radius
   * @param {number} startAngle - degree
   * @param {number} endAngle - degree
   * @returns {Promise<this>}
   */
  async drawArc(x1, y1, r, startAngle, endAngle) {
    await this._activeLayer.writeShape(
      this._modelSpace,
      this._tempShapes.tagsManager,
      new Arc(x1, y1, r, startAngle, endAngle)
    );
    return this;
  }

  /**
   * @param {number} x1 - Center x
   * @param {number} y1 - Center y
   * @param {number} r - radius
   * @returns {Promise<this>}
   */
  async drawCircle(x1, y1, r) {
    await this._activeLayer.writeShape(
      this._modelSpace,
      this._tempShapes.tagsManager,
      new Circle(x1, y1, r)
    );
    return this;
  }

  /**
   * @param {number} x1 - Center x
   * @param {number} y1 - Center y
   * @param {number} z1 - Center z
   * @param {number} r - radius
   * @param {number} thickness - thickness
   * @param {number} extrusionDirectionX - Extrusion Direction x
   * @param {number} extrusionDirectionY - Extrusion Direction y
   * @param {number} extrusionDirectionZ - Extrusion Direction z
   * @returns {Promise<this>}
   */
  async drawCylinder(
    x1,
    y1,
    z1,
    r,
    thickness,
    extrusionDirectionX,
    extrusionDirectionY,
    extrusionDirectionZ
  ) {
    await this._activeLayer.writeShape(
      this._modelSpace,
      this._tempShapes.tagsManager,
      new Cylinder(
        x1,
        y1,
        z1,
        r,
        thickness,
        extrusionDirectionX,
        extrusionDirectionY,
        extrusionDirectionZ
      )
    );
    return this;
  }

  /**
   * Draw an ellipse.
   * @param {number} x1 - Center x
   * @param {number} y1 - Center y
   * @param {number} majorAxisX - Endpoint x of major axis, relative to center
   * @param {number} majorAxisY - Endpoint y of major axis, relative to center
   * @param {number} axisRatio - Ratio of minor axis to major axis
   * @param {number | undefined} startAngle - Start angle
   * @param {number | undefined} endAngle - End angle
   * @returns {Promise<this>}
   */
  async drawEllipse(
    x1,
    y1,
    majorAxisX,
    majorAxisY,
    axisRatio,
    startAngle = 0,
    endAngle = 2 * Math.PI
  ) {
    await this._activeLayer.writeShape(
      this._modelSpace,
      this._tempShapes.tagsManager,
      new Ellipse(
        x1,
        y1,
        majorAxisX,
        majorAxisY,
        axisRatio,
        startAngle,
        endAngle
      )
    );
    return this;
  }

  /**
   * Draw a helix.
   * @param {[number, number, number]} axisBasePoint - A point on the helix axis
   * @param {[number, number, number]} startPoint - The helix start point
   * @param {[number, number, number]} axisVector - The helix axis direction vector
   * @param {number} turns - Number of turns
   * @param {number} turnHeight - Height per turn
   * @param {number | undefined} handedness - 0 = left, 1 = right
   * @param {number | undefined} constrainType - 0 = turn height, 1 = turns, 2 = height
   * @param {number | undefined} majorReleaseNumber - AcDbHelix major release number
   * @param {number | undefined} maintenanceReleaseNumber - AcDbHelix maintenance release number
   * @param {number | undefined} segmentsPerTurn - Number of control points generated per turn
   * @returns {Promise<this>}
   */
  async drawHelix(
    axisBasePoint,
    startPoint,
    axisVector,
    turns,
    turnHeight,
    handedness = 1,
    constrainType = 0,
    majorReleaseNumber = 29,
    maintenanceReleaseNumber = 63,
    segmentsPerTurn = 12
  ) {
    await this._activeLayer.writeShape(
      this._modelSpace,
      this._tempShapes.tagsManager,
      new Helix(
        axisBasePoint,
        startPoint,
        axisVector,
        turns,
        turnHeight,
        handedness,
        constrainType,
        majorReleaseNumber,
        maintenanceReleaseNumber,
        segmentsPerTurn
      )
    );
    return this;
  }

  /**
   * Draw a lean HELIX entity with reduced spline sampling.
   * This stays DXF-valid while producing fewer control points.
   */
  async drawHelixLean(
    axisBasePoint,
    startPoint,
    axisVector,
    turns,
    turnHeight,
    handedness = 1,
    constrainType = 0,
    majorReleaseNumber = 29,
    maintenanceReleaseNumber = 63,
    segmentsPerTurn = 72
  ) {
    await this._activeLayer.writeShape(
      this._modelSpace,
      this._tempShapes.tagsManager,
      new HelixLean(
        axisBasePoint,
        startPoint,
        axisVector,
        turns,
        turnHeight,
        handedness,
        constrainType,
        majorReleaseNumber,
        maintenanceReleaseNumber,
        segmentsPerTurn
      )
    );
    return this;
  }

  /**
   * @param {number} x1 - x
   * @param {number} y1 - y
   * @param {number} z1 - z
   * @param {number} x2 - x
   * @param {number} y2 - y
   * @param {number} z2 - z
   * @param {number} x3 - x
   * @param {number} y3 - y
   * @param {number} z3 - z
   * @param {number} x4 - x
   * @param {number} y4 - y
   * @param {number} z4 - z
   * @returns {Promise<this>}
   */
  async drawFace(x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4) {
    await this._activeLayer.writeShape(
      this._modelSpace,
      this._tempShapes.tagsManager,
      new Face(x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4)
    );
    return this;
  }

  /**
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @returns {Promise<this>}
   */
  async drawLine(x1, y1, x2, y2) {
    await this._activeLayer.writeShape(
      this._modelSpace,
      this._tempShapes.tagsManager,
      new Line(x1, y1, x2, y2)
    );
    return this;
  }

  /**
   * @param {number} x1
   * @param {number} y1
   * @param {number} z1
   * @param {number} x2
   * @param {number} y2
   * @param {number} z2
   * @returns {Promise<this>}
   */
  async drawLine3d(x1, y1, z1, x2, y2, z2) {
    await this._activeLayer.writeShape(
      this._modelSpace,
      this._tempShapes.tagsManager,
      new Line3d(x1, y1, z1, x2, y2, z2)
    );
    return this;
  }

  /**
   * @param {[number, number, number][]} vertices - Array of vertices like [ [x1, y1, z3], [x2, y2, z3]... ]
   * @param {number[][]} faceIndices - Array of face indices
   * @returns {Promise<this>}
   */
  async drawMesh(vertices, faceIndices) {
    await this._activeLayer.writeShape(
      this._modelSpace,
      this._tempShapes.tagsManager,
      new Mesh(vertices, faceIndices)
    );
    return this;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {Promise<this>}
   */
  async drawPoint(x, y, z) {
    await this._activeLayer.writeShape(
      this._modelSpace,
      this._tempShapes.tagsManager,
      new Point(x, y, z)
    );
    return this;
  }

  /**
   * Draw a regular convex polygon as a polyline entity.
   *
   * @see [Regular polygon | Wikipedia](https://en.wikipedia.org/wiki/Regular_polygon)
   *
   * @param {number} x - The X coordinate of the center of the polygon.
   * @param {number} y - The Y coordinate of the center of the polygon.
   * @param {number} numberOfSides - The number of sides.
   * @param {number} radius - The radius.
   * @param {number} rotation - The  rotation angle (in Degrees) of the polygon. By default 0.
   * @param {boolean} circumscribed - If `true` is a polygon in which each side is a tangent to a circle.
   * If `false` is a polygon in which all vertices lie on a circle. By default `false`.
   *
   * @returns {Promise<this>}
   */
  async drawPolygon(
    x,
    y,
    numberOfSides,
    radius,
    rotation = 0,
    circumscribed = false
  ) {
    const angle = (2 * Math.PI) / numberOfSides;
    const vertices = [];
    let d = radius;
    const rotationRad = (rotation * Math.PI) / 180;
    if (circumscribed) d = radius / Math.cos(Math.PI / numberOfSides);
    for (let i = 0; i < numberOfSides; i++) {
      vertices.push([
        x + d * Math.sin(rotationRad + i * angle),
        y + d * Math.cos(rotationRad + i * angle),
      ]);
    }
    await this._activeLayer.writeShape(
      this._modelSpace,
      this._tempShapes.tagsManager,
      new Polyline(vertices, true)
    );
    return this;
  }

  /**
   * @param {[number, number][]} points - Array of points like [ [x1, y1], [x2, y2]... ]
   * @param {boolean} closed - Closed polyline flag
   * @param {number} startWidth - Default start width
   * @param {number} endWidth - Default end width
   * @returns {Promise<this>}
   */
  async drawPolyline(points, closed = false, startWidth = 0, endWidth = 0) {
    await this._activeLayer.writeShape(
      this._modelSpace,
      this._tempShapes.tagsManager,
      new Polyline(points, closed, startWidth, endWidth)
    );
    return this;
  }

  /**
   * @param {[number, number, number][]} points - Array of points like [ [x1, y1, z1], [x2, y2, z1]... ]
   * @returns {Promise<this>}
   */
  async drawPolyline3d(points) {
    points.forEach((point) => {
      if (point.length !== 3) {
        throw 'Require 3D coordinates';
      }
    });
    await this._activeLayer.writeShape(
      this._modelSpace,
      this._tempShapes.tagsManager,
      new Polyline3d(points)
    );
    return this;
  }

  /**
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @param {number} cornerLength
   * @param {number} cornerBulge
   * @returns {Promise<this>}
   */
  async drawRect(x1, y1, x2, y2, cornerLength, cornerBulge) {
    const w = x2 - x1;
    const h = y2 - y1;
    cornerBulge = cornerBulge || 0;
    let p = null;
    if (!cornerLength) {
      p = new Polyline(
        [
          [x1, y1],
          [x1, y1 + h],
          [x1 + w, y1 + h],
          [x1 + w, y1],
        ],
        true
      );
    } else {
      p = new Polyline(
        [
          [x1 + w - cornerLength, y1, cornerBulge], // 1
          [x1 + w, y1 + cornerLength], // 2
          [x1 + w, y1 + h - cornerLength, cornerBulge], // 3
          [x1 + w - cornerLength, y1 + h], // 4
          [x1 + cornerLength, y1 + h, cornerBulge], // 5
          [x1, y1 + h - cornerLength], // 6
          [x1, y1 + cornerLength, cornerBulge], // 7
          [x1 + cornerLength, y1], // 8
        ],
        true
      );
    }
    await this._activeLayer.writeShape(
      this._modelSpace,
      this._tempShapes.tagsManager,
      p
    );
    return this;
  }

  /**
   * Draw a spline.
   * @param {[Array]} controlPoints - Array of control points like [ [x1, y1], [x2, y2]... ]
   * @param {number | undefined} degree - Degree of spline: 2 for quadratic, 3 for cubic. Default is 3
   * @param {[number] | undefined} knots - Knot vector array. If null, will use a uniform knot vector. Default is null
   * @param {[number] | undefined} weights - Control point weights. If provided, must be one weight for each control point. Default is null
   * @param {[Array] | undefined} fitPoints - Array of fit points like [ [x1, y1], [x2, y2]... ]
   * @returns {Promise<this>}
   */
  async drawSpline(
    controlPoints,
    degree = 3,
    knots = null,
    weights = null,
    fitPoints = []
  ) {
    await this._activeLayer.writeShape(
      this._modelSpace,
      this._tempShapes.tagsManager,
      new Spline(controlPoints, degree, knots, weights, fitPoints)
    );
    return this;
  }

  /**
   * @param {number} x1 - x
   * @param {number} y1 - y
   * @param {number} height - Text height
   * @param {number} rotation - Text rotation
   * @param {string} value - the string itself
   * @param {string} [horizontalAlignment="left"] left | center | right
   * @param {string} [verticalAlignment="baseline"] baseline | bottom | middle | top
   * @returns {Promise<this>}
   */
  async drawText(
    x1,
    y1,
    height,
    rotation,
    value,
    horizontalAlignment = 'left',
    verticalAlignment = 'baseline'
  ) {
    await this._activeLayer.writeShape(
      this._modelSpace,
      this._tempShapes.tagsManager,
      new Text(
        x1,
        y1,
        height,
        rotation,
        value,
        horizontalAlignment,
        verticalAlignment
      )
    );
    return this;
  }

  /**
   * @param {number} x1 - x
   * @param {number} y1 - y
   * @param {number} z1 - z
   * @returns {Promise<this>}
   */
  async drawVertex(x1, y1, z1) {
    await this._activeLayer.writeShape(
      this._modelSpace,
      this._tempShapes.tagsManager,
      new Vertex(x1, y1, z1)
    );
    return this;
  }

  async end() {
    const { tagsManager: headerTagsManager, stream: headerStream } =
      this._createTemporaryTagsManager();
    await this._writeHeader(headerTagsManager);
    headerStream.end();
    await once(headerStream, 'finish');

    await this._tempShapes.tagsManager.finaliseWriting();
    this._tempShapes.stream.end();
    await once(this._tempShapes.stream, 'finish');

    const { tagsManager: footerTagsManager, stream: footerStream } =
      this._createTemporaryTagsManager();
    await this._writeFooter(footerTagsManager);
    footerStream.end();
    await once(footerStream, 'finish');

    await this._pipeline(
      [headerStream, this._tempShapes.stream, footerStream],
      this._finalStream
    );
  }

  /**
   * Generate additional DXF metadata which are required to successfully open resulted document
   * in AutoDesk products. Call this method before serializing the drawing to get the most
   * compatible result.
   */
  _generateAutocadExtras() {
    if (!this._headers['ACADVER']) {
      /* AutoCAD 2010 version. */
      this.header('ACADVER', [[1, 'AC1024']]);
    }

    if (!this._lineTypes['ByBlock']) {
      this.addLineType('ByBlock', '', []);
    }
    if (!this._lineTypes['ByLayer']) {
      this.addLineType('ByLayer', '', []);
    }

    let vpTable = this._tables['VPORT'];
    if (!vpTable) {
      vpTable = this.addTable('VPORT');
    }
    let styleTable = this._tables['STYLE'];
    if (!styleTable) {
      styleTable = this.addTable('STYLE');
    }
    if (!this._tables['VIEW']) {
      this.addTable('VIEW');
    }
    if (!this._tables['UCS']) {
      this.addTable('UCS');
    }
    let appIdTable = this._tables['APPID'];
    if (!appIdTable) {
      appIdTable = this.addTable('APPID');
    }
    if (!this._tables['DIMSTYLE']) {
      const t = new DimStyleTable('DIMSTYLE');
      this._tables['DIMSTYLE'] = t;
    }

    vpTable.add(new Viewport('*ACTIVE', 1000));

    /* Non-default text alignment is not applied without this entry. */
    styleTable.add(new TextStyle('standard'));

    appIdTable.add(new AppId('ACAD'));

    this._modelSpace = this.addBlock('*Model_Space');
    this.addBlock('*Paper_Space');

    const groupDictionary = new Dictionary();
    this._dictionary.addChildDictionary('ACAD_GROUP', groupDictionary);
  }

  /**
   * @see https://www.autodesk.com/techpubs/autocad/acadr14/dxf/header_section_al_u05_c.htm
   * @see https://www.autodesk.com/techpubs/autocad/acad2000/dxf/header_section_group_codes_dxf_02.htm
   *
   * @param {string} variable
   * @param {array} values Array of "two elements arrays". [  [value1_GroupCode, value1_value], [value2_GroupCode, value2_value]  ]
   * @returns {this}
   */
  header(variable, values) {
    this._headers[variable] = values;
    return this;
  }

  setActiveLayer(name) {
    this._activeLayer = this._layers[name];
    return this;
  }

  /**
   *
   * @param {number} trueColor - Integer representing the true color, can be passed as an hexadecimal value of the form 0xRRGGBB
   * @returns {this}
   */
  setTrueColor(trueColor) {
    this._activeLayer.setTrueColor(trueColor);
    return this;
  }

  /**
   * @param {string} unit see this.UNITS
   */
  setUnits(unit) {
    let units =
      typeof BrowserFriendlyDrawing.UNITS[unit] != 'undefined'
        ? BrowserFriendlyDrawing.UNITS[unit]
        : BrowserFriendlyDrawing.UNITS['Unitless'];
    this.header('INSUNITS', [[70, units]]);
    return this;
  }

  async _writeHeader(tagsManager) {
    // Setup
    const blockRecordTable = new Table('BLOCK_RECORD');
    const blocks = Object.values(this._blocks);
    for (const b of blocks) {
      const r = new BlockRecord(b.name);
      blockRecordTable.add(r);
    }
    const ltypeTable = this._ltypeTable();
    const layerTable = this._layerTable();
    // Header section start.
    await tagsManager.start('HEADER');
    await tagsManager.addHeaderVariable('HANDSEED', [[5, Handle.peek()]]);
    const variables = Object.entries(this._headers);
    for (const v of variables) {
      const [name, values] = v;
      await tagsManager.addHeaderVariable(name, values);
    }
    await tagsManager.end();
    // Header section end.

    // Classes section start.
    await tagsManager.start('CLASSES');
    // Empty CLASSES section for compatibility
    await tagsManager.end();
    // Classes section end.

    // Tables section start.
    await tagsManager.start('TABLES');
    await ltypeTable.tags(tagsManager);
    await layerTable.tags(tagsManager);
    const tables = Object.values(this._tables);
    for (const t of tables) {
      await t.tags(tagsManager);
    }
    await blockRecordTable.tags(tagsManager);
    await tagsManager.end();
    // Tables section end.

    // Blocks section start.
    await tagsManager.start('BLOCKS');
    for (const b of blocks) {
      await b.tags(tagsManager);
    }
    await tagsManager.end();
    // Blocks section end.

    // Entities section start.
    await tagsManager.start('ENTITIES');
    await tagsManager.finaliseWriting();
  }

  async _writeFooter(tagsManager) {
    await tagsManager.end();
    // Entities section end.

    // Objects section start.
    await tagsManager.start('OBJECTS');
    await this._dictionary.tags(tagsManager);
    await tagsManager.end();
    // Objects section end.

    await tagsManager.push(0, 'EOF');
    await tagsManager.finaliseWriting();
  }

  _createTemporaryTagsManager() {
    const stream = new StringWritableStream();
    return {
      tagsManager: new TagsManager(stream),
      stream,
    };
  }

  async _pipeline(closedStreams, writable) {
    for (const closedStream of closedStreams) {
      await new Promise((resolve) => {
        writable.write(closedStream.toString());
        resolve();
      });
    }
  }

  _ltypeTable() {
    const t = new Table('LTYPE');
    const ltypes = Object.values(this._lineTypes);
    for (const lt of ltypes) t.add(lt);
    return t;
  }

  _layerTable() {
    const t = new Table('LAYER');
    const layers = Object.values(this._layers);
    for (const l of layers) t.add(l);
    return t;
  }
}

//AutoCAD Color Index (ACI)
//http://sub-atomic.com/~moses/acadcolors.html
BrowserFriendlyDrawing.ACI = {
  LAYER: 0,
  RED: 1,
  YELLOW: 2,
  GREEN: 3,
  CYAN: 4,
  BLUE: 5,
  MAGENTA: 6,
  WHITE: 7,
};

BrowserFriendlyDrawing.LINE_TYPES = [
  { name: 'CONTINUOUS', description: '______', elements: [] },
  { name: 'DASHED', description: '_ _ _ ', elements: [5.0, -5.0] },
  { name: 'DOTTED', description: '. . . ', elements: [0.0, -5.0] },
];

BrowserFriendlyDrawing.LAYERS = [
  {
    name: '0',
    colorNumber: BrowserFriendlyDrawing.ACI.WHITE,
    lineTypeName: 'CONTINUOUS',
  },
];

//https://www.autodesk.com/techpubs/autocad/acad2000/dxf/header_section_group_codes_dxf_02.htm
BrowserFriendlyDrawing.UNITS = {
  Unitless: 0,
  Inches: 1,
  Feet: 2,
  Miles: 3,
  Millimeters: 4,
  Centimeters: 5,
  Meters: 6,
  Kilometers: 7,
  Microinches: 8,
  Mils: 9,
  Yards: 10,
  Angstroms: 11,
  Nanometers: 12,
  Microns: 13,
  Decimeters: 14,
  Decameters: 15,
  Hectometers: 16,
  Gigameters: 17,
  'Astronomical units': 18,
  'Light years': 19,
  Parsecs: 20,
};

module.exports = BrowserFriendlyDrawing;

},{"./AppId":2,"./Arc":3,"./Block":4,"./BlockRecord":5,"./Circle":6,"./Cylinder":7,"./Dictionary":9,"./DimStyleTable":10,"./Ellipse":11,"./Face":12,"./Handle":13,"./Helix":14,"./HelixLean":15,"./Layer":17,"./Line":18,"./Line3d":19,"./LineType":20,"./Mesh":21,"./Point":22,"./Polyline":23,"./Polyline3d":24,"./Spline":25,"./StringWritableStream":"StringWritableStream","./Table":26,"./TagsManager":27,"./Text":28,"./TextStyle":29,"./Vertex":30,"./Viewport":31,"./once":32}],"StringWritableStream":[function(require,module,exports){
(function (process){(function (){
const SUPPORTED_EVENTS = ['finish', 'error'];

class StringWritableStream {
  constructor() {
    this.writable = true;

    this._chunks = [];
    this._closed = false;
    this._eventTarget = new EventTarget();
  }

  addEventListener(event, callback) {
    if (SUPPORTED_EVENTS.includes(event)) {
      this._eventTarget.addEventListener(event, callback);
    } else {
      throw new Error(`Unsupported event: ${event}`);
    }
  }

  removeEventListener(event, callback) {
    if (SUPPORTED_EVENTS.includes(event)) {
      this._eventTarget.removeEventListener(event, callback);
    } else {
      throw new Error(`Unsupported event: ${event}`);
    }
  }

  write(chunk) {
    if (this._closed) {
      throw new Error('Stream is closed');
    }

    if (typeof chunk === 'string') {
      this._chunks.push(chunk);
    } else if (chunk instanceof Uint8Array) {
      this._chunks.push(new TextDecoder().decode(chunk));
    } else {
      throw new TypeError('Chunk must be a string or Uint8Array');
    }

    return true;
  }

  end() {
    this._closed = true;
    this.writable = false;

    process.nextTick(() =>
      this._eventTarget.dispatchEvent(new Event('finish'))
    );
  }

  toString() {
    if (!this._closed) {
      throw new Error('Stream is not closed yet');
    }
    return this._chunks.join('');
  }
}

module.exports = StringWritableStream;
module.exports.StringWritableStream = StringWritableStream;

}).call(this)}).call(this,require('_process'))
},{"_process":1}]},{},[]);
