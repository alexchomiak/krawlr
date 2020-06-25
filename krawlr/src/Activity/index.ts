import { LifeCycle } from './LifeCycle'
import { Crawler } from '../Crawler'
import { DataStore } from '../DataStore'
import { v4 as uuidv4 } from 'uuid'
import { Page } from 'puppeteer'
import cron from 'node-cron'
/**
 * @description Activity Schedule
 * @author Alex Chomiak
 * @date 2020-06-23
 * @interface ActivityScheduleInformation
 * @member {string | null} cron for repeating activity, if null, schedule once
 */
export interface ActivityScheduleInformation {
    cron: string | null
    callback: (data: any) => void
}

export interface ScheduleEntry extends ActivityScheduleInformation {
    ref: Activity
}
export abstract class Activity {
    private activitySchedule: ScheduleEntry
    private lifecycle: LifeCycle
    private store: DataStore
    private id: string

    private page: Page
    constructor(schedule: ActivityScheduleInformation, store: DataStore, page: Page) {
        let activitySchedule = schedule as ScheduleEntry
        activitySchedule.ref = this

        // * Validate cron string in schedule info
        cron.validate(schedule.cron)
        this.activitySchedule = activitySchedule
        this.store = store
        this.id = uuidv4()

        this.page = page
    }

    // * Setup Function that is expected to set parent crawler instance, create activity lifestyle and set the data store used for the activity
    public abstract setup(): void

    private validate() {
        // * Validates setup is done correctly for an Activity
        if (!this.lifecycle) throw new Error('No Activity LifeCycle defined. Check setup function')
        if (!this.store) throw new Error('No DataStore defined for Activity. Check setup function')
        if (!this.activitySchedule)
            throw new Error('No Activity schedule defined. Check Activity initialization')
    }

    // * Getters
    public getScheduleInformation(): ScheduleEntry {
        this.validate()
        return this.activitySchedule
    }
    public getLifeCycle(): LifeCycle {
        this.validate()
        return this.lifecycle
    }

    public getPage() {
        return this.page
    }

    public getStore(): DataStore {
        return this.store
    }

    public deliver() {
        this.validate()
        const data = this.lifecycle.getDeliveryData()
        if (data.length > 0) {
            this.activitySchedule.callback(data)
        }
    }

    public setLifeCycle(lifecycle: LifeCycle) {
        if (this.lifecycle != undefined) throw new Error('Field already set. Can only be set once.')
        this.lifecycle = lifecycle
    }

    public getID() {
        return this.id
    }
}
