const BaseService = use('App/Services/BaseService')
const Song = use('App/Models/Song')

class SongController {
    constructor() {
        this.service = new BaseService(Song)
    }
    
    async index({request, user}) {
        const filters = request.post()
        return await this.service.getAll(filters).paginable(filters)
    }
    
    async create({request}) {
        return await this.service.create(request.post())
    }
    
    async attach({request}) {
        const songId = request.input('songId')
        const song = await Song.findOrFail(songId)
        await song.playlist().attach([request.input('playlistId')])
        return {}
    }
    
    async update({params, request}) {
        return await this.service.update(params.id, request.post())
    }
    
    async delete({params}) {
        return this.service.delete(params.id)
    }
}

module.exports = SongController
