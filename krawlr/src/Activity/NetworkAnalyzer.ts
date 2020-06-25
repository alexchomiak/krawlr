import { Request, Response } from 'puppeteer'
import { DataExtractor } from './DataExtractor'
import { DataStore } from '../DataStore'
import { Activity } from '.'

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
    private parent: Activity

    /**
     *Creates an instance of NetworkAnalyzer.
     * @author Alex Chomiak
     * @date 2020-06-23
     * @param {NetworkAnalyzerHandler<T>} handler
     * @param {DataStore} dataStore
     * @memberof NetworkAnalyzer
     */
    constructor(handler: NetworkAnalyzerHandler, ref: Activity) {
        super()
        this.handler = handler
        this.parent = ref
    }

    /**
     * @description
     * @author Alex Chomiak
     * @date 2020-06-23
     * @param {NetworkAnalyzerData} data
     * @returns extractedData
     * @memberof NetworkAnalyzer
     */
    public async call(data: NetworkAnalyzerData) {
        return await this.handler(data, this.parent)
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
}
