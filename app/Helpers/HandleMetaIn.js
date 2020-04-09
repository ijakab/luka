const throw400 = use('App/Helpers/Throw400')

module.exports = function (meta) {
    if(!meta) return '{}'
    try{
        return JSON.stringify(meta)
    } catch (e) {
        return throw400('error.badMeta')
    }
}
