// A tuple mapping of decimal values to their Roman‑numeral symbols
const ROMAN_NUMERAL_MAP: Array<[value: number, symbol: string]> = [
  [1000, 'M'],
  [900,  'CM'],
  [500,  'D'],
  [400,  'CD'],
  [100,  'C'],
  [90,   'XC'],
  [50,   'L'],
  [40,   'XL'],
  [10,   'X'],
  [9,    'IX'],
  [5,    'V'],
  [4,    'IV'],
  [1,    'I'],
];

/**
 * Converts a decimal number to its Roman numeral representation. (range: 1-3999)
 */
export const toRoman = (decimalValue: number): string => {
  let remainder   = decimalValue; // portion still to encode
  let romanResult = '';           // running output

  ROMAN_NUMERAL_MAP.forEach(([weight, symbol]) => {
    while (remainder >= weight) {
      romanResult += symbol;
      remainder   -= weight;
    }
  });

  return romanResult;
};