import { Crawler } from '.'
import { Activity } from '../Activity'
import { launch } from 'puppeteer'
import { DataStore } from '../DataStore'
import { LifeCycle, LifeCycleEvent } from '../Activity/LifeCycle'
import { NavigationEvent } from '../Activity/NavigationEvent'
import { NetworkAnalyzer } from '../Activity/NetworkAnalyzer'
;(async () => {
    const c = new Crawler(await launch({ headless: false }))

    class TestActivity extends Activity {
        public async setup() {
            const stimulus: LifeCycleEvent[] = []

            stimulus.push(
                new NavigationEvent((ref: Activity) => {
                    const store = ref.getStore()
                    return `https://twitter.com/${store.get('username')}`
                })
            )

            stimulus.push()

            this.setLifeCycle(new LifeCycle([], stimulus, this))
        }
    }

    const test = new TestActivity(
        {
            cron: '*/30 * * * * *',
            callback: async data => {
                console.log(data[0])
            }
        },
        new DataStore(),
        await c.getPage()
    )

    test.getStore().set('username', 'StupidCounter')
    await c.schedule(test)
})()
