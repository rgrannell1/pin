import * as fs from 'fs';
import signale from 'signale';
import nunjucks from 'nunjucks';
import constants from '../constants.js';
/**
 * Sort folders by name
 *
 * @param data0
 * @param data1
 *
 * @returns
 */
const sortFolders = (data0, data1) => {
    return data0.folder?.folder?.localeCompare(data1.folder?.folder ?? 'zzzzzz') ?? 0;
};
/**
 * A class for interacting with Chrome
 */
export class Chrome {
    constructor(bookmarkPath) {
        this.bookmarkPath = bookmarkPath;
    }
    /**
     * Read existing bookmark information from Chrome.
     *
     */
    async initialise() {
        try {
            const content = await fs.promises.readFile(this.bookmarkPath);
            this.bookmarks = JSON.parse(content.toString());
        }
        catch (err) {
            signale.error(`${constants.codes.FAILED_BOOKMARK_READ}: failed to read Chrome bookmarks: ${err.message}`);
            process.exit(1);
        }
    }
    /**
     * List folders in Chrome's bookmarks
     *
     * @param children Chrome bookmark children
     * @param path the property path currently being examined
     *
     * @returns an array of unique folder-names
     */
    static listFolders(children, path) {
        let members = [];
        for (const child of children) {
            if (child.type === 'folder') {
                const currentPath = `${path}/${child.name}`;
                const subfolders = Chrome.listFolders(child.children, currentPath);
                members = members.concat(...subfolders, currentPath);
            }
        }
        return Array.from(new Set(members));
    }
    /**
     * List all bookmark-folders
     *
     * @returns an array of folders
     */
    folderNames() {
        return Chrome.listFolders(this.bookmarks.roots.bookmark_bar.children, '');
    }
    /**
     * Generate a bookmark file from all stored bookmarks.
     *
     * @param store
     * @returns
     */
    async asBookmarkFile(store) {
        const data = await store.getAllBookmarks();
        const byFolder = {};
        for (const { folder, bookmark } of data.sort(sortFolders)) {
            const label = folder?.folder ?? 'unknown';
            if (!byFolder[label]) {
                byFolder[label] = [];
            }
            byFolder[label].push(bookmark);
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
    `, { byFolder });
    }
}
//# sourceMappingURL=chrome.js.map