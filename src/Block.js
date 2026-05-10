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
