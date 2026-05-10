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
