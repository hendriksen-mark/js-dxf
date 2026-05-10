const DatabaseObject = require("./DatabaseObject");
const TagsManager = require("./TagsManager");

class LineType extends DatabaseObject {
  /**
   * @param {string} name
   * @param {string} description
   * @param {array} elements - if elem > 0 it is a line, if elem < 0 it is gap, if elem == 0.0 it is a
   */
  constructor(name, description, elements) {
    super(["AcDbSymbolTableRecord", "AcDbLinetypeTableRecord"]);
    this.name = name;
    this.description = description;
    this.elements = elements;
  }

  /**
   * @param {TagsManager} manager
   * @returns {Promise<void>}
   */
  async tags(manager) {
    //https://help.autodesk.com/view/OARX/2027/ENU/?guid=GUID-F57A316C-94A2-416C-8280-191E34B182AC
    await manager.push(0, "LTYPE");
    await super.tags(manager);
    await manager.push(2, this.name);
    await manager.push(3, this.description);
    await manager.push(70, 0);
    await manager.push(72, 65);
    await manager.push(73, this.elements.length);
    await manager.push(40, this.getElementsSum());

    for (const element of this.elements) {
      await manager.push(49, element);
      await manager.push(74, 0);
    }
  }

  getElementsSum() {
    return this.elements.reduce((sum, element) => {
      return sum + Math.abs(element);
    }, 0);
  }
}

module.exports = LineType;
