'use strict'
const Route = use('Route')

module.exports = Route.group(() => {
    
    Route.post('/filter', 'PlaylistController.index')
    
    Route.post('/create', 'PlaylistController.create')
    
    Route.patch('/update/:id', 'PlaylistController.update')
    
    Route.delete('/delete/:id', 'PlaylistController.delete')
    
})

