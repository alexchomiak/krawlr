import { Activity, ActivityScheduleInformation } from '../Activity'
import puppeteer, { Browser, Page } from 'puppeteer'
import { Scheduler } from './Scheduler'

export class Crawler {
    private browser: Browser
    private scheduler: Scheduler

    constructor(browser: Browser) {
        this.browser = browser
        this.scheduler = new Scheduler(this)
    }

    public async schedule(activity: Activity) {
        await activity.setup()
        await this.scheduler.schedule(activity)
    }

    public async getPage(): Promise<Page> {
        return await this.browser.newPage()
    }

    public async cleanup() {
        await this.browser.close()
    }
}
