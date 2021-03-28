
import * as fs from 'fs'
import { Bookmark } from './apis/pinboard.js'

export interface StoreData {
  updateTime: string
  bookmarks: Bookmark[]
  folders: Record<string, string>
}

export class Store {
  fpath: string

  constructor (fpath: string) {
    this.fpath = fpath
  }

  async read (): Promise<StoreData | undefined> {
    const exists = await fs.promises.access(this.fpath, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false)

    if (!exists) {
      return
    }

    const content = await fs.promises.readFile(this.fpath)
    return JSON.parse(content.toString()) as StoreData
  }

  async write (data: StoreData): Promise<void> {
    await fs.promises.writeFile(this.fpath, JSON.stringify(data, null, 2))
  }
}
