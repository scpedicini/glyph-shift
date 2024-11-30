interface IPhoneticSwap {
    readonly title: string;
    readonly description: string;
    swap: (input: string) => string;
    initialize: () => void;
}

class HiraganaSwap implements IPhoneticSwap {
    readonly title = 'Hiragana to Katakana';
    readonly description = 'Converts all Hiragana characters to Katakana';

    swap(input: string): string {
        let retValue = "";
        return retValue;
    }

    initialize(): void {
    }
}


class FingerspellingSwap implements IPhoneticSwap {
    readonly title = 'English to ASL Fingerspelling';
    readonly description = 'Converts English words to ASL fingerspelling';

    // return a spanned string with class .finger-spelling
    swap(input: string): string {
        const span = document.createElement('span');
        span.classList.add('finger-spelling', 'pmapper-swapped', 'pmapper-tooltip');

        // add a custom data-attribute called pmapper-original with the original text
        span.dataset.pmapperOriginal = input;

        let retValue = "";
        return retValue;
    }

    initialize(): void {
    }
}
