import { Request, Response } from 'puppeteer'
import { DataExtractor } from './DataExtractor'
import { DataStore } from '../DataStore'

interface NetworkAnalyzerData {
    requests: Request[]
    responses: Response[]
}

type NetworkAnalyzerHandler<T> = (data: NetworkAnalyzerData, store: DataStore, baseline: any) => T

export class NetworkAnalyzer<T> extends DataExtractor<T> {
    /*
        @property handler
        @private
    */
    private handler: NetworkAnalyzerHandler<T>

    /*
        @property store
        @private
    */
    private store: DataStore

    /**
     *Creates an instance of NetworkAnalyzer.
     * @author Alex Chomiak
     * @date 2020-06-23
     * @param {NetworkAnalyzerHandler<T>} handler
     * @param {DataStore} dataStore
     * @memberof NetworkAnalyzer
     */
    constructor(handler: NetworkAnalyzerHandler<T>, dataStore: DataStore) {
        super()
        this.handler = handler
        this.store = dataStore
    }

    /**
     * @description
     * @author Alex Chomiak
     * @date 2020-06-23
     * @param {NetworkAnalyzerData} data
     * @returns {T} extractedData
     * @memberof NetworkAnalyzer
     */
    public call(data: NetworkAnalyzerData, baseline: any) {
        return this.handler(data, this.store, baseline) as T
    }

    public getType() {
        return 'network-analyzer'
    }
}
