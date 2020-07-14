const BaseService = use('App/Services/BaseService')
const Playlist = use('App/Models/Playlist')

class SongController {
    constructor() {
        this.service = new BaseService(Playlist)
    }
    
    async index({request, user}) {
        const filters = request.post()
        return await this.service.getAll(filters).paginable(filters)
    }
    
    async single({params}) {
        return await Playlist.query()
            .where('id', params.id)
            .with('songs')
            .firstOrFail()
    }
    
    async create({request}) {
        return await this.service.create(request.post())
    }
    
    async update({params, request}) {
        return await this.service.update(params.id, request.post())
    }
    
    async delete({params}) {
        return this.service.delete(params.id)
    }
}

module.exports = SongController
