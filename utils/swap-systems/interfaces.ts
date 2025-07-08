export interface ISwapConfig {
}

export interface IPhoneticSwap {
    readonly title: string;
    readonly description: string;
    swap: (input: string, options?: any) => Promise<string | null>;
    initialize: () => void;
    canSwap: (input: string) => Promise<boolean>;
}