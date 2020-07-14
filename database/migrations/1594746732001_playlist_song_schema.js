'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PlaylistSongSchema extends Schema {
  up () {
    this.create('playlist_songs', (table) => {
      table.increments()
      table.integer('song_id')
      table.integer('playlist')
      table.timestamps()
    })
  }

  down () {
    this.drop('playlist_songs')
  }
}

module.exports = PlaylistSongSchema
