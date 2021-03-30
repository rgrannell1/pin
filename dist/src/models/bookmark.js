/**
 * A model containing Pinboard bookmark information
 */
export class Bookmark {
    constructor(opts) {
        this.href = opts.href;
        this.description = opts.description;
        this.extended = opts.extended;
        this.meta = opts.meta;
        this.hash = opts.hash;
        this.time = opts.time;
        this.shared = opts.shared;
        this.toread = opts.toread;
        this.tags = opts.tags;
    }
}
//# sourceMappingURL=bookmark.js.map