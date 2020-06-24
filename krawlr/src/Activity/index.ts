import { LifeCycle } from './LifeCycle'
import { Crawler } from '../Crawler'
import { DataStore } from '../DataStore'
/**
 * @description Activity Schedule
 * @author Alex Chomiak
 * @date 2020-06-23
 * @interface ActivityScheduleInformation
 * @member {number | null} Interval for repeating activity, if null, schedule once
 */
export interface ActivityScheduleInformation {
    interval: number | null
    callback: (data: any) => void
}

export interface ScheduleEntry extends ActivityScheduleInformation {
    ref: Activity
}
export abstract class Activity {
    private activitySchedule: ScheduleEntry
    private lifecycle: LifeCycle
    private parent: Crawler
    private store: DataStore
    private deliveryData: any[]

    constructor(schedule: ActivityScheduleInformation) {
        let activitySchedule = schedule as ScheduleEntry
        activitySchedule.ref = this
        this.activitySchedule = activitySchedule
        this.deliveryData = []
    }

    // * Setup Function that is expected to set parent crawler instance, create activity lifestyle and set the data store used for the activity
    public abstract setup(): void

    private validate() {
        // * Validates setup is done correctly for an Activity
        if (!this.parent) throw new Error('No parent Crawler instance is set. Check setup function')
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

    public getParent(): Crawler {
        this.validate()
        return this.parent
    }

    public getStore(): DataStore {
        this.validate()
        return this.store
    }

    public addDeliveryData(data: any) {
        this.deliveryData.push(data)
    }

    public clearDeliveryData(data: any) {
        this.deliveryData = []
    }

    public getDeliveryData() {
        return this.deliveryData
    }

    // * Setters
    public setParent(parent: Crawler) {
        if (this.parent != undefined) throw new Error('Field already set. Can only be set once.')
        this.parent = parent
    }

    public setLifeCycle(lifecycle: LifeCycle) {
        if (this.lifecycle != undefined) throw new Error('Field already set. Can only be set once.')
        this.lifecycle = lifecycle
    }

    public setStore(store: DataStore) {
        if (this.store != undefined) throw new Error('Field already set. Can only be set once.')
        this.store = store
    }
}
