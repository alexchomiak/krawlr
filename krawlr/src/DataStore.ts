/**
 * @description simple data store class for Crawler Library
 * @author Alex Chomiak
 * @date 2020-06-25
 * @export
 * @class DataStore
 */
export class DataStore {
    private map: Map<string, any>

    /**
     *Creates an instance of DataStore.
     * @author Alex Chomiak
     * @date 2020-06-25
     * @memberof DataStore
     */
    constructor() {
        this.map = new Map<string, any>()
    }

    /**
     * @description set value in store
     * @author Alex Chomiak
     * @date 2020-06-25
     * @param {string} key
     * @param {*} value
     * @memberof DataStore
     */
    public set(key: string, value: any) {
        this.map.set(key, value)
    }

    /**
     * @description get value from store
     * @author Alex Chomiak
     * @date 2020-06-25
     * @param {string} key
     * @returns {*}
     * @memberof DataStore
     */
    public get(key: string): any {
        return this.map.get(key)
    }
}
