'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PlaylistSongSchema extends Schema {
  up () {
    this.table('playlist_songs', (table) => {
      table.integer('playlist_id')
    })
  }

  down () {
    this.table('playlist_songs', (table) => {
      // reverse alternations
    })
  }
}

module.exports = PlaylistSongSchema
