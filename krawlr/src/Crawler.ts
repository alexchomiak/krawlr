import { Action } from './Action'
import { Application, Router } from 'express'
import { Page, Browser, launch as LaunchBrowser } from 'puppeteer'

/**
 * @description Crawler Class, that can be extended to create service
 *              that can retrieve data from online services using Puppeteer
 * @author Alex Chomiak
 * @date 2020-06-16
 * @export
 * @class Crawler
 */
export class Crawler {
    // ! The crawler instance does not care about any of the types of individual actions
    private actions: Map<string, Action<any, any>>
    private app: Application
    private router: Router
    private browser: Browser

    // * State object for persisted information between actions
    private state: Map<string, any>

    /**
     *Creates an instance of Crawler.
     * @author Alex Chomiak
     * @date 2020-06-16
     * @param {Application} app
     * @param {string} namespace
     * @param {Browser} [browser]
     * @memberof Crawler
     */
    public constructor(app: Application, namespace: string, browser?: Browser) {
        this.app = app

        // * Create router and bind to given application
        const router = Router()
        this.app.use(namespace, router)
        this.router = router

        // * Intialize Maps
        this.state = new Map<string, any>()
        this.actions = new Map<string, Action<any, any>>()

        // * If browser provided, set browser
        if (browser) {
            this.browser = browser
        }
    }

    /**
     * @description Create and bind Action in Crawler instance
     * @author Alex Chomiak
     * @date 2020-06-16
     * @param {Action<any, any>} action
     * @memberof Crawler
     */
    public createAction(action: Action<any, any>) {
        if (this.actions.get(action.getRoute()) != undefined) {
            throw new Error('Action already exists with given route!')
        } else {
            // * Set action in
            this.actions.set(action.getRoute(), action)

            // * Set Action parent
            action.setParent(this)

            // * Bind action
            action.bind(this.router)
        }
    }

    /**
     * @description Returns new page from crawlers instance
     * @author Alex Chomiak
     * @date 2020-06-16
     * @returns {Promise<Page>}
     * @memberof Crawler
     */
    public async newPage(): Promise<Page> {
        if (!this.browser) {
            throw new Error('The Crawler instance has no running browser!')
        } else {
            const page = await this.browser.newPage()
            return page
        }
    }

    /**
     * @description Launches puppeteer browser for Crawler instance
     * @author Alex Chomiak
     * @date 2020-06-16
     * @memberof Crawler
     * @returns {Promise<void>}
     */
    public async launch(): Promise<void> {
        if (this.browser) {
            return
        } else {
            this.browser = await LaunchBrowser()
        }
    }

    /**
     * @description Allows actions to mutate state of Crawler for persisted dta
     * @author Alex Chomiak
     * @date 2020-06-16
     * @param {string} key
     * @param {*} value
     * @memberof Crawler
     */
    public setState(key: string, value: any): void {
        this.state.set(key, value)
    }
}

/**
 * @description setStateFunction that mutates the state of a given Crawler
 * @author Alex Chomiak
 * @date 2020-06-16
 * @export
 * @interface setStateFunction
 */
export interface setStateFunction {
    (key: string, value: any): void
}
