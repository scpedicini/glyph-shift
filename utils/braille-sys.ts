import {convertBrailleUEB} from "../utils/braille-to-latex-ueb";
import {convertBraille1} from "@/utils/braille-to-latex-pre-ueb";

export class BrailleSys {
    static brailleMap1: { [key: string]: string } = {
        "a": "⠁",
        "b": "⠃",
        "c": "⠉",
        "d": "⠙",
        "e": "⠑",
        "f": "⠋",
        "g": "⠛",
        "h": "⠓",
        "i": "⠊",
        "j": "⠚",
        "k": "⠅",
        "l": "⠇",
        "m": "⠍",
        "n": "⠝",
        "o": "⠕",
        "p": "⠏",
        "q": "⠟",
        "r": "⠗",
        "s": "⠎",
        "t": "⠞",
        "u": "⠥",
        "v": "⠧",
        "w": "⠺",
        "x": "⠭",
        "y": "⠽",
        "z": "⠵",

    };

    static braille1NumberMap: { [key: string]: string } = {
        "1" : "⠁",
        "2" : "⠃",
        "3" : "⠉",
        "4" : "⠙",
        "5" : "⠑",
        "6" : "⠋",
        "7" : "⠛",
        "8" : "⠓",
        "9" : "⠊",
        "0" : "⠚",
        "NUMERIC_INDICATOR" : "⠼",
    }

    static convertNumberToBraille1(number: string): string {
        const braille_number = this.braille1NumberMap["NUMERIC_INDICATOR"] + number.split('').map(char => BrailleSys.braille1NumberMap[char] || char).join('');
        return braille_number;
    }

    /**
     * Converts word (A-Z) to the Unicode braille representation
     * @param word
     */
    static convertWordToBraille1(word: string): string {
        const braille_word = word.split('').map(char => BrailleSys.brailleMap1[char.toLowerCase()] || char).join('');
        return braille_word;
    }

    static convertWordToBraille2(word: string): string {
        // first convert to the Latex representation
        const latex_representation = convertBrailleUEB(word);

        // use a simple regex to find any {.*} sections and replace them with the braille representation
        const braille_representation = latex_representation.replace(/{(.*?)}/g, (match, p1) => {
            const inner_match = p1.toLowerCase();
            // Look up the contraction in brailleMap2
            return BrailleSys.brailleMap2[inner_match] || inner_match;
        });
        // finally replace any remaining characters with the braille1 representation
        const braille_word = convertBraille1(braille_representation);

        return braille_word;
    }

    static brailleMap2 = {
        "and": "⠯",
        "ar": "⠜",a
        "ble": "⠼",
        "ch": "⠡",
        "ed": "⠫",
        "en": "⠢",
        "er": "⠻",
        "for": "⠿",
        "gh": "⠣",
        "in": "⠔",
        "ing": "⠬",
        "into": "⠔⠖",

        // in UEB this is
        "of": "⠷",
        "ou": "⠳",
        "ow": "⠪",
        "sh": "⠩",
        "th": "⠹",
        "the": "⠮",
        "wh": "⠱",
        "with": "⠾",

        "ea": "⠂",

        "bb": "⠆",
        "be": "⠆",

        "cc": "⠒",
        "con": "⠒",

        "dd": "⠲",
        "dis": "⠲",

        "ff": "⠖",
        "to": "⠖",

        "gg": "⠶",
        "were": "⠶",

        "?" : "⠦",
        "his": "⠦",

        "*": "⠔⠔",

        "was": "⠴",
        "by": "⠴",

        "com": "⠤",

        "st": "⠌",

        "will": "⠺",
    }

    // curly braces are used to indicate a further contracted form
    static abbrevToWholeWord: { [key: string]: string } = {
        "about": "ab",
        "above": "abv",
        "according": "ac",
        "across": "acr",
        "after": "af",
        "afternoon": "afn",
        "afterward": "afw",
        "again": "ag",
        "against": "ag{st}",
        "almost": "alm",
        "already": "alr",
        "also": "al",
        "although": "al{th}",
        "altogether": "alt",
        "always": "alw",
        "and": "{and}",
        "as": "z",
        "be": "{be}",
        "because": "{be}c",
        "before": "{be}f",
        "behind": "{be}h",
        "below": "{be}l",
        "beneath": "{be}n",
        "beside": "{be}s",
        "between": "{be}t",
        "beyond": "{be}y",
        "blind": "bl",
        "braille": "brl",
        "but": "b",
        "by": "{by}",
        "can": "c",
        "child": "{ch}",
        "children": "{ch}n",
        "conceive": "{con}cv",
        "conceiving": "{con}cvg",
        "could": "cd",
        "deceive": "dcv",
        "deceiving": "dcvg",
        "declare": "dcl",
        "declaring": "dclg",
        "do": "d",
        "either": "ei",
        "enough": "{en}",
        "every": "e",
        "first": "f{st}",
        "for": "{for}",
        "friend": "fr",
        "from": "f",
        "go": "g",
        "good": "gd",
        "great": "grt",
        "have": "h",
        "herself": "h{er}f",
        "him": "hm",
        "himself": "hmf",
        "his": "{his}",
        "immediate": "imm",
        "in": "{in}",
        "into": "{into}",
        "it": "x",
        "its": "xs",
        "itself": "xf",
        "just": "j",
        "knowledge": "k",
        "letter": "lr",
        "like": "ll",
        "little": "l",
        "more": "m",
        "much": "m{ch}",
        "must": "m{st}",
        "myself": "myf",
        "necessary": "nec",
        "neither": "nei",
        "not": "n",
        "o'clock": "o'c",
        "of": "{of}",
        "oneself": "{one}f",
        "ourselves": "{ou}rvs",
        "out": "{ou}",
        "paid": "pd",
        "people": "p",
        "perceive": "p{er}cv",
        "perceiving": "p{er}cvg",
        "perhaps": "p{er}h",
        "quick": "qk",
        "quite": "q",
        "rather": "r",
        "receive": "rcv",
        "receiving": "rcvg",
        "rejoice": "rjc",
        "rejoicing": "rjcg",
        "said": "sd",
        "shall": "{sh}",
        "should": "{sh}d",
        "so": "s",
        "still": "st",
        "such": "s{ch}",
        "that": "t",
        "the": "{the}",
        "themselves": "{the}mvs",
        "this": "th",
        "thyself": "{th}yf",
        "to": "{to}",
        "today": "td",
        "together": "tgr",
        "tomorrow": "tm",
        "tonight": "tn",
        "us": "u",
        "very": "v",
        "was": "{was}",
        "were": "{were}",
        "which": "{wh}",
        "will": "w",
        "with": "{with}",
        "would": "wd",
        "you": "y",
        "your": "yr",
        "yourself": "yrf",
        "yourselves": "yrvs"
    };

    static middleEndWordContractions: { [key: string]: string } = {
        "ound": "⠨⠙", // d
        "ance": "⠨⠑", // e
        "sion": "⠨⠝", // n
        "less": "⠨⠎", // s
        "ount": "⠨⠞", // t

        "ence": "⠰⠑", // e
        "ong": "⠰⠛", // g
        "ful": "⠰⠇", // l
        "tion": "⠰⠝", // n
        "ness": "⠰⠎", // s
        "ment": "⠰⠞", // t
        "ity": "⠰⠽", // y

        "ation": "⠠⠝", // n
        "ally": "⠠⠽", // y
    }

    static uebSymbols: { [key: string]: string } = {
        "♀": "⠘⠭",
        "♂": "⠘⠽",
    }



}
