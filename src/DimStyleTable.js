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
