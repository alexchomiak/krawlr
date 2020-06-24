import { Crawler } from '.'

export class Scheduler {
    private parent: Crawler

    constructor(ref: Crawler) {
        this.parent = ref
    }

    public schedule() {}
}
