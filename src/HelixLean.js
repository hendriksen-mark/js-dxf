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
