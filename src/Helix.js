const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

const DEFAULT_MAJOR_RELEASE_NUMBER = 29;
const DEFAULT_MAINTENANCE_RELEASE_NUMBER = 63;
const DEFAULT_SEGMENTS_PER_TURN = 12;
const TAU = Math.PI * 2;

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

        const axisDirection = normalizeVector(this.axisVector, "axisVector");
        const startOffset = subtractVectors(this.startPoint, this.axisBasePoint);
        const startHeight = dotProduct(startOffset, axisDirection);
        const startHeightOffset = scaleVector(axisDirection, startHeight);
        const radialVector = subtractVectors(startOffset, startHeightOffset);
        const radius = magnitude(radialVector);

        if (radius === 0) {
            throw new Error("Helix startPoint must not lie on the helix axis.");
        }

        this.radius = radius;
        this._axisDirection = axisDirection;
        this._radialDirection = normalizeVector(radialVector, "startPoint");
        this._perpendicularDirection = normalizeVector(
            crossProduct(this._axisDirection, this._radialDirection),
            "helix perpendicular direction"
        );
        this._startHeight = startHeight;
        this.controlPoints = this._buildControlPoints(segmentsPerTurn);
        this.knots = createUniformKnots(this.controlPoints.length, this.degree);
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

    _buildControlPoints(segmentsPerTurn) {
        const points = [];
        const pointCount = Math.max(
            Math.ceil(this.turns * segmentsPerTurn) + 1,
            this.degree + 1
        );
        const handednessSign = this.handedness === 0 ? -1 : 1;
        const totalAngle = TAU * this.turns;

        for (let i = 0; i < pointCount; i++) {
            const ratio = pointCount === 1 ? 0 : i / (pointCount - 1);
            const angle = totalAngle * ratio;
            const radialComponent = addVectors(
                scaleVector(this._radialDirection, Math.cos(angle)),
                scaleVector(
                    this._perpendicularDirection,
                    Math.sin(angle) * handednessSign
                )
            );
            const height = this._startHeight + this.turnHeight * angle / TAU;
            const axisComponent = scaleVector(this._axisDirection, height);
            const point = addVectors(
                this.axisBasePoint,
                addVectors(scaleVector(radialComponent, this.radius), axisComponent)
            );

            points.push(point);
        }

        return points;
    }
}

function toPoint3d(point, name) {
    if (!Array.isArray(point) || point.length !== 3) {
        throw new Error(`${name} must be a 3D point in the form [x, y, z].`);
    }

    return [point[0], point[1], point[2]];
}

function createUniformKnots(controlPointCount, degree) {
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

module.exports = Helix;
