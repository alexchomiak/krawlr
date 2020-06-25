import { DataExtractor } from './DataExtractor'
import { DataStore } from '../DataStore'
import { Activity } from '.'
/*
    @description DOMParserHandler that takes in DOM string and returns parsed data
    @param data String
*/
type DOMParserHandler<T> = (data: String, ref: Activity) => Promise<T>

export class DOMParser<T> extends DataExtractor<T> {
    /*
        @property handler
        @private
    */
    private handler: DOMParserHandler<T>

    /*
        @property store
        @private
    */
    private store: DataStore

    /**
     *Creates an instance of DOMParser.
     * @author Alex Chomiak
     * @date 2020-06-23
     * @param {DOMParserHandler<T>} handler
     * @param {DataStore} dataStore
     * @memberof DOMParser
     */
    constructor(handler: DOMParserHandler<T>, dataStore: DataStore) {
        super()
        this.handler = handler
        this.store = dataStore
    }

    /**
     * @description Call the handler for the DOM Parser Extractor
     * @author Alex Chomiak
     * @date 2020-06-23
     * @param {String} data
     * @param {any} baseline
     * @returns {T} extractedData
     * @memberof DOMParser
     */
    public async call(data: String, ref: Activity) {
        return await this.handler(data, ref)
    }

    public getType() {
        return 'dom-parser'
    }
}
