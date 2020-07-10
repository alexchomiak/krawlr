import { Activity, ActivityScheduleInformation } from '../Activity'
import { Browser, Page } from 'puppeteer'
import { Scheduler } from './Scheduler'

/**
 * @description Executes scraping tasks defined by the developer
 * @author Alex Chomiak
 * @date 2020-06-25
 * @export
 * @class Crawler
 */
export class Crawler {
    private browser: Browser
    private scheduler: Scheduler

    /**
     *Creates an instance of Crawler.
     * @author Alex Chomiak
     * @date 2020-06-25
     * @param {Browser} browser
     * @memberof Crawler
     */
    constructor(browser: Browser) {
        this.browser = browser
        this.scheduler = new Scheduler(this)
    }

    /**
     * @description Schedule activity within crawler instance
     * @author Alex Chomiak
     * @date 2020-06-25
     * @param {Activity} activity
     * @memberof Crawler
     */
    public async schedule(activity: Activity) {
        if (!activity.getPage()) activity.setPage(await this.getPage())
        await activity.setup()
        await this.scheduler.schedule(activity)
    }

    /**
     * @description get new page from Crawler's browser
     * @author Alex Chomiak
     * @date 2020-06-25
     * @returns {Promise<Page>}
     * @memberof Crawler
     */
    public async getPage(): Promise<Page> {
        return await this.browser.newPage()
    }

    /**
     * @description Cleanup Crawler instance
     * @author Alex Chomiak
     * @date 2020-06-25
     * @memberof Crawler
     */
    public async cleanup() {
        await this.browser.close()
    }
}
