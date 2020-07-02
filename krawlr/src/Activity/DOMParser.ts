import { DataExtractor } from './DataExtractor'
import { Activity } from '.'

/**
 * @description Options object for DOM Parser
 * @author Alex Chomiak
 * @date 2020-07-01
 * @interface DOMParserOptions
 */
export interface DOMParserOptions {
    clearStash?: boolean
}

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
    private options: DOMParserOptions

    /**
     *Creates an instance of DOMParser.
     * @author Alex Chomiak
     * @date 2020-07-01
     * @param {DOMParserHandler} handler
     * @param {DOMParserOptions} [options]
     * @memberof DOMParser
     */
    constructor(handler: DOMParserHandler, options?: DOMParserOptions) {
        super()
        this.handler = handler

        const defaultOptions: DOMParserOptions = {
            clearStash: false
        }

        if (options) this.options = { ...defaultOptions, ...options }
        else this.options = defaultOptions
    }

    /**
     * @description Call the handler for the DOM Parser Extractor
     * @author Alex Chomiak
     * @date 2020-06-23
     * @param {string} data
     * @param {Activity} ref reference to activity
     * @returns extractedData
     * @memberof DOMParser
     */
    public async call(data: String, ref: Activity) {
        return await this.handler(data, ref)
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

    /**
     * @description Return DOMParser options object
     * @author Alex Chomiak
     * @date 2020-07-01
     * @returns {DOMParserOptions}
     * @memberof DOMParser
     */
    public getOptions(): DOMParserOptions {
        return this.options
    }
}
