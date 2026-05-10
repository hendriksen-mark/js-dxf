declare module '@markhhh/dxf-writer' {
  type Unit =
    | 'Unitless'
    | 'Inches'
    | 'Feet'
    | 'Miles'
    | 'Millimeters'
    | 'Centimeters'
    | 'Meters'
    | 'Kilometers'
    | 'Microinches'
    | 'Mils'
    | 'Yards'
    | 'Angstroms'
    | 'Nanometers'
    | 'Microns'
    | 'Decimeters'
    | 'Decameters'
    | 'Hectometers'
    | 'Gigameters'
    | 'Astronomical units'
    | 'Light years'
    | 'Parsecs';

  type HorizontalAlignment = 'left' | 'center' | 'right';
  type VerticalAlignment = 'baseline' | 'bottom' | 'middle' | 'top';

  type Point2D = [number, number];
  type Point3D = [number, number, number];

  // [GroupCode, value]
  type HeaderValue = [number, number];

  abstract class Taggable {
    tags(manager: TagsManager): Promise<void>;
  }

  abstract class Block extends Taggable {
    constructor(name: string);
  }

  abstract class Table extends Taggable {
    constructor(name: string);
    add(element: object): void;
  }

  abstract class TagsManager {
    point(x: number, y: number, z?: number): Promise<void>;
    start(name: string): Promise<void>;
    end(): Promise<void>;
    addHeaderVariable(name: string, tagsElements: HeaderValue[]): Promise<void>;
    push(code: string | number, value: string | number): Promise<void>;
    finaliseWriting(): Promise<void>;
  }

  class Arc extends Taggable {
    public x1: number;
    public y1: number;
    public r: number;
    public startAngle: number;
    public endAngle: number;

    /**
     * @param {number} x1 - Center x
     * @param {number} y1 - Center y
     * @param {number} r - radius
     * @param {number} startAngle - degree
     * @param {number} endAngle - degree
     */
    constructor(
      x1: number,
      y1: number,
      r: number,
      startAngle: number,
      endAngle: number
    );
  }

  class Circle extends Taggable {
    public x1: number;
    public y1: number;
    public r: number;

    /**
     * @param {number} x1 - Center x
     * @param {number} y1 - Center y
     * @param {number} r - radius
     */
    constructor(x1: number, y1: number, r: number);
  }

  class Cylinder extends Taggable {
    public x1: number;
    public y1: number;
    public z1: number;
    public r: number;
    public thickness: number;
    public extrusionDirectionX: number;
    public extrusionDirectionY: number;
    public extrusionDirectionZ: number;

    /**
     * @param {number} x1 - Center x
     * @param {number} y1 - Center y
     * @param {number} z1 - Center z
     * @param {number} r - radius
     * @param {number} thickness - thickness
     * @param {number} extrusionDirectionX - Extrusion Direction x
     * @param {number} extrusionDirectionY - Extrusion Direction y
     * @param {number} extrusionDirectionZ - Extrusion Direction z
     */
    constructor(
      x1: number,
      y1: number,
      z1: number,
      r: number,
      thickness: number,
      extrusionDirectionX: number,
      extrusionDirectionY: number,
      extrusionDirectionZ: number
    );
  }

  class Face extends Taggable {
    public x1: number;
    public y1: number;
    public z1: number;
    public x2: number;
    public y2: number;
    public z2: number;
    public x3: number;
    public y3: number;
    public z3: number;
    public x4: number;
    public y4: number;
    public z4: number;

    constructor(
      x1: number,
      y1: number,
      z1: number,
      x2: number,
      y2: number,
      z2: number,
      x3: number,
      y3: number,
      z3: number,
      x4: number,
      y4: number,
      z4: number
    );
  }

  class Layer extends Taggable {
    public name: string;
    public colorNumber: number;
    public lineTypeName: string;
    public shapes: RenderableToDxf[];
    public trueColor: number;

    constructor(name: string, colorNumber: number, lineTypeName: string);

    setTrueColor(color: number): void;
    writeShapes(space: Block, manager: TagsManager, shape: Taggable): void;
  }

  class Line extends Taggable {
    public x1: number;
    public y1: number;
    public x2: number;
    public y2: number;

    constructor(x1: number, y1: number, x2: number, y2: number);
  }

  class LineType extends Taggable {
    public name: string;
    public description: string;
    public elements: Array<number>;
    /**
     * @param {string} name
     * @param {string} description
     * @param {array} elements - if elem > 0 it is a line, if elem < 0 it is gap, if elem == 0.0 it is a
     */
    constructor(name: string, description: string, elements: Array<number>);
    getElementsSum(): number;
  }

  class Point extends Taggable {
    public x: number;
    public y: number;

    constructor(x: number, y: number);
  }

  class Polyline extends Taggable {
    public points: Array<Point2D>;

    constructor(points: Array<Point2D>);
  }

  class Polyline3D extends Taggable {
    public points: Array<Point3D>;

    constructor(points: Array<Point3D>);
  }

  class Text extends Taggable {
    public x1: number;
    public y1: number;
    public height: number;
    public rotation: number;
    public value: string;
    public horizontalAlignment: HorizontalAlignment;
    public verticalAlignment: VerticalAlignment;
    /**
     * @param {number} x1 - x
     * @param {number} y1 - y
     * @param {number} height - Text height
     * @param {number} rotation - Text rotation
     * @param {string} value - the string itself
     * @param {HorizontalAlignment} [horizontalAlignment="left"] left | center | right
     * @param {VerticalAlignment} [verticalAlignment="baseline"] baseline | bottom | middle | top
     */
    constructor(
      x1: number,
      y1: number,
      height: number,
      rotation: number,
      value: string,
      horizontalAlignment?: HorizontalAlignment,
      verticalAlignment?: VerticalAlignment
    );
  }

  class Mesh extends Taggable {
    public vertices: Point3D[];
    public faceIndices: number[][];

    constructor(vertices: number[][], faceIndices: number[][]);
  }

  class Helix extends Taggable {
    public axisBasePoint: Point3D;
    public startPoint: Point3D;
    public axisVector: Point3D;
    public radius: number;
    public turns: number;
    public turnHeight: number;
    public handedness: number;
    public constrainType: number;
    public majorReleaseNumber: number;
    public maintenanceReleaseNumber: number;

    constructor(
      axisBasePoint: Point3D,
      startPoint: Point3D,
      axisVector: Point3D,
      turns: number,
      turnHeight: number,
      handedness?: number,
      constrainType?: number,
      majorReleaseNumber?: number,
      maintenanceReleaseNumber?: number,
      segmentsPerTurn?: number
    );
  }

  type ACIKey =
    | 'LAYER'
    | 'RED'
    | 'YELLOW'
    | 'GREEN'
    | 'CYAN'
    | 'BLUE'
    | 'MAGENTA'
    | 'WHITE';

  export class StringWritableStream {
    constructor();
    addEventListener(event: 'finish' | 'error', callback: () => void): void;
    removeEventListener(event: 'finish' | 'error', callback: () => void): void;
    write(data: string | Uint8Array): boolean;
    end(): void;
    toString(): string;
  }
  export class BrowserFriendlyDrawing {
    constructor(stream: StringWritableStream);

    addBlock(name: string): Block;
    addLayer(name: string, colorNumber: number, lineTypeName: string): this;

    /**
     * @param {string} name
     * @param {string} description
     * @param {array} elements - if elem > 0 it is a line, if elem < 0 it is gap, if elem == 0.0 it is a
     * @returns {this}
     */
    addLineType(
      name: string,
      description: string,
      elements: Array<number>
    ): this;

    addTable(name: string): Table;

    /**
     * @param {number} x1 - Center x
     * @param {number} y1 - Center y
     * @param {number} r - radius
     * @param {number} startAngle - degree
     * @param {number} endAngle - degree
     * @returns {Promise<this>}
     */
    drawArc(
      x1: number,
      y1: number,
      r: number,
      startAngle: number,
      endAngle: number
    ): Promise<this>;

    /**
     * @param {number} x1 - Center x
     * @param {number} y1 - Center y
     * @param {number} r - radius
     * @returns {Promise<this>}
     */
    drawCircle(x1: number, y1: number, r: number): Promise<this>;

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
    drawCylinder(
      x1: number,
      y1: number,
      z1: number,
      r: number,
      thickness: number,
      extrusionDirectionX: number,
      extrusionDirectionY: number,
      extrusionDirectionZ: number
    ): Promise<this>;

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
    drawEllipse(
      x1: number,
      y1: number,
      majorAxisX: number,
      majorAxisY: number,
      axisRatio: number,
      startAngle?: number,
      endAngle?: number
    ): Promise<this>;

    drawHelix(
      axisBasePoint: Point3D,
      startPoint: Point3D,
      axisVector: Point3D,
      turns: number,
      turnHeight: number,
      handedness?: number,
      constrainType?: number,
      majorReleaseNumber?: number,
      maintenanceReleaseNumber?: number
    ): Promise<this>;

    drawFace(
      x1: number,
      y1: number,
      z1: number,
      x2: number,
      y2: number,
      z2: number,
      x3: number,
      y3: number,
      z3: number,
      x4: number,
      y4: number,
      z4: number
    ): Promise<this>;

    drawLine(x1: number, y1: number, x2: number, y2: number): Promise<this>;

    /**
     * @param {number} x1
     * @param {number} y1
     * @param {number} z1
     * @param {number} x2
     * @param {number} y2
     * @param {number} z2
     * @returns {Promise<this>}
     */
    drawLine3d(
      x1: number,
      y1: number,
      z1: number,
      x2: number,
      y2: number,
      z2: number
    ): Promise<this>;

    /**
     * @param {[number, number, number][]} vertices - Array of vertices like [ [x1, y1, z3], [x2, y2, z3]... ]
     * @param {number[][]} faceIndices - Array of face indices
     * @returns {Promise<this>}
     */
    drawMesh(vertices: Point3D[], faceIndices: number[][]): Promise<this>;

    drawPoint(x: number, y: number, z?: number): Promise<this>;

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
    drawPolygon(
      x: number,
      y: number,
      numberOfSides: number,
      radius: number,
      rotation?: number,
      circumscribed?: boolean
    ): Promise<this>;

    /**
     * @param {array} points - Array of points like [ [x1, y1], [x2, y2]... ]
     * @param {boolean} closed - Closed polyline flag
     * @param {number} startWidth - Default start width
     * @param {number} endWidth - Default end width
     * @returns {Promise<this>}
     */
    drawPolyline(
      points: Array<Point2D>,
      closed?: boolean,
      startWidth?: number,
      endWidth?: number
    ): Promise<this>;

    /**
     * @param {array} points - Array of points like [ [x1, y1, z1], [x2, y2, z1]... ]
     * @returns {Promise<this>}
     */
    drawPolyline3d(points: Array<Point3D>): Promise<this>;

    /**
     * draws a closed rectangular polyline with option for round or diagonal corners
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @param {number} cornerLength given P (the 90deg corner point), and P1 (the point where arc begins), where cornerLength is the length of P to P1
     * @param {number} cornerBulge defaults to 0, for diagonal corners
     * @returns {Promise<this>}
     */
    drawRect(
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      cornerLength?: number,
      cornerBulge?: number
    ): Promise<this>;

    /**
     * Draw a spline.
     * @param {[Array]} controlPoints - Array of control points like [ [x1, y1], [x2, y2]... ]
     * @param {number | undefined} degree - Degree of spline: 2 for quadratic, 3 for cubic. Default is 3
     * @param {[number] | undefined} knots - Knot vector array. If null, will use a uniform knot vector. Default is null
     * @param {[number] | undefined} weights - Control point weights. If provided, must be one weight for each control point. Default is null
     * @param {[Array] | undefined} fitPoints - Array of fit points like [ [x1, y1], [x2, y2]... ]
     * @returns {Promise<this>}
     */
    drawSpline(
      controlPoints: Array<Point2D>,
      degree?: number,
      knots?: number[],
      weights?: number[],
      fitPoints?: Array<Point2D>
    ): Promise<this>;

    /**
     * @param {number} x1 - x
     * @param {number} y1 - y
     * @param {number} height - Text height
     * @param {number} rotation - Text rotation
     * @param {string} value - the string itself
     * @param {HorizontalAlignment} [horizontalAlignment="left"] left | center | right
     * @param {VerticalAlignment} [verticalAlignment="baseline"] baseline | bottom | middle | top
     * @returns {Promise<this>}
     */
    drawText(
      x1: number,
      y1: number,
      height: number,
      rotation: number,
      value: string,
      horizontalAlignment?: HorizontalAlignment,
      verticalAlignment?: VerticalAlignment
    ): Promise<this>;

    /**
     * @param {number} x1 - x
     * @param {number} y1 - y
     * @param {number} z1 - z
     * @returns {Promise<this>}
     */
    drawVertex(x1: number, y1: number, z1: number): Promise<this>;

    end(): Promise<void>;

    /**
     * @see https://www.autodesk.com/techpubs/autocad/acadr14/dxf/header_section_al_u05_c.htm
     * @see https://www.autodesk.com/techpubs/autocad/acad2000/dxf/header_section_group_codes_dxf_02.htm
     *
     * @param {string} variable
     * @param {array} values Array of "two elements arrays". [  [value1_GroupCode, value1_value], [value2_GroupCode, value2_value]  ]
     * @returns {this}
     *
     */
    header(variable: string, values: Array<HeaderValue>): this;

    setActiveLayer(name: string): this;

    /**
     * @param {number} trueColor - Integer representing the true color, can be passed as an hexadecimal value of the form 0xRRGGBB
     * @returns {this}
     */
    setTrueColor(trueColor: number): this;

    /**
     *
     * @param {string} unit see Drawing.UNITS
     * @returns {this}
     */
    setUnits(unit: Unit): this;

    /**
     * AutoCAD Color Index (ACI)
     * @see http://sub-atomic.com/~moses/acadcolors.html
     */
    static ACI: { [key in ACIKey]: number };

    static LINE_TYPES: LineType[];

    static LAYERS: Layer[];

    /**
     * @see https://www.autodesk.com/techpubs/autocad/acad2000/dxf/header_section_group_codes_dxf_02.htm
     */
    static UNITS: { [key in Unit]: number };
  }

  export class NodeJsDrawing extends BrowserFriendlyDrawing {
    constructor(stream: NodeJS.WritableStream);
  }
}
