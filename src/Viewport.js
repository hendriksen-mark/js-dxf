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
