import { Crawler } from '.'
import { Activity } from '../Activity'
import cron, { ScheduledTask } from 'node-cron'

/**
 * @description Schedules activities when prompted by parent Crawler instance
 * @author Alex Chomiak
 * @date 2020-06-25
 * @export
 * @class Scheduler
 */
export class Scheduler {
    private parent: Crawler
    private tasks: Map<string, ScheduledTask>
    constructor(ref: Crawler) {
        this.parent = ref
        this.tasks = new Map<string, ScheduledTask>()
    }

    /**
     * @description Schedules Activity
     * @author Alex Chomiak
     * @date 2020-06-25
     * @param {Activity} activity
     * @memberof Scheduler
     */
    public async schedule(activity: Activity) {
        // * Call Prep Stage for Activity
        await activity.getLifeCycle().traverse('prep')
        const interval = activity.getScheduleInformation().cron

        // * One time job
        await activity.getLifeCycle().traverse('stimulus')
        activity.deliver()

        // * If cron activity, setup cron schedule
        if (interval !== null) {
            // * Schedule Activity stimulus and delivery
            const task = cron.schedule(interval, async () => {
                console.log(`Running ${activity.getID()}`)
                // * Call stimulus and deliver on data update
                await activity.getLifeCycle().traverse('stimulus')
                activity.deliver()
            })

            console.log(`Scheduled cron task for Activity ${activity.getID()}`)
            this.tasks.set(activity.getID(), task)
        }
    }

    /**
     * @description Destroys a scheduled cron Activity
     * @author Alex Chomiak
     * @date 2020-06-25
     * @param {Activity} activity
     * @memberof Scheduler
     */
    public unschedule(activity: Activity) {
        const task = this.tasks.get(activity.getID())
        if (task) {
            // * Stop and destroy task
            task.stop()
            task.destroy()

            // * Clear tasks from tasks map
            this.tasks.set(activity.getID(), null)
        } else {
            throw new Error('Task is not scheduled to run in cron scheduler')
        }
    }
}
