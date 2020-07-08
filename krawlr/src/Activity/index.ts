import { LifeCycle } from './LifeCycle'
import { DataStore } from '../DataStore'
import { v4 as uuidv4 } from 'uuid'
import { Page } from 'puppeteer'
import * as cron from 'node-cron'
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

/**
 * @description extension of activity schedule which includes activity reference
 * @author Alex Chomiak
 * @date 2020-06-25
 * @export
 * @interface ScheduleEntry
 * @extends {ActivityScheduleInformation}
 */
export interface ScheduleEntry extends ActivityScheduleInformation {
    ref: Activity
}

export abstract class Activity {
    private activitySchedule: ScheduleEntry
    private lifecycle: LifeCycle
    private store: DataStore
    private id: string
    private page: Page

    /**
     *Creates an instance of Activity.
     * @author Alex Chomiak
     * @date 2020-06-25
     * @param {ActivityScheduleInformation} schedule
     * @param {DataStore} store
     * @param {Page} page
     * @memberof Activity
     */
    constructor(
        schedule: ActivityScheduleInformation,
        store: DataStore,
        page: Page,
        params?: Object
    ) {
        let activitySchedule = schedule as ScheduleEntry
        activitySchedule.ref = this
        // * Validate cron string in schedule info
        cron.validate(schedule.cron)
        this.activitySchedule = activitySchedule
        this.store = store
        this.id = uuidv4()

        this.page = page

        Object.keys(params).forEach(key => store.set(key, params[key]))
    }

    /**
     * @description Setup Function that is expected to set parent crawler instance,
     * create activity lifestyle and set the data store used for the activity
     * @author Alex Chomiak
     * @date 2020-06-25
     * @abstract
     * @memberof Activity
     */
    public abstract setup(): void

    /**
     * @description validates setup is done correctly for an Activity
     * @author Alex Chomiak
     * @date 2020-06-25
     * @private
     * @memberof Activity
     */
    private validate() {
        if (!this.lifecycle) throw new Error('No Activity LifeCycle defined. Check setup function')
        if (!this.store) throw new Error('No DataStore defined for Activity. Check setup function')
        if (!this.activitySchedule)
            throw new Error('No Activity schedule defined. Check Activity initialization')
    }

    /**
     * @description Deliver updated data to activity callback
     * @author Alex Chomiak
     * @date 2020-06-25
     * @memberof Activity
     */
    public deliver() {
        this.validate()
        const data = this.lifecycle.getDeliveryData()
        if (data.length > 0) {
            this.activitySchedule.callback(data)
        }
    }

    // * Getters

    /**
     * @description
     * @author Alex Chomiak
     * @date 2020-06-25
     * @returns {ScheduleEntry}
     * @memberof Activity
     */
    public getScheduleInformation(): ScheduleEntry {
        this.validate()
        return this.activitySchedule
    }

    /**
     * @description
     * @author Alex Chomiak
     * @date 2020-06-25
     * @returns {LifeCycle}
     * @memberof Activity
     */
    public getLifeCycle(): LifeCycle {
        this.validate()
        return this.lifecycle
    }

    /**
     * @description
     * @author Alex Chomiak
     * @date 2020-06-25
     * @returns {Page}
     * @memberof Activity
     */
    public getPage(): Page {
        return this.page
    }

    /**
     * @description
     * @author Alex Chomiak
     * @date 2020-06-25
     * @returns {DataStore}
     * @memberof Activity
     */
    public getStore(): DataStore {
        return this.store
    }

    /**
     * @description
     * @author Alex Chomiak
     * @date 2020-06-25
     * @returns {string}
     * @memberof Activity
     */
    public getID(): string {
        return this.id
    }

    /**
     * @description
     * @author Alex Chomiak
     * @date 2020-06-25
     * @param {LifeCycle} lifecycle
     * @memberof Activity
     */
    public setLifeCycle(lifecycle: LifeCycle) {
        if (this.lifecycle != undefined) throw new Error('Field already set. Can only be set once.')
        this.lifecycle = lifecycle
    }
}
