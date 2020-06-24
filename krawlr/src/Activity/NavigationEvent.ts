export class NavigationEvent {
    private destination: string
    constructor(path: string) {
        this.destination = path
    }

    public getDestination(): string {
        return this.destination
    }

    public getType(): string {
        return 'navigation'
    }
}
