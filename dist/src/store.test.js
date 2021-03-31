import { parts } from '@rgrannell/revexp';
import { Store } from '../src/store.js';
import { Explanation, Hypothesis } from 'atypical';
import { Bookmark } from './models/bookmark.js';
const tablesExistHypothesis = new Hypothesis({ description: 'All tables exist' })
    .cases(function* () {
    yield ['bookmark'];
    yield ['folders'];
    yield ['lastUpdate'];
})
    .always(async (tableName) => {
    const store = new Store(':memory:');
    await store.initialise();
    const tableExists = await store.client.schema.hasTable(tableName);
    await store.close();
    return tableExists;
});
{
    const year = parts.repeat(parts.digit, { from: 4, to: 4 });
    const month = parts.or([
        parts.nonZeroDigit,
        parts.and(['1', parts.oneOf(['0', '1', '2'])()])
    ]);
    const day = parts.or([
        parts.nonZeroDigit,
        parts.and(['1', parts.digit]),
        parts.and(['2', parts.digit]),
        '31'
    ]);
    const hour = parts.or([
        parts.and([parts.oneOf(['0', '1'])(), parts.digit]),
        '20', '21', '22', '23'
    ]);
    const minute = parts.and([parts.oneOf(['0', '1', '2', '3', '4', '5'])(), parts.digit]);
    const second = parts.and([parts.oneOf(['0', '1', '2', '3', '4', '5'])(), parts.digit]);
    var timestamp = parts.fromTemplate `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
}
const getSetUpdateTimeHypothesis = new Hypothesis({ description: 'Setting a time and retrieving it always retuns the same time' })
    .cases(function* () {
    while (true) {
        yield [timestamp().join('')];
    }
})
    .always(async (time) => {
    const store = new Store(':memory:');
    await store.initialise();
    await store.setUpdateTime(time);
    const retrieved = await store.getUpdateTime();
    await store.close();
    return time === retrieved;
});
const getSetBookmarkHypothesis = new Hypothesis({ description: 'Getting and setting a bookmark always retrieves the same bookmark' })
    .cases(function* () {
    while (true) {
        const bookmark = new Bookmark({
            href: parts.digit(),
            description: parts.digit(),
            extended: parts.digit(),
            meta: parts.digit(),
            hash: parts.digit(),
            time: parts.digit(),
            shared: parts.digit(),
            toread: parts.digit(),
            tags: parts.digit()
        });
        yield [bookmark];
    }
})
    .always(async (bookmark) => {
    const store = new Store(':memory:');
    await store.initialise();
    await store.client('bookmark').del();
    await store.addBookmark(bookmark);
    const retrieved = await store.getBookmark(0);
    const count = await store.getBookmarkCount();
    await store.close();
    for (const key of Object.keys(bookmark)) {
        const keyEqual = bookmark[key] === retrieved[key];
        if (!keyEqual) {
            return new Explanation({
                description: 'key mismatch',
                data: {
                    provided: bookmark,
                    returned: retrieved
                }
            });
        }
    }
    return true;
});
//const multipleBookmarkHypothesis = new Hypothesis({ description: 'The correct row and count are retuned when multiple bookmarks are set' })
//const getSetFolderHypothesis = new Hypothesis({ description: 'Getting and setting a folder always returns the same folder' })
export default {
    tablesExistHypothesis,
    getSetUpdateTimeHypothesis,
    getSetBookmarkHypothesis,
    //multipleBookmarkHypothesis,
    //getSetFolderHypothesis
};
//# sourceMappingURL=store.test.js.map