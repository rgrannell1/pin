import * as fs from 'fs';
import signale from 'signale';
import escapeHtml from 'escape-html';
import constants from '../constants.js';
/**
 * A class for interacting with Chrome
 */
export class Chrome {
    constructor(bookmarkPath) {
        this.bookmarkPath = bookmarkPath;
    }
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
    async asBookmarkFile(store) {
        const data = await store.getAllBookmarks();
        const byFolder = {};
        for (const { folder, bookmark } of data) {
            const label = folder?.folder ?? 'unknown';
            if (!byFolder[label]) {
                byFolder[label] = [];
            }
            byFolder[label].push(bookmark);
        }
        let folders = '';
        for (const [folder, bookmarks] of Object.entries(byFolder)) {
            let message = `<DT><H3>${folder}</H3>\n<DL><p>`;
            for (const bookmark of bookmarks) {
                message += `<DT><A HREF="${bookmark.href}">${escapeHtml(bookmark.description)}</A>\n`;
            }
            folders += message + '</DL><p>\n';
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
    `;
    }
}
//# sourceMappingURL=chrome.js.map