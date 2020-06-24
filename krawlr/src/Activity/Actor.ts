import { Page } from 'puppeteer'

type ActorHandler = (page: Page) => Promise<void>

export class Actor {
    private handler: ActorHandler
    constructor(handler: ActorHandler) {
        this.handler = handler
    }

    public async call(page: Page) {
        await this.handler(page)
    }

    public getType(): String {
        return 'actor'
    }
}
