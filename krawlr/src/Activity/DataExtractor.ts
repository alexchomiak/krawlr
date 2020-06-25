import { Activity } from '.'

/**
 * @description Data Extractor generic class
 * @author Alex Chomiak
 * @date 2020-06-25
 * @export
 * @abstract
 * @class DataExtractor
 * @template T
 */
export abstract class DataExtractor {
    public abstract call(data: any, ref: Activity): Promise<any>
    public abstract getType(): string
}
