module.exports = {
    getIp(request) {

        const req = request.request // access nodejs native request obj

        return req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',').pop() ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress
    }
}
