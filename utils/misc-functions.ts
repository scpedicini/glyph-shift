export function isStringPopulated(input: string | null | undefined): boolean
{
    return typeof input === 'string' && input.trim().length > 0;
}
