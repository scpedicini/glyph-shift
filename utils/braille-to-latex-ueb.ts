/**
 * Converts ASCII text to Grade 2 UEB Braille as described in
 *     braille.sty, summary.tex
 * Essentially, it marks up
 *     {Letter}, {Number},
 *     {``}...{''} for double quotation which must be typed as ``...'',
 *     {.`}...{'.} for single quotation which must be typed as .`...'.,
 *     {percent}
 * so that the text is acceptable as input to \braille{}.  The output is
 * striped and returned all in one line.
 *
 * Usage:
 * "I like computer"
 * "April {Number}1999"
 * "I said {``}hello{''}, and she said {``}goodbye{''}."
 */

const NUMBER_CHARS: string = '0123456789';

// Arrays of word patterns
const partOfWord: string[] = [
    'and', 'for', 'of', 'the', 'with',
    'ch', 'sh', 'th', 'wh', 'ou', 'st',
    'ar', 'er', 'ed', 'gh', 'ow',
    'en', 'in',
];

const beginningOfWord: string[] = [
    'be', 'con', 'dis',
];

const middleOfWord: string[] = [
    'bb', 'cc', 'ea', 'ff', 'gg', 'ing',
];

const endOfWord: string[] = [
    'ing',
];

const finalLetterContraction: string[] = [
    'ound', 'ance', 'sion', 'less', 'ount',
    'ence', 'ong', 'ful', 'tion', 'ness', 'ment', 'ity',
];

const initialLetterContraction: string[] = [
    'these', 'those', 'upon', 'whose', 'word',
    'cannot', 'had', 'many', 'spirit', 'their', 'world',
    'character', 'day', 'ever', 'father', 'here', 'know', 'lord',
    'mother', 'name', 'one', 'ought', 'part', 'question', 'right',
    'some', 'there', 'through', 'time', 'under', 'where', 'work',
    'young',
];

const wholeWord: string[] = [
    'and', 'for', 'of', 'the', 'with',
    'child', 'shall', 'this', 'which', 'out', 'still',
    'but', 'can', 'do', 'every', 'from', 'go', 'have', 'just',
    'knowledge', 'like', 'more', 'not', 'people', 'quite', 'rather',
    'so', 'that', 'us', 'very', 'will', 'it', 'you', 'as',
    'be', 'enough', 'his', 'in', 'was', 'were',
    'about', 'above', 'according', 'across', 'after', 'afternoon',
    'afterward', 'again', 'against', 'almost', 'already', 'also',
    'although', 'altogether', 'always', 'because', 'before', 'behind',
    'below', 'beneath', 'beside', 'between', 'beyond', 'blind',
    'braille', 'children', 'conceive', 'conceiving', 'could',
    'deceive', 'deceiving', 'declare', 'declaring', 'either', 'first',
    'friend', 'good', 'great', 'herself', 'him', 'himself',
    'immediate', 'its', 'itself', 'letter', 'little', 'much', 'must',
    'myself', 'necessary', 'neither', 'oneself',
    'ourselves', 'paid', 'perceive', 'perceiving', 'perhaps', 'quick',
    'receive', 'receiving', 'rejoice', 'rejoicing', 'said', 'should',
    'such', 'themselves', 'thyself', 'today', 'together', 'tomorrow',
    'tonight', 'would', 'your', 'yourself', 'yourselves',
];

const convertBraille1 = (line: string): string => {
    let text = line
        .replaceAll("``", "{``}")  // ``...''
        .replaceAll("''", "{''}")
        .replaceAll(".`", "{.`}")  // .`...'.
        .replaceAll("'.", "{'.}")
        .replaceAll('%', '{percent}');  // %

    let result = '';
    let oldI = ' ';
    let oldII = ' ';
    let skipChars = 0;

    for (const char of text) {
        if (char === '{') {
            skipChars = 1;
        } else if (char === '}') {
            skipChars = 0;
        } else if (skipChars) {  // skip anything inside {...}
            // skip
        } else if (NUMBER_CHARS.includes(oldI) && 'abcdefghij'.includes(char)) {
            result += '{Letter}';
        } else if (NUMBER_CHARS.includes(char)) {
            if ((NUMBER_CHARS.includes(oldII) && '.-'.includes(oldI)) || NUMBER_CHARS.includes(oldI)) {
                // skip
            } else {
                result += '{Number}';
            }
        }
        result += char;
        oldII = oldI;
        oldI = char;
    }

    return result.split(' ').join(' '); // return all in one line
};

