import { Request, Response } from 'puppeteer'
import { DataExtractor } from './DataExtractor'
import { Activity } from '.'

/**
 * @description Options interface for network analyzer
 * @author Alex Chomiak
 * @date 2020-07-01
 * @interface NetworkAnalyzerOptions
 */
export interface NetworkAnalyzerOptions {
    clearStash?: boolean
}

/**
 * @description Expected data passed into Network Analyzer handler
 * @author Alex Chomiak
 * @date 2020-06-25
 * @interface NetworkAnalyzerData
 */
interface NetworkAnalyzerData {
    requests: Request[]
    responses: ResponseObject[]
}

/**
 * @description Response interface for responses retrieved by browser
 * @author Alex Chomiak
 * @date 2020-06-25
 * @export
 * @interface ResponseObject
 */
export interface ResponseObject {
    contentType: string
    contentLength: number
    url: string | null
    body: Object | null
    raw: Buffer | null
    text: string | null
}

/**
 * @description Handler for network analysis/data extraction
 * @param {NetworkAnalyzerData} data request/response data
 * @param {Activity} ref reference to activity
 * @type NetworkAnalyzerHandler
 */
type NetworkAnalyzerHandler = (data: NetworkAnalyzerData, ref: Activity) => Promise<any>

/**
 * @description Network Analyzer event that parses requests/responses made by browser
 * @author Alex Chomiak
 * @date 2020-06-25
 * @export
 * @class NetworkAnalyzer
 * @extends {DataExtractor}
 */
export class NetworkAnalyzer extends DataExtractor {
    private handler: NetworkAnalyzerHandler
    private options: NetworkAnalyzerOptions

    /**
     *Creates an instance of NetworkAnalyzer.
     * @author Alex Chomiak
     * @date 2020-07-01
     * @param {NetworkAnalyzerHandler} handler
     * @param {NetworkAnalyzerOptions} [options]
     * @memberof NetworkAnalyzer
     */
    constructor(handler: NetworkAnalyzerHandler, options?: NetworkAnalyzerOptions) {
        super()
        this.handler = handler

        const defaultOptions: NetworkAnalyzerOptions = {
            clearStash: false
        }

        if (options) this.options = { ...defaultOptions, ...options }
        else this.options = defaultOptions
    }

    /**
     * @description
     * @author Alex Chomiak
     * @date 2020-06-23
     * @param {NetworkAnalyzerData} data
     * @param {Activity} ref reference to activity
     * @returns extractedData
     * @memberof NetworkAnalyzer
     */
    public async call(data: NetworkAnalyzerData, ref: Activity) {
        return await this.handler(data, ref)
    }

    /**
     * @description returns event type
     * @author Alex Chomiak
     * @date 2020-06-25
     * @returns { string } type
     * @memberof NetworkAnalyzer
     */
    public getType() {
        return 'network-analyzer'
    }

    /**
     * @description Returns Network Analyzer options object
     * @author Alex Chomiak
     * @date 2020-07-01
     * @returns {NetworkAnalyzerOptions}
     * @memberof NetworkAnalyzer
     */
    public getOptions(): NetworkAnalyzerOptions {
        return this.options
    }
}
