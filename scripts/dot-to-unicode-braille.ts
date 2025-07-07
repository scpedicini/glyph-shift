/* A looping readline interface where the user can input a series of dots (e.g. 1-2-5, or 125) and the program will output the corresponding Unicode Braille character. */

/* A looping readline interface where the user can input a series of dots (e.g. 1-2-5, or 125) and the program will output the corresponding Unicode Braille character. */

import * as readline from 'node:readline';

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Map of dot positions to their binary values in Unicode Braille
const dotValues = {
    1: 0x1,    // Dot 1
    2: 0x2,    // Dot 2
    3: 0x4,    // Dot 3
    4: 0x8,    // Dot 4
    5: 0x10,   // Dot 5
    6: 0x20,   // Dot 6
    7: 0x40,   // Dot 7
    8: 0x80    // Dot 8
};

// Base Unicode value for Braille patterns
const BRAILLE_BASE = 0x2800;

function dotsToUnicode(dots: string): string {
    // Remove any dashes and spaces, split into individual characters
    const dotArray = dots.replace(/[-\s]/g, '').split('');

    // Calculate binary value
    const binaryValue = dotArray.reduce((acc, dot) => {
        const position = parseInt(dot);
        if (position >= 1 && position <= 8) {
            return acc | dotValues[position as keyof typeof dotValues];
        }
        return acc;
    }, 0);

    // Convert to Unicode Braille character
    return String.fromCharCode(BRAILLE_BASE + binaryValue);
}

function prompt() {
    rl.question('Enter dot numbers (e.g. 1-2-5 or 125) or "q" to quit: ', (answer) => {
        if (answer.toLowerCase() === 'q') {
            rl.close();
            return;
        }

        const brailleChar = dotsToUnicode(answer);
        console.log(`Braille character: ${brailleChar}`);
        prompt(); // Continue prompting
    });
}

// Start the prompt loop
console.log('Welcome to Dots-to-Unicode Braille converter!');
console.log('Enter dot numbers between 1-8 separated by optional dashes.');
prompt();

rl.on('close', () => {
    console.log('\nGoodbye!');
    process.exit(0);
});


