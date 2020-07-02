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

            stimulus.push(
                new NetworkAnalyzer(async ({ requests, responses }, ref: Activity) => {
                    let data = []
                    for (let i = 0; i < responses.length; i++) {
                        const response = responses[i]
                        if (response.url.includes('/timeline/profile/')) {
                            const d = response.body
                            data.push(d)
                        }
                    }

                    if (data.length > 0) {
                        let delivery = {}

                        for (let i = 0; i < data.length; i++) {
                            delivery = {
                                ...delivery,
                                //@ts-ignore
                                ...data[i].globalObjects.tweets
                            }
                        }

                        const store = ref.getStore()
                        if (store.get('tweets')) {
                            const tweets = store
                                .get('tweets')
                                //@ts-ignore
                                .map((tweet: Object) => tweet.full_text)

                            const updatedTweets = Object.values(delivery)

                            let newTweet = null
                            updatedTweets.forEach((tweet: Object) => {
                                //@ts-ignore
                                if (!tweets.includes(tweet.full_text)) {
                                    newTweet = tweet
                                }
                            })

                            store.set('tweets', updatedTweets)
                            if (newTweet) {
                                return newTweet
                            } else {
                                console.log(`No new tweets for ${this.getStore().get('username')}`)
                            }
                        } else {
                            store.set('tweets', Object.values(delivery))
                        }
                    }
                })
            )

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
