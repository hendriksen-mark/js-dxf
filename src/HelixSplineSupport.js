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
