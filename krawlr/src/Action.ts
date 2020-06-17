import { Request, Response, Router } from 'express'
import { Page } from 'puppeteer'
import { Crawler, setStateFunction } from './Crawler'

/**
 * @description Asynchronous Action Handler Function should return a promise of the
 *              defined return type of the Action
 * @author Alex Chomiak
 * @date 2020-06-15
 * @export
 * @interface ActionHandler
 * @template T type of data returned after action handler executes
 * @template P params for action that may be needed
 */
export interface ActionHandler<T, P> {
    (params: P, page: Page, setState: setStateFunction): Promise<T>
}

/**
 * @description Action Class that will take in a request
 *             and do the scraping task defined by the handler
 * @author Alex Chomiak
 * @date 2020-06-15
 * @export
 * @class Action
 * @template T type of data returned after action
 * @template P params for post request
 */
export class Action<T, P> {
    private handler: ActionHandler<T, P>
    private route: string
    private parent: Crawler
    /**
     *Creates an instance of Action.
     * @author Alex Chomiak
     * @date 2020-06-15
     * @param {string} route
     * @param {ActionHandler<T, P>} handler
     * @memberof Action
     */
    constructor(route: string, handler: ActionHandler<T, P>) {
        this.handler = handler
        this.route = route
    }

    /**
     * @description Binds the handler to the provided express router
     * @author Alex Chomiak
     * @date 2020-06-15
     * @param {Router} router
     * @memberof Action
     */
    public bind(router: Router) {
        router.post(this.route, async (req: Request, res: Response) => {
            // * Grab params (does not check if every member is in params)
            const params = req.body as P

            try {
                // * Get result from handler
                const result: T = await this.handler(
                    params,
                    await this.parent.newPage(),
                    this.parent.setState
                )

                // * Send Result
                res.send({ result })
            } catch (err) {
                if (err.code) {
                    res.status(err.code).send(err.message)
                } else {
                    res.status(500).send(err.message)
                }
            }
        })
    }

    /**
     * @description Returns express route of Action
     * @author Alex Chomiak
     * @date 2020-06-15
     * @returns {string}
     * @memberof Action
     */
    getRoute(): string {
        return this.route
    }

    /**
     * @description Set parent Crawler instance for Action
     * @author Alex Chomiak
     * @date 2020-06-16
     * @param {Crawler} parent
     * @memberof Action
     */
    setParent(parent: Crawler) {
        this.parent = parent
    }
}
