export const SEPARATOR = ":"
export const FORMAT_dd: string = 'dd'
export const FORMAT_MM: string = 'MM'
export const FORMAT_yyyy: string = 'yyyy'
export const FORMAT_yy: string = 'yy'
export const FORMAT_hh: string = 'HH'
export const FORMAT_mm: string = 'mm'
export const FORMAT_ss: string = 'ss'
export const FORMAT_S: string = 'S'
export const FORMAT_SS: string = 'SS'
export const FORMAT_SSS: string = 'SSS'
export const SEPARATOR_TYPE = 'SEPARATOR_TYPE'

export const formatArray = [FORMAT_dd, FORMAT_MM, FORMAT_yyyy, FORMAT_hh, FORMAT_mm, FORMAT_ss, FORMAT_SSS]

export interface IClickPos {
    clickX: number,
    clickY: number
}
export interface IFormatMap {
    [name: string]: IFormatData;
}
export interface IFormatData {
    regExp: string,
    regExps: string[],
    formatRegExp: RegExp
}

export const formatMap: IFormatMap = {
    [FORMAT_dd]: {
        regExp: "(0[1-9]|[12][0-9]|3[01])",
        regExps: ["([0-3])", "([0-9])"],
        formatRegExp: /dd/
    },
    [FORMAT_MM]: {
        regExp: "(0[1-9]|1[0-2])",
        regExps: ["([0-1])", "\\d"],
        formatRegExp: /MM/
    },
    [FORMAT_yyyy]: {
        regExp: "(\\d{4})",
        regExps: ["(\\d)", "(\\d)", "(\\d)", "(\\d)"],
        formatRegExp: /yyyy/
    },
    [FORMAT_yy]: {
        regExp: "(\\d{2})",
        regExps: ["(\\d)", "(\\d)"],
        formatRegExp: /(?<!y)yy(?!y)/
    },
    [FORMAT_hh]: {
        regExp: "(([0-1][0-9])|(2[0-3]))",
        regExps: ["([0-2])", "([0-9])"],
        formatRegExp: /HH/
    },
    [FORMAT_mm]: {
        regExp: "([0-5][0-9])",
        regExps: ["([0-5])", "([0-9])"],
        formatRegExp: /mm/
    },
    [FORMAT_ss]: {
        regExp: "([0-5][0-9])",
        regExps: ["([0-5])", "([0-9])"],
        formatRegExp: /ss/
    },
    [FORMAT_S]: {
        regExp: "(\\d)",
        regExps: ["(\\d)"],
        formatRegExp: /(?<!S)S(?!S)/
    },
    [FORMAT_SS]: {
        regExp: "(\\d{2})",
        regExps: ["(\\d)", "(\\d)"],
        formatRegExp: /(?<!S)SS(?!S)/
    },
    [FORMAT_SSS]: {
        regExp: "(\\d{3})",
        regExps: ["(\\d)", "(\\d)", "(\\d)"],
        formatRegExp: /(?<!S)SSS(?!S)/
    },
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
    for (let [key, value] of Object.entries(formatMap)) {
        let match = value.formatRegExp.exec(format)
        if (match) {
            temp.push({
                type: key,
                innerIndex: 0,
                startIndex: match.index,
                endIndex: match.index + key.length - 1,
                formatRegExp: value.regExp,
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
    return output
}
export function getCurrentRegExp(formatArray: Array<FormatElement>): RegExp {
    let output: string = ""
    formatArray.forEach(f => {
        if (f.type != SEPARATOR_TYPE && f.innerIndex == 0) {
            output += `${f.formatRegExp}${f.separator}`
        }
    })
    return new RegExp(output)
}