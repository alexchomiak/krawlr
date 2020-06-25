import { Activity } from '.'

export abstract class DataExtractor<T> {
    public abstract call(data: any, ref: Activity): Promise<T>
    public abstract getType(): string
}
