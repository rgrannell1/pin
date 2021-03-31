
import * as fs from 'fs'
import signale from 'signale'
import escapeHtml from 'escape-html'

import constants from '../constants.js'
import { Bookmark } from '../models/bookmark.js'
import { Store } from '../store.js'

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

/**
 * A class for interacting with Chrome
 */
export class Chrome {
  bookmarkPath: string
  bookmarks: ChromeBookmarks

  constructor (bookmarkPath: string) {
    this.bookmarkPath = bookmarkPath
  }

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

  async asBookmarkFile (store: Store): Promise<string> {
    const data = await store.getAllBookmarks()

    const byFolder: Record<string, Bookmark[]> = { }

    for (const {folder, bookmark} of data) {
      const label = folder?.folder ?? 'unknown'

      if (!byFolder[label]) {
        byFolder[label] = []
      }

      byFolder[label].push(bookmark)
    }

    let folders = ''

    for (const [folder, bookmarks] of Object.entries(byFolder)) {
      let message = '<DL><p>'

      for (const bookmark of bookmarks) {
        message += `<DT><A HREF="${bookmark.href}">${escapeHtml(bookmark.description)}</A>\n`
      }

      folders += message + '</DL><p>\n'
    }

    return `
    <!DOCTYPE NETSCAPE-Bookmark-file-1>
    <META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
    <TITLE>Bookmarks</TITLE>
    <H1>Bookmarks</H1>
    <DL><p>
      <DT><H3 PERSONAL_TOOLBAR_FOLDER="true">Bookmarks bar</H3>
      ${folders}
    </DL><p>
    `
  }
}
