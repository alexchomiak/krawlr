import { Activity } from '.'

/**
 * @description Handler that returns string for navigation event
 * @param {Activity} ref reference to activity
 * @type NetworkAnalyzerHandler
 */
type NavigationEventPathHandler = (ref: Activity) => string

/**
 * @description Navigation lifecycle event
 * @author Alex Chomiak
 * @date 2020-06-25
 * @export
 * @class NavigationEvent
 */
export class NavigationEvent {
    private handler: NavigationEventPathHandler
    /**
     *Creates an instance of NavigationEvent.
     * @author Alex Chomiak
     * @date 2020-06-25
     * @param {string} path
     * @memberof NavigationEvent
     */
    constructor(pathHandler: NavigationEventPathHandler) {
        this.handler = pathHandler
    }

    /**
     * @description Returns destination for navigation event
     * @author Alex Chomiak
     * @date 2020-06-25
     * @returns {string} destination
     * @memberof NavigationEvent
     */
    public getDestination(ref: Activity): string {
        return this.handler(ref)
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
