import * as fs from 'fs';
import signale from 'signale';
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
}
//# sourceMappingURL=chrome.js.map