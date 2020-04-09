module.exports = (status, msg, data) => {
    let error = new Error()
    error.status = status || 500
    error.message = msg
    if (data) error._data = data
    throw error
}
