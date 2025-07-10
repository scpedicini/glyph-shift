export function isStringPopulated(input: string | null | undefined): boolean
{
    return typeof input === 'string' && input.trim().length > 0;
}

export function isAlphabetical(input: string | null | undefined, minLength: number): boolean {
    return typeof input === 'string' && input.length >= minLength && /^[a-zA-Z]+$/.test(input);
}