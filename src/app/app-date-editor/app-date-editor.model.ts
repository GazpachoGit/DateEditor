export const SEPARATOR = ":"
export const FORMAT_dd = 'dd'
export const FORMAT_MM = 'MM'
export const FORMAT_yyyy = 'yyyy'
export const FORMAT_hh = 'HH'
export const FORMAT_mm = 'mm'
export const FORMAT_ss = 'ss'
export const FORMAT_nn = 'nnnnnnnnn'
export const SEPARATOR_TYPE = 'SEPARATOR_TYPE'

export const formatArray = [FORMAT_dd, FORMAT_MM, FORMAT_yyyy, FORMAT_hh, FORMAT_mm, FORMAT_ss]

export interface IFormatMap {
    [name: string]: IFormatData;
}
export interface IFormatData {
    regExp: string,
    regExps: string[]
}

export const formatMap: IFormatMap = {
    [FORMAT_dd]: {
        regExp: "(0[1-9]|[12][0-9]|3[01])",
        regExps: ["([0-3])", "([0-9])"]
    },
    [FORMAT_MM]: {
        regExp: "(0[1-9]|1[0-2])",
        regExps: ["([0-1])", "\\d"]
    },
    [FORMAT_yyyy]: {
        regExp: "(\\d{4})",
        regExps: ["\\d", "\\d", "\\d", "\\d"]
    },
    [FORMAT_hh]: {
        regExp: "(([0-1][0-9])|(2[0-3]))",
        regExps: ["([0-2])", "([0-9])"]
    },
    [FORMAT_mm]: {
        regExp: "([0-5][0-9])",
        regExps: ["([0-5])", "([0-9])"]
    },
    [FORMAT_ss]: {
        regExp: "([0-5][0-9])",
        regExps: ["([0-5])", "([0-9])"]
    }
}
export interface FormatElement {
    type: string,
    innerIndex: number,
    startIndex: number,
    endIndex: number,
    formatRegExp?: string,
    localRegExp?: RegExp
    separator: string,
    separatorLength: number
}
export function analizeFormat(format: string): Array<FormatElement> {
    //find all format types
    let temp: Array<FormatElement> = []
    for (var formatType of formatArray) {
        let startIndex = format.indexOf(formatType)
        if (startIndex != -1) {
            temp.push({
                type: formatType,
                innerIndex: 0,
                startIndex,
                endIndex: startIndex + formatType.length - 1,
                formatRegExp: formatMap[formatType].regExp,
                separator: '',
                separatorLength: 0
            })
        }
    }
    temp.sort((a, b) => a.startIndex - b.startIndex)
    for (let i = 0; i < temp.length - 1; i++) {
        if (temp[i + 1].startIndex - temp[i].endIndex > 1) {
            temp[i].separator = format.slice(temp[i].endIndex + 1, temp[i + 1].startIndex)
        }
    }
    let output = []
    for (let f of temp) {
        output.push(...[...f.type].map((e, i) => ({
            type: f.type,
            startIndex: f.startIndex,
            endIndex: f.endIndex,
            formatRegExp: f.formatRegExp,
            localRegExp: new RegExp(formatMap[f.type].regExps[i]),
            separator: f.separator,
            separatorLength: f.separator.length,
            innerIndex: i
        })))
        if (f.separator && f.separator.length > 0) {
            let sep = f.separator as string
            output.push(...[...f.separator].map((s, i) => ({
                type: SEPARATOR_TYPE,
                startIndex: f.endIndex + 1,
                endIndex: f.endIndex + sep.length,
                separator: sep,
                separatorLength: sep.length,
                innerIndex: i
            })))
        }
    }
    let trimedFormat = format.slice(temp[0].startIndex, temp[temp.length - 1].endIndex + 1)
    return output
    //order by startIndex
    //get sep between end and next start
}