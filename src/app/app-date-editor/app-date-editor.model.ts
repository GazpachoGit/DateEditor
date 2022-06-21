export interface IFormatMap {
    [name: string]: IFormat;
}
export interface IFormat {
    minValue: string,
    maxValue?: string
}