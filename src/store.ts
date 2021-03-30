
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

  async setUpdateTime (time: string): Promise<void> {
    await this.client('lastUpdate')
      .insert({ id: 'lastUpdate', time })
      .onConflict('id')
      .merge()
  }

  async getUpdateTime (): Promise<string> {
    const [match] = await this.client('lastUpdate').select('*')

    return match.time as string
  }

  async getBookmark (cursor: number): Promise<Bookmark> {
    const matches = await this.client('bookmark').select('*').limit(1).offset(cursor)

    return new Bookmark(matches[0])
  }

  async getBookmarkCount (): Promise<number> {
    const [result] = await this.client('bookmark').count()

    const value = parseInt(result['count(*)'] as any) ?? 0
    return value
  }

  async getFolder (href: string): Promise<Folder | undefined> {
    const [result] = await this.client('folders').select('folder').where('href', href)

    if (typeof result !== 'undefined') {
      return new Folder(result.href, result.folder)
    }
  }

  async getFolders (): Promise<string[]> {
    const matches = await this.client('folders').select('folder')

    return matches.map(match => match.folder)
  }

  async addBookmark (bookmark: Bookmark): Promise<void> {
    await this.client('bookmark')
      .insert(bookmark)
      .onConflict('href')
      .merge()
  }

  async addFolder (folder: Folder): Promise<void> {
    await this.client('folders')
      .insert(folder)
      .onConflict('href')
      .merge()
  }
}
