
import * as fs from 'fs'
import signale from 'signale'
import nunjucks from 'nunjucks'

import constants from '../constants.js'
import { Bookmark } from '../models/bookmark.js'
import { Store } from '../store.js'
import { Folder } from '../models/folder.js'

interface ChromeBookmarkFolder {
  children: ChromeBookmarkUrl[]
  date_added: string
  date_modified: string
  guid: string
  id: string
  name: string
  type: 'folder'
}

interface ChromeBookmarkUrl {
  date_added: string
  guid: string
  id: string
  name: string
  type: 'url'
  url: string
}

interface ChromeBookmarks {
  checksum: string
  roots: {
    bookmark_bar: {
      children: ChromeBookmarkFolder[]
    }
    other: unknown
    synced: unknown
  }
  sync_metadata: string
  version: '1'
}

interface Datum {
  folder: Folder | undefined
  bookmark: Bookmark
}

const sortFolders = (data0: Datum, data1: Datum): number => {
  return data0.folder?.folder?.localeCompare(data1.folder?.folder ?? 'zzzzzz') ?? 0
}

/**
 * A class for interacting with Chrome
 */
export class Chrome {
  bookmarkPath: string
  bookmarks: ChromeBookmarks

  constructor (bookmarkPath: string) {
    this.bookmarkPath = bookmarkPath
  }

  /**
   * Read existing bookmark information from Chrome.
   *
   */
  async initialise (): Promise<void> {
    try {
      const content = await fs.promises.readFile(this.bookmarkPath)
      this.bookmarks = JSON.parse(content.toString())
    } catch (err) {
      signale.error(`${constants.codes.FAILED_BOOKMARK_READ}: failed to read Chrome bookmarks: ${err.message as string}`)
      process.exit(1)
    }
  }

  static listFolders (children: Array<ChromeBookmarkUrl | ChromeBookmarkFolder>, path: string): string[] {
    let members: string[] = []

    for (const child of children) {
      if (child.type === 'folder') {
        const currentPath = `${path}/${child.name}`
        const subfolders = Chrome.listFolders(child.children, currentPath)
        members = members.concat(...subfolders, currentPath)
      }
    }

    return Array.from(new Set(members))
  }

  /**
   * List all bookmark-folders
   *
   * @returns an array of folders
   */
  folderNames (): string[] {
    return Chrome.listFolders(this.bookmarks.roots.bookmark_bar.children, '')
  }

  /**
   * Generate a bookmark file
   *
   * @param store
   * @returns
   */
  async asBookmarkFile (store: Store): Promise<string> {
    const data = await store.getAllBookmarks()

    const byFolder: Record<string, Bookmark[]> = { }

    for (const { folder, bookmark } of data.sort(sortFolders)) {
      const label = folder?.folder ?? 'unknown'

      if (!byFolder[label]) {
        byFolder[label] = []
      }

      byFolder[label].push(bookmark)
    }

    return nunjucks.renderString(`
    <!DOCTYPE NETSCAPE-Bookmark-file-1>
    <META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
    <TITLE>Bookmarks</TITLE>
    <H1>Bookmarks</H1>

    <DL><p>
      <DL><p>
      {% for folder, bookmarks in byFolder %}
        <DT><H3>{{folder}}</H3>
        <DL><p>
          {% for bookmark in bookmarks %}
            <DT><A HREF="{{bookmark.href}}">{{bookmark.description}}</A>
          {% endfor %}
        </DL></p>
        {% endfor %}
      </DL><p>
    </DL><p>
    `, { byFolder })
  }
}
