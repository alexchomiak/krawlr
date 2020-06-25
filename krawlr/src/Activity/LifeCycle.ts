import { Actor } from './Actor'
import { DataExtractor } from './DataExtractor'
import { Page, Request, Response } from 'puppeteer'
import { DOMParser } from './DOMParser'
import { NetworkAnalyzer, ResponseObject } from './NetworkAnalyzer'
import { NavigationEvent } from './NavigationEvent'
import { Activity } from '.'

export type LifeCycleEvent = Actor | DataExtractor<any> | NavigationEvent

// * Removes ability to call stimulus and prep stages within LifeCycleEvent Handlers

export class LifeCycle {
    private prepStage: LifeCycleEvent[]
    private stimulusStage: LifeCycleEvent[]

    private domStash: string[]
    private requestStash: Request[]
    private responseStash: ResponseObject[]
    private deliveryData: any[]

    private parent: Activity

    constructor(prep: LifeCycleEvent[], stimulus: LifeCycleEvent[], ref: Activity) {
        this.prepStage = prep
        this.stimulusStage = stimulus
        this.parent = ref
        this.deliveryData = []
    }
    public async traverse(stage: 'prep' | 'stimulus') {
        // * Retrieve page from Activity instance
        const page = await this.parent.getPage()

        if (stage === 'prep') {
            // * Install page middlewares for outgoing request/response made by page that append to stash
            await page.setRequestInterception(true)
            page.on('request', (request: Request) => {
                this.requestStash.push(request)
                request.continue()
            })
            page.on('response', async (response: Response) => {
                if (response.status() < 300 || response.status() > 399) {
                    const headers = response.headers()
                    const contentType = headers['content-type']
                    try {
                        const contentLength = parseInt(headers['content-length'])
                        if (!contentType || !contentLength || contentLength <= 0) return
                        this.responseStash.push({
                            contentType,
                            contentLength,
                            url: await response.url(),
                            body: contentType.includes('json') ? await response.json() : null,
                            text:
                                contentType.includes('text') ||
                                contentType.includes('javascipt') ||
                                contentType.includes('json')
                                    ? await response.text()
                                    : null,
                            raw: await response.buffer()
                        })
                    } catch (err) {
                        console.error(err.message)
                    }
                } else {
                    return
                }
            })
        }
        // * Empty stashes
        this.requestStash = []
        this.responseStash = []
        this.domStash = []

        const events = stage === 'prep' ? this.prepStage : this.stimulusStage
        for (let i = 0; i < events.length; i++) {
            const event = events[i]

            switch (event.getType()) {
                case 'actor':
                    // * Cast LifeCycle to Actor
                    const actor = event as Actor

                    // * Call Actor Handler
                    await actor.call(page)

                    // * Stash DOM Data in LifeCycle data stash
                    this.domStash.push(
                        (await page.evaluate(() => document.body.innerHTML)) as string
                    )
                    await page.waitForNavigation({
                        waitUntil: 'networkidle2'
                    })
                    break
                case 'dom-parser':
                    // * Cast LifeCycle to DOMParser
                    const extractor = event as DOMParser<any>

                    // * For each entry in domStash, call dom extractor
                    for (const body in this.domStash) {
                        // * Call extractor
                        const data = await extractor.call(body, this.parent)
                        // * Append data
                        if (data && stage == 'stimulus') this.deliveryData.push(data)
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
                    if (data && stage == 'stimulus') this.deliveryData.push(data)

                    // * Empty respective stashes
                    this.requestStash = []
                    this.responseStash = []

                    break
                case 'navigation':
                    const navigation = event as NavigationEvent
                    await page.goto(navigation.getDestination(), {
                        waitUntil: 'networkidle2'
                    })
                    break
            }
        }
    }

    public getDeliveryData() {
        const data = [...this.deliveryData]
        this.deliveryData = []
        return data
    }
}
