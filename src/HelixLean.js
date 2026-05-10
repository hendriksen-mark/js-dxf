const DatabaseObject = require("./DatabaseObject");

const DEFAULT_MAJOR_RELEASE_NUMBER = 29;
const DEFAULT_MAINTENANCE_RELEASE_NUMBER = 63;

class HelixLean extends DatabaseObject {
    /**
     * Lean HELIX writer that emits only core helix tags.
     * Intended for AutoCAD API testing where helix parameters are sufficient.
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
        maintenanceReleaseNumber = DEFAULT_MAINTENANCE_RELEASE_NUMBER
    ) {
        super(["AcDbEntity", "AcDbHelix"]);

        this.axisBasePoint = toPoint3d(axisBasePoint, "axisBasePoint");
        this.startPoint = toPoint3d(startPoint, "startPoint");
        this.axisVector = toPoint3d(axisVector, "axisVector");
        this.turns = turns;
        this.turnHeight = turnHeight;
        this.handedness = handedness;
        this.constrainType = constrainType;
        this.majorReleaseNumber = majorReleaseNumber;
        this.maintenanceReleaseNumber = maintenanceReleaseNumber;
        this.radius = computeRadius(this.axisBasePoint, this.startPoint, this.axisVector);
    }

    async tags(manager) {
        await manager.push(0, "HELIX");
        await super.tags(manager);
        await manager.push(8, this.layer.name);

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

        await manager.push(90, this.majorReleaseNumber);
        await manager.push(91, this.maintenanceReleaseNumber);
    }
}

function toPoint3d(point, name) {
    if (!Array.isArray(point) || point.length !== 3) {
        throw new Error(`${name} must be a 3D point in the form [x, y, z].`);
    }

    return [point[0], point[1], point[2]];
}

function subtractVectors(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function scaleVector(vector, scalar) {
    return [vector[0] * scalar, vector[1] * scalar, vector[2] * scalar];
}

function dotProduct(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
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

function computeRadius(axisBasePoint, startPoint, axisVector) {
    const axisDirection = normalizeVector(axisVector, "axisVector");
    const startOffset = subtractVectors(startPoint, axisBasePoint);
    const startHeight = dotProduct(startOffset, axisDirection);
    const startHeightOffset = scaleVector(axisDirection, startHeight);
    const radialVector = subtractVectors(startOffset, startHeightOffset);
    const radius = magnitude(radialVector);

    if (radius === 0) {
        throw new Error("Helix startPoint must not lie on the helix axis.");
    }

    return radius;
}

module.exports = HelixLean;
