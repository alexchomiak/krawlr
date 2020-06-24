import { Activity, ActivityScheduleInformation } from '../Activity'
import puppeteer, { Browser, Page } from 'puppeteer'

interface ClassInterface<T> {
    new (params: ActivityScheduleInformation): T
}

type ActivityGenerator = (schedule: ActivityScheduleInformation) => Activity
export class Crawler {
    private browser: Browser

    constructor(browser: Browser) {
        this.browser = browser
    }

    public async schedule(activity: Activity) {
        await activity.setup()
        console.log('Setup Activity')
        console.log(activity)
        await activity.getLifeCycle().prep()
        await activity.getLifeCycle().stimulus()
        activity.getScheduleInformation().callback(activity.getDeliveryData())
        return
    }

    public async getPage(): Promise<Page> {
        return await this.browser.newPage()
    }

    public async cleanup() {
        await this.browser.close()
    }
}
