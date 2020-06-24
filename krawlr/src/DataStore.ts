export class DataStore {
    private map: Map<string, any>

    constructor() {
        this.map = new Map<string, any>()
    }

    public set(key: string, value: any) {
        this.map.set(key, value)
    }

    public get(key: string): any {
        return this.map.get(key)
    }
}
