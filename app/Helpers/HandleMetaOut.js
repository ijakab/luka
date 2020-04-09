module.exports = function (meta) {
    if(!meta) return {}
    try{
        let obj = JSON.parse(meta)
        if(typeof obj === 'string') obj = JSON.parse(obj)
        return obj
    } catch (e) {
        return {}
    }
}
