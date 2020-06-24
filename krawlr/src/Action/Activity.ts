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
interface ActivityScheduleInformation {
    interval: number | null
    ref: Activity
}

/**
 * @description
 * @author Alex Chomiak
 * @date 2020-06-23
 * @interface ActivityProps
 */
interface ActivityProps {
    lifecycle: LifeCycle
    schedule: ActivityScheduleInformation
}

export abstract class Activity {
    private activitySchedule: ActivityScheduleInformation
    private lifecycle: LifeCycle
    private parent: Crawler
    private store: DataStore

    constructor(schedule: ActivityScheduleInformation) {
        this.activitySchedule = schedule
    }

    // * Setup Function that is expected to set parent crawler instance, create activity lifestyle and set the data store used for the activity
    public abstract setup(): void

    private validate() {
        // * Validates setup is done correctly
        if (!this.parent) throw new Error('No parent Crawler instance is set. Check setup function')
        if (!this.lifecycle) throw new Error('No Activity LifeCycle defined. Check setup function')
        if (!this.store) throw new Error('No DataStore defined for Activity. Check setup function')
        if (!this.activitySchedule)
            throw new Error('No Activity schedule defined. Check Activity initialization')
    }

    // * Getters
    public getScheduleInformation(): ActivityScheduleInformation {
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

    // * Setters
    private setParent(parent: Crawler) {
        this.parent = parent
    }

    private setLifeCycle(lifecycle: LifeCycle) {
        this.lifecycle = lifecycle
    }

    private setStore(store: DataStore) {
        this.store = store
    }
}
