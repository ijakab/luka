class AttributeTraitBase {
    static namesOnly(attributes) {
        return attributes.map(attr => attr.name)
    }

    static whereTrue(attributes, attrName) {
        return attributes.filter(attr => attr[attrName])
    }

    static whereTrueNameOnly(attributes, attrName) {
        return this.namesOnly(this.whereTrue(attributes, attrName))
    }
}

module.exports = AttributeTraitBase