const beginTag = (tag: string, word: string): string => {
    return word.replaceAll(new RegExp(`^${tag}(.)`, "g"), `{${tag}}$1`);
};

const middleTag = (tag: string, word: string): string => {
    return word.replaceAll(new RegExp(`(.)${tag}(.)`, 'g'), `$1{${tag}}$2`);
};

const endTag = (tag: string, word: string): string => {
    return word.replaceAll(new RegExp(`(.)${tag}$`, "g"), `$1{${tag}}`);
};

const partTag = (tag: string, word: string): string => {
    return word.replaceAll(tag, `{${tag}}`);
};

/**
 * Check if word or part of word can be replaced by Grade 2
 * contractions. Returns string with Braille tags.
 */
const replaceWord = (word: string): string => {
    if (wholeWord.includes(word) || initialLetterContraction.includes(word)) {
        return `{${word}}`;
    }

    for (const tag of initialLetterContraction) {
        word = word.replaceAll(tag, `{${tag}}`);
    }

    for (const tag of finalLetterContraction) {
        word = middleTag(tag, word);
        word = endTag(tag, word);
    }

    for (const tag of beginningOfWord) {
        word = beginTag(tag, word);
    }

    for (const tag of endOfWord) {
        word = endTag(tag, word);
    }

    for (const tag of middleOfWord) {
        word = middleTag(tag, word);
    }

    for (const tag of partOfWord) {
        word = word.replaceAll(tag, `{${tag}}`);
    }

    // Remove nested braces
    let result = '';
    let braces = 0;

    for (const char of word) {
        if (char === '{') {
            braces++;
            if (braces === 1) {
                result += char;
            }
        } else if (char === '}') {
            braces--;
            if (braces === 0) {
                result += char;
            }
        } else {
            result += char;
        }
    }

    return result;
};

/**
 * Check if word, containing [a-zA-Z] only, is all UPPER case.
 */
const isAllUppercase = (word: string): boolean => {
    if (word.length === 0) return false;
    return /^[A-Z]+$/.test(word);
};

/**
 * Check if word, containing [a-zA-Z] only, is all lower case.
 */
const isAllLowercase = (word: string): boolean => {
    if (word.length === 0) return false;
    return /^[a-z]+$/.test(word);
};

/**
 * Check if word, containing [a-zA-Z] only, is Capitalized.
 */
const isCapitalized = (word: string): boolean => {
    if (word.length === 0) return false;
    if (word.length === 1) return isAllUppercase(word[0]);
    return isAllUppercase(word[0]) && isAllLowercase(word.slice(1));
};

/**
 * Change whole word '{tag}' to 'tag' when touching punctuations
 */
const noPunctuations = (tag: string, newTag: string, text: string): string => {
    text = text.replaceAll(new RegExp(`(\\s|\\A)${tag}([^\\s\\w{}])`, 'g'), `$1${newTag}$2`);
    text = text.replaceAll(new RegExp(`([^\\s\\w{}])${tag}(\\s|\\Z)`, 'g'), `$1${newTag}$2`);
    text = text.replaceAll(new RegExp(`([^\\s\\w{}])${tag}([^\\s\\w{}])`, 'g'), `$1${newTag}$2`);
    return text;
};

const convertBrailleUEB = (line: string): string => {
    let result = '';
    const words = line.split(/([a-zA-Z]+)/);

    for (const word of words) {
        if (word.length <= 1 || !(/[a-zA-Z]/).test(word[0])) {
            result += word;  // no work if not 2 or more letters
        } else if (isAllUppercase(word)) {
            result += '{Upper}' + replaceWord(word.toLowerCase());
        } else if (isCapitalized(word)) {
            const w = replaceWord(word.toLowerCase());
            if (/[a-z]/.test(w[0])) {
                result += word[0] + w.slice(1);  // preserve Capital letter
            } else {
                result += '{Capital}' + w;
            }
        } else {
            result += replaceWord(word);
        }
    }

    // whole words {in}, {be}, {enough}, {his}, {was}, {were}
    // cannot touch punctuations
    result = noPunctuations('{in}', 'in', result);
    result = noPunctuations('{be}', 'be', result);
    result = noPunctuations('{enough}', '{en}{ou}{gh}', result);
    result = noPunctuations('{his}', 'his', result);
    result = noPunctuations('{was}', 'was', result);
    result = noPunctuations('{were}', 'w{er}e', result);

    return convertBraille1(result);
};

export { convertBrailleUEB };
