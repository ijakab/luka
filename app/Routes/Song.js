'use strict'
const Route = use('Route')

module.exports = Route.group(() => {
    
    Route.post('/filter', 'SongController.index')
    
    Route.post('/create', 'SongController.create')
    
    Route.post('/attach', 'SongController.attach')
    
    Route.patch('/update/:id', 'SongController.update')
    
    Route.delete('/delete/:id', 'SongController.delete')
    
    
})

