'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SongSchema extends Schema {
  up () {
    this.create('songs', (table) => {
      table.increments()
      table.string('title')
      table.string('filename')
      table.text('meta')
      table.timestamps()
    })
  }

  down () {
    this.drop('songs')
  }
}

module.exports = SongSchema
