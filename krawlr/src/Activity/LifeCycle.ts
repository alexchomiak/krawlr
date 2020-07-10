import { Actor } from './Actor'
import { DataExtractor } from './DataExtractor'
import { Request, Response } from 'puppeteer'
import { DOMParser } from './DOMParser'
import { NetworkAnalyzer, ResponseObject } from './NetworkAnalyzer'
import { NavigationEvent } from './NavigationEvent'
import { Activity } from '.'

/**
 * @description Units of work for individual parts of LifeCycle stages
 * @type LifeCycleEvent
 */
export type LifeCycleEvent = Actor | DataExtractor | NavigationEvent

// * Removes ability to call stimulus and prep stages within LifeCycleEvent Handlers

/**
 * @description The LifeCycle is the heart of the activity, it contains the stages of events
 * that will take place for the desired scraping task
 * @author Alex Chomiak
 * @date 2020-06-25
 * @export
 * @class LifeCycle
 */
export class LifeCycle {
    private prepStage: LifeCycleEvent[]
    private stimulusStage: LifeCycleEvent[]
    private domStash: string[]
    private requestStash: Request[]
    private responseStash: ResponseObject[]
    private deliveryData: any[]
    private parent: Activity

    /**
     *Creates an instance of LifeCycle.
     * @author Alex Chomiak
     * @date 2020-06-25
     * @param {LifeCycleEvent[]} prep
     * @param {LifeCycleEvent[]} stimulus
     * @param {Activity} ref
     * @memberof LifeCycle
     */
    constructor(prep: LifeCycleEvent[], stimulus: LifeCycleEvent[], ref: Activity) {
        this.prepStage = prep
        this.stimulusStage = stimulus
        this.parent = ref
        this.deliveryData = []
    }

    /**
     * @description traverses provided stage of lifecycle
     * @author Alex Chomiak
     * @date 2020-06-25
     * @param {('prep' | 'stimulus')} stage
     * @memberof LifeCycle
     */
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
                    await actor.call(page, this.parent)

                    // * Stash DOM Data in LifeCycle data stash
                    this.domStash.push(
                        (await page.evaluate(() => document.body.innerHTML)) as string
                    )
                    try {
                        await Promise.race([
                            page.waitForNavigation({
                                waitUntil: 'networkidle2'
                            }),
                            new Promise(res => setTimeout(res, 1000))
                        ])
                    } catch (err) {
                        console.log('NAV Error')
                    }

                    break
                case 'dom-parser':
                    // * Cast LifeCycle to DOMParser
                    const extractor = event as DOMParser

                    // * For each entry in domStash, call dom extractor
                    for (const body in this.domStash) {
                        // * Call extractor
                        const data = await extractor.call(body, this.parent)
                        // * Append data
                        if (data && stage == 'stimulus') this.deliveryData.push(data)
                    }

                    // * Empty domStash
                    // TODO: Don't empty the stash
                    this.domStash = []
                    break
                case 'network-analyzer':
                    // * Cast LifeCycle to NetworkAnalyzer
                    const analyzer = event as NetworkAnalyzer
                    const options = analyzer.getOptions()

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

                    if (options.clearStash) {
                        // * Empty respective stashes
                        this.requestStash = []
                        this.responseStash = []
                    }

                    break

                case 'navigation':
                    const navigation = event as NavigationEvent
                    await page.goto(navigation.getDestination(this.parent), {
                        waitUntil: 'networkidle2'
                    })
                    break
            }
        }
    }

    /**
     * @description Returns delivery data to Activity layer, and clears delivery data upon completion
     * @author Alex Chomiak
     * @date 2020-06-25
     * @returns
     * @memberof LifeCycle
     */
    public getDeliveryData() {
        const data = [...this.deliveryData]
        this.deliveryData = []
        return data
    }
}
