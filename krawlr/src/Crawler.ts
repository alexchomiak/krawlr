import { Action } from './Action'

import { Application, Router } from 'express'
export class Crawler {
    // ! The crawler instance does not care about any of the types of individual actions
    private actions: Map<string, Action<any, any>>
    private app: Application
    private router: Router

    public constructor(app: Application, namespace: string) {
        this.app = app

        // * Create router and bind to given application
        const router = Router()
        this.app.use(namespace, router)
        this.router = router
    }

    public createAction(action: Action<any, any>) {
        if (this.actions.get(action.getRoute()) != undefined) {
            throw new Error('Action already exists with given route!')
        } else {
            // * Set action in
            this.actions.set(action.getRoute(), action)

            // * Bind action
            action.bind(this.router)
        }
    }
}
