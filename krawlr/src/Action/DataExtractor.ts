export abstract class DataExtractor<T> {
    public abstract call(data: any, baseline: any): T
    public abstract getType(): string
}
