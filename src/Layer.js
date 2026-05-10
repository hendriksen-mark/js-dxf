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
