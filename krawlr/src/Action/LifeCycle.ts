import { Actor } from './Actor'
import { DataExtractor } from './DataExtractor'
import { Page, Request, Response } from 'puppeteer'
import { DOMParser } from './DOMParser'
import { NetworkAnalyzer } from './NetworkAnalyzer'
import { NavigationEvent } from './NavigationEvent'

export interface LifeCycleEvent {
    substance: Actor | DataExtractor<any> | NavigationEvent
}

export class LifeCycle {
    private prepStage: LifeCycleEvent[]
    private stimulusStage: LifeCycleEvent[]
    private page: Page

    private domStash: string[]
    private requestStash: Request[]
    private responseStash: Response[]

    private deliveryData: any[]
    private baselineData: any[]

    constructor(prep: LifeCycleEvent[], stimulus: LifeCycleEvent[], page: Page) {
        this.prepStage = prep
        this.stimulusStage = stimulus
        this.page = page

        // TODO: Install page middlewares for outgoing request/response made by page that append to stash
    }

    public async prep() {
        // * Empty respective stashes
        this.requestStash = []
        this.responseStash = []
        this.domStash = []

        for (let i = 0; i < this.prepStage.length; i++) {
            const event = this.prepStage[i]

            switch (event.substance.getType()) {
                case 'actor':
                    // * Cast LifeCycle to Actor
                    const actor = event.substance as Actor

                    // * Call Actor Handler
                    actor.call(this.page)

                    // * Stash DOM Data in LifeCycle data stash
                    this.domStash.push(
                        (await this.page.evaluate(() => document.body.innerHTML)) as string
                    )

                    break
                case 'dom-parser':
                    // * Cast LifeCycle to DOMParser
                    const extractor = event.substance as DOMParser<any>

                    // * For each entry in domStash, call dom extractor
                    for (const body in this.domStash) {
                        // * Call extractor
                        const data = extractor.call(body, null)

                        // * Append baseline data
                        if (data) this.baselineData.push(data)
                    }

                    // * Empty domStash
                    this.domStash = []
                    break
                case 'network-analyzer':
                    // * Cast LifeCycle to NetworkAnalyzer
                    const analyzer = event.substance as NetworkAnalyzer<any>

                    // * Call analyzer handler
                    const data = analyzer.call(
                        {
                            requests: this.requestStash,
                            responses: this.responseStash
                        },
                        null
                    )

                    // * Append baseline data
                    if (data) this.baselineData.push(data)

                    // * Empty respective stashes
                    this.requestStash = []
                    this.responseStash = []

                    break
                case 'navigate':
                    const navigation = event.substance as NavigationEvent
                    await this.page.goto(navigation.getDestination(), { waitUntil: 'networkidle2' })
                    break
            }
        }
    }

    public async stimulus() {
        // * Empty respective stashes
        this.requestStash = []
        this.responseStash = []
        this.domStash = []

        for (let i = 0; i < this.prepStage.length; i++) {
            const event = this.prepStage[i]

            switch (event.substance.getType()) {
                case 'actor':
                    // * Cast LifeCycle to Actor
                    const actor = event.substance as Actor

                    // * Call Actor Handler
                    actor.call(this.page)

                    // * Stash DOM Data in LifeCycle data stash
                    this.domStash.push(
                        (await this.page.evaluate(() => document.body.innerHTML)) as string
                    )

                    break
                case 'dom-parser':
                    // * Cast LifeCycle to DOMParser
                    const extractor = event.substance as DOMParser<any>

                    // * For each entry in domStash, call dom extractor
                    for (const body in this.domStash) {
                        // * Call extractor
                        const data = extractor.call(body, null)

                        // * Append baseline data
                        if (data) this.baselineData.push(data)
                    }

                    // * Empty domStash
                    this.domStash = []
                    break
                case 'network-analyzer':
                    // * Cast LifeCycle to NetworkAnalyzer
                    const analyzer = event.substance as NetworkAnalyzer<any>

                    // * Call analyzer handler
                    const data = analyzer.call(
                        {
                            requests: this.requestStash,
                            responses: this.responseStash
                        },
                        null
                    )

                    // * Append baseline data
                    if (data) this.baselineData.push(data)

                    // * Empty respective stashes
                    this.requestStash = []
                    this.responseStash = []

                    break
                case 'navigate':
                    const navigation = event.substance as NavigationEvent
                    await this.page.goto(navigation.getDestination(), { waitUntil: 'networkidle2' })
                    break
            }
        }
    }
}
