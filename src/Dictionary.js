const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class Dictionary extends DatabaseObject {
    constructor() {
        super("AcDbDictionary");
        this.children = {};
    }

    /**
     *
     * @param {*} name
     * @param {DatabaseObject} dictionary
     */
    addChildDictionary(name, dictionary) {
        dictionary.ownerObjectHandle = this.handle;
        this.children[name] = dictionary;
    }

    /**
     * @param {TagsManager} manager
     * @returns {Promise<void>}
     */
    async tags(manager) {
        //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-40B92C63-26F0-485B-A9C2-B349099B26D0
        await manager.push(0, "DICTIONARY");
        await super.tags(manager);
        /* Duplicate record cloning flag - keep existing */
        await manager.push(281, 1);

        const entries = Object.entries(this.children);
        for (const entry of entries) {
            const [name, dic] = entry;
            await manager.push(3, name);
            await manager.push(350, dic.handle);
        }

        const children = Object.values(this.children);
        for (const c of children) {
            await c.tags(manager);
        }
    }
}

module.exports = Dictionary;
