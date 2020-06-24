import { Request, Response } from 'puppeteer'
import { DataExtractor } from './DataExtractor'
import { DataStore } from '../DataStore'
import { Activity } from '.'

interface NetworkAnalyzerData {
    requests: Request[]
    responses: Response[]
}

type NetworkAnalyzerHandler<T> = (data: NetworkAnalyzerData, ref: Activity) => Promise<T>

export class NetworkAnalyzer<T> extends DataExtractor<T> {
    /*
        @property handler
        @private
    */
    private handler: NetworkAnalyzerHandler<T>
    private parent: Activity

    /**
     *Creates an instance of NetworkAnalyzer.
     * @author Alex Chomiak
     * @date 2020-06-23
     * @param {NetworkAnalyzerHandler<T>} handler
     * @param {DataStore} dataStore
     * @memberof NetworkAnalyzer
     */
    constructor(handler: NetworkAnalyzerHandler<T>, ref: Activity) {
        super()
        this.handler = handler
        this.parent = ref
    }

    /**
     * @description
     * @author Alex Chomiak
     * @date 2020-06-23
     * @param {NetworkAnalyzerData} data
     * @returns {T} extractedData
     * @memberof NetworkAnalyzer
     */
    public async call(data: NetworkAnalyzerData, ref: Activity): Promise<T> {
        return (await this.handler(data, ref)) as T
    }

    public getType() {
        return 'network-analyzer'
    }
}
