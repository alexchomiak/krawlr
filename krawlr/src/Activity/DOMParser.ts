import { DataExtractor } from './DataExtractor'
import { Activity } from '.'

/**
 * @description DOMParserHandler that takes in DOM string and returns parsed data
 * @param {string} data
 * @param {Activity} ref
 * @type DOMParserHandler
 */
type DOMParserHandler = (data: String, ref: Activity) => any

/**
 * @description DOMParser event
 * @author Alex Chomiak
 * @date 2020-06-25
 * @export
 * @class DOMParser
 * @extends {DataExtractor}
 */
export class DOMParser extends DataExtractor {
    private handler: DOMParserHandler
    private parent: Activity

    /**
     *Creates an instance of DOMParser.
     * @author Alex Chomiak
     * @date 2020-06-25
     * @param {DOMParserHandler} handler
     * @param {Activity} ref
     * @memberof DOMParser
     */
    constructor(handler: DOMParserHandler, ref: Activity) {
        super()
        this.handler = handler
        this.parent = ref
    }

    /**
     * @description Call the handler for the DOM Parser Extractor
     * @author Alex Chomiak
     * @date 2020-06-23
     * @param {string} data
     * @returns extractedData
     * @memberof DOMParser
     */
    public async call(data: String) {
        return await this.handler(data, this.parent)
    }

    /**
     * @description Return event type
     * @author Alex Chomiak
     * @date 2020-06-25
     * @returns { string } type
     * @memberof DOMParser
     */
    public getType() {
        return 'dom-parser'
    }
}
