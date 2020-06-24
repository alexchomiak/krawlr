import { Crawler } from '.'
import { Activity } from '../Activity'
import puppeteer, { Page, Request, Response } from 'puppeteer'
import { DataStore } from '../DataStore'
import { LifeCycle, LifeCycleEvent } from '../Activity/LifeCycle'
import { Actor } from '../Activity/Actor'
import { NavigationEvent } from '../Activity/NavigationEvent'
import { NetworkAnalyzer } from '../Activity/NetworkAnalyzer'
import axios from 'axios'
import fs from 'fs'
;(async () => {
    const c = new Crawler(await puppeteer.launch({ headless: false }))
    class TestActivity extends Activity {
        public async setup() {
            this.setParent(c)
            this.setStore(new DataStore())
            const stimulus: LifeCycleEvent[] = []

            stimulus.push(new NavigationEvent('https://www.instagram.com/javamyscript/'))
            stimulus.push(
                new Actor(async (page: Page) => {
                    await new Promise(res => setTimeout(res, 1000))
                })
            )
            stimulus.push(
                new NetworkAnalyzer(async ({ requests, responses }, ref: Activity) => {
                    const store = ref.getStore()
                    let data = []
                    for (let i = 0; i < responses.length; i++) {
                        const response = responses[i]
                        const url = await response.url()

                        // console.log(url)
                        if (url.includes('?query_hash')) {
                            let text = await response.text()
                            if (text.includes('"edge_owner_to_timeline_media"')) {
                                data.push(await response.json())
                            }
                        }
                    }
                    if (data.length > 0) {
                        //@ts-ignore
                        let delivery = []

                        for (let i = 0; i < data.length; i++) {
                            //@ts-ignore

                            //@ts-ignore
                            delivery = [
                                //@ts-ignore
                                ...delivery,
                                //@ts-ignore
                                ...data[i].data.user.edge_owner_to_timeline_media.edges
                            ]

                            return delivery
                        }
                    }
                }, this)
            )

            this.setLifeCycle(new LifeCycle([], stimulus, this))
        }
    }

    const test = new TestActivity({
        interval: null,
        callback: async data => {
            console.log(data[0].length)
            for (let i = 0; i < data[0].length; i++) {
                const { node } = data[0][i]
                const writer = fs.createWriteStream(`./${i}.png`)

                const response = await axios({
                    url: node.display_resources[0].src,
                    method: 'GET',
                    responseType: 'stream'
                })

                response.data.pipe(writer)
                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve)
                    writer.on('error', reject)
                })
            }
        }
    })

    await c.schedule(test)
    await c.cleanup()
})()
