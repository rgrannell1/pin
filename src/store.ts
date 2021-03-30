
import knex, { Knex } from 'knex'

import { Folder } from './models/folder.js'
import { Bookmark } from './models/bookmark.js'

export class Store {
  client: Knex

  constructor (fpath: string) {
    this.client = knex({
      client: 'sqlite3',
      connection: {
        filename: fpath
      },
      useNullAsDefault: true
    })
  }

  /**
   * Perform any database initialisation like table-creation required
   *
   */
  async initialise (): Promise<void> {
    if (!await this.client.schema.hasTable('bookmark')) {
      await this.client.schema
        .createTable('bookmark', table => {
          table.string('href')
          table.string('description')
          table.string('extended')
          table.string('meta')
          table.string('hash')
          table.string('time')
          table.string('shared')
          table.string('toread')
          table.string('tags')

          table.primary(['href'])
        })
    }

    if (!await this.client.schema.hasTable('folders')) {
      await this.client.schema
        .createTable('folders', table => {
          table.string('href')
          table.string('folder')

          table.primary(['href'])
        })
    }

    if (!await this.client.schema.hasTable('lastUpdate')) {
      await this.client.schema
        .createTable('lastUpdate', table => {
          table.string('id')
          table.string('time')

          table.primary(['id'])
        })
    }
  }

  /**
   * Save the last time Pinboard reported updating to the Pin DB
   *
   * @param time a timestamp string reported by Pinboard
   */
  async setUpdateTime (time: string): Promise<void> {
    await this.client('lastUpdate')
      .insert({ id: 'lastUpdate', time })
      .onConflict('id')
      .merge()
  }

  /**
   * Get the last time Pinboard reported updating from the Pin DB
   *
   * @returns the stored update time
   */
  async getUpdateTime (): Promise<string | undefined> {
    const [match] = await this.client('lastUpdate').select('*')

    return match.time
  }

  /**
   * Fetch a bookmark by row-number in the database
   *
   * @param cursor a number
   *
   * @returns a bookmark
   */
  async getBookmark (cursor: number): Promise<Bookmark> {
    const matches = await this.client('bookmark').select('*').limit(1).offset(cursor)

    return new Bookmark(matches[0])
  }

  /**
   * Get the number of bookmarks saved to the Pin database
   *
   * @returns a count of bookmarks
   */
  async getBookmarkCount (): Promise<number> {
    const [result] = await this.client('bookmark').count()

    const value = parseInt(result['count(*)'] as any) ?? 0
    return value
  }

  /**
   * Get folder data given a href
   *
   * @param href a href to a bookmark
   *
   * @returns a folder, if one is present
   */
  async getFolder (href: string): Promise<Folder | undefined> {
    const [result] = await this.client('folders').select('folder').where('href', href)

    if (typeof result !== 'undefined') {
      return new Folder(result.href, result.folder)
    }
  }

  /**
   * Get a list of folders currently used by bookmarks in Pin's DB
   *
   * @returns a list of folder names
   */
  async getFolders (): Promise<string[]> {
    const matches = await this.client('folders').select('folder')

    return matches.map(match => match.folder)
  }

  /**
   * Add a bookmark to the database
   *
   * @param bookmark a bookmark object
   */
  async addBookmark (bookmark: Bookmark): Promise<void> {
    await this.client('bookmark')
      .insert(bookmark)
      .onConflict('href')
      .merge()
  }

  /**
   * Add a folder to a particular bookmark.
   *
   * @param folder a folder object
   */
  async addFolder (folder: Folder): Promise<void> {
    await this.client('folders')
      .insert(folder)
      .onConflict('href')
      .merge()
  }
}
