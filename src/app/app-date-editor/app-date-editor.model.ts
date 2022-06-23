export const SEPARATOR = ":"
export const FORMAT_dd = 'dd'
export const FORMAT_MM = 'MM'
export const FORMAT_yyyy = 'yyyy'
export const FORMAT_hh = 'HH'
export const FORMAT_mm = 'mm'
export const FORMAT_ss = 'ss'
export const FORMAT_nn = 'nnnnnnnnn'

export interface IFormatMap {
    [name: string]: IFormat;
}
export interface IFormat {
    regExp: string
}

export const formatMap: IFormatMap = {
    [FORMAT_dd]: {
        regExp: "(0[1-9]|[12][0-9]|3[01])"
    },
    [FORMAT_MM]: {
        regExp: "(0[1-9]|1[0-2])"
    },
    [FORMAT_yyyy]: {
        regExp: "(\\d{4})"
    },
    [FORMAT_hh]: {
        regExp: "(([0-1][0-9])|(2[0-3]))"
    },
    [FORMAT_mm]: {
        regExp: "([0-5][0-9])"
    },
    [FORMAT_ss]: {
        regExp: "([0-5][0-9])"
    },
    [FORMAT_nn]: {
        regExp: "(\\d{9})"
    }
}