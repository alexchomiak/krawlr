import { Page } from 'puppeteer'
import { Activity } from 'index'

/**
 * @description Actor handler type
 * @param {Page} Page
 * @returns {Promise<void>}
 * @type ActorHandler
 */
type ActorHandler = (page: Page, ref: Activity) => Promise<void>

/**
 * @description The Actor is an activity life cycle event meant
 * to prep the application for data extraction by interaction with the UI
 * @author Alex Chomiak
 * @date 2020-06-25
 * @export
 * @class Actor
 */
export class Actor {
    // @property {ActorHandler} handler
    // @private
    private handler: ActorHandler

    /**
     *Creates an instance of Actor.
     * @author Alex Chomiak
     * @date 2020-06-25
     * @param {ActorHandler} handler
     * @memberof Actor
     */
    constructor(handler: ActorHandler) {
        this.handler = handler
    }

    /**
     * @description Trigger Actor handler
     * @author Alex Chomiak
     * @date 2020-06-25
     * @param {Page} page
     * @memberof Actor
     */
    public async call(page: Page, ref: Activity) {
        await this.handler(page, ref)
    }

    /**
     * @description Return event type
     * @author Alex Chomiak
     * @date 2020-06-25
     * @returns { string } type
     * @memberof Actor
     */
    public getType(): String {
        return 'actor'
    }
}
