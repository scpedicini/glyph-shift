export interface ISwapConfig {
}

export interface IPhoneticSwap {
    readonly title: string;
    readonly description: string;
    readonly isNeglectable: boolean;
    swap: (input: string, options?: any) => Promise<string | null>;
    initialize: () => void;
    canSwap: (input: string, options?: any) => Promise<boolean>;
}