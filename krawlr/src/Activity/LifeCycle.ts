import { Actor } from './Actor'
import { DataExtractor } from './DataExtractor'
import { Page, Request, Response } from 'puppeteer'
import { DOMParser } from './DOMParser'
import { NetworkAnalyzer } from './NetworkAnalyzer'
import { NavigationEvent } from './NavigationEvent'
import { Activity } from '.'

export type LifeCycleEvent = Actor | DataExtractor<any> | NavigationEvent

// * Removes ability to call stimulus and prep stages within LifeCycleEvent Handlers

export class LifeCycle {
    private prepStage: LifeCycleEvent[]
    private stimulusStage: LifeCycleEvent[]
    private page: Page

    private domStash: string[]
    private requestStash: Request[]
    private responseStash: Response[]

    private parent: Activity

    constructor(prep: LifeCycleEvent[], stimulus: LifeCycleEvent[], ref: Activity) {
        this.prepStage = prep
        this.stimulusStage = stimulus
        this.parent = ref
    }

    public async prep() {
        // * Retrieve page from Crawler instance
        this.page = await this.parent.getParent().getPage()

        // * Install page middlewares for outgoing request/response made by page that append to stash
        await this.page.setRequestInterception(true)
        this.page.on('request', (request: Request) => {
            this.requestStash.push(request)
            request.continue()
        })
        this.page.on('response', (response: Response) => {
            if (response.status() < 300 || response.status() > 399)
                this.responseStash.push(response)
        })

        // * Empty respective stashes
        this.requestStash = []
        this.responseStash = []
        this.domStash = []

        for (let i = 0; i < this.prepStage.length; i++) {
            const event = this.prepStage[i]

            switch (event.getType()) {
                case 'actor':
                    // * Cast LifeCycle to Actor
                    const actor = event as Actor

                    // * Call Actor Handler
                    await actor.call(this.page)

                    // * Stash DOM Data in LifeCycle data stash
                    this.domStash.push(
                        (await this.page.evaluate(() => document.body.innerHTML)) as string
                    )
                    await this.page.waitForNavigation({ waitUntil: 'networkidle2' })
                    break
                case 'dom-parser':
                    // * Cast LifeCycle to DOMParser
                    const extractor = event as DOMParser<any>

                    // * For each entry in domStash, call dom extractor
                    for (const body in this.domStash) {
                        // * Call extractor
                        const data = await extractor.call(body, this.parent)
                    }

                    // * Empty domStash
                    this.domStash = []
                    break
                case 'network-analyzer':
                    // * Cast LifeCycle to NetworkAnalyzer
                    const analyzer = event as NetworkAnalyzer<any>

                    // * Call analyzer handler
                    const data = await analyzer.call(
                        {
                            requests: this.requestStash,
                            responses: this.responseStash
                        },
                        this.parent
                    )

                    // * Empty respective stashes
                    this.requestStash = []
                    this.responseStash = []

                    break
                case 'navigation':
                    const navigation = event as NavigationEvent
                    await this.page.goto(navigation.getDestination(), {
                        waitUntil: 'networkidle2'
                    })
                    break
            }
        }
    }

    public async stimulus() {
        if (!this.page) throw new Error('prep stage must be called first')
        // * Empty respective stashes
        this.requestStash = []
        this.responseStash = []
        this.domStash = []

        for (let i = 0; i < this.stimulusStage.length; i++) {
            const event = this.stimulusStage[i]
            console.log(event.getType())
            switch (event.getType()) {
                case 'actor':
                    // * Cast LifeCycle to Actor
                    const actor = event as Actor

                    // * Call Actor Handler
                    await actor.call(this.page)

                    // * Stash DOM Data in LifeCycle data stash
                    this.domStash.push(
                        (await this.page.evaluate(() => document.body.innerHTML)) as string
                    )

                    break
                case 'dom-parser':
                    // * Cast LifeCycle to DOMParser
                    const extractor = event as DOMParser<any>

                    // * For each entry in domStash, call dom extractor
                    for (const body in this.domStash) {
                        // * Call extractor
                        const data = await extractor.call(body, this.parent)

                        // * Append baseline data
                        if (data) this.parent.addDeliveryData(data)
                    }

                    // * Empty domStash
                    this.domStash = []
                    break
                case 'network-analyzer':
                    // * Cast LifeCycle to NetworkAnalyzer
                    const analyzer = event as NetworkAnalyzer<any>

                    // * Call analyzer handler
                    const data = await analyzer.call(
                        {
                            requests: this.requestStash,
                            responses: this.responseStash
                        },
                        this.parent
                    )

                    // * Append baseline data
                    if (data) this.parent.addDeliveryData(data)

                    // * Empty respective stashes
                    this.requestStash = []
                    this.responseStash = []

                    break
                case 'navigation':
                    const navigation = event as NavigationEvent
                    await this.page.goto(navigation.getDestination(), { waitUntil: 'networkidle2' })
                    break
            }
        }
    }

    public test() {}
}
