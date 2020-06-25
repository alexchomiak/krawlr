/**
 * @description Navigation lifecycle event
 * @author Alex Chomiak
 * @date 2020-06-25
 * @export
 * @class NavigationEvent
 */
export class NavigationEvent {
    private destination: string

    /**
     *Creates an instance of NavigationEvent.
     * @author Alex Chomiak
     * @date 2020-06-25
     * @param {string} path
     * @memberof NavigationEvent
     */
    constructor(path: string) {
        this.destination = path
    }

    /**
     * @description Returns destination for navigation event
     * @author Alex Chomiak
     * @date 2020-06-25
     * @returns {string} destination
     * @memberof NavigationEvent
     */
    public getDestination(): string {
        return this.destination
    }

    /**
     * @description Returns event type
     * @author Alex Chomiak
     * @date 2020-06-25
     * @returns { string } type
     * @memberof NavigationEvent
     */
    public getType(): string {
        return 'navigation'
    }
}
