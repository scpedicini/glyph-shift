import { describe, it, expect, vi, beforeEach } from "vitest";

import { convertBraille2 } from '../utils/braille-to-latex-pre-ueb';
import { convertBrailleUEB} from "../utils/braille-to-latex-ueb";
import {BrailleSys} from "@/utils/braille-sys";
import exp from "node:constants";

describe('Braille conversion', () => {

    it('should return the correct braille 1 level representation of a string', () => {
        expect(BrailleSys.convertWordToBraille1("and")).toBe("⠁⠝⠙");

        expect(BrailleSys.convertWordToBraille1("AB CD-EF")).toBe("⠁⠃ ⠉⠙-⠑⠋");

        expect(BrailleSys.convertWordToBraille1("ABCDEFGHIJKLMNOPQRSTUVWXYZ")).toBe("⠁⠃⠉⠙⠑⠋⠛⠓⠊⠚⠅⠇⠍⠝⠕⠏⠟⠗⠎⠞⠥⠧⠺⠭⠽⠵");

        expect(BrailleSys.convertNumberToBraille1(("1234567890"))).toBe("⠼⠁⠃⠉⠙⠑⠋⠛⠓⠊⠚");

    });

    it('should return the correct braille 2 level representation of a string', () => {
        const actual_result_1 = convertBraille2("I do not have to know how to read braille in order to produce beautifully typeset braille documents. All I have to do is parse ordinary text into tags for which TeX macros exist. TeX will, then, print out predefined symbols associated with each tags.");

        expect(actual_result_1).toBe(`I {do} {not} {have} {to}{know} h{ow} {to}r{ea}d {braille} {in} ord{er} {to}produce {be}auti{ful}ly typeset {braille} docu{ment}s. All I {have} {to}{do} is p{ar}se ord{in}{ar}y text {into}tags {for} {which} TeX macros exi{st}. TeX {will}, {the}n, pr{in}t {out} pr{ed}ef{in}{ed} symbols associat{ed} {with} ea{ch} tags.`);

        const actual_result_2 = convertBraille2("sounds boundry found.");

        expect(actual_result_2).toBe(`s{ound}s b{ound}ry f{ound}.`);
    });

    it('should return the correct braille 2 (UEB) level representation of a string', () => {
        expect(convertBrailleUEB("rationally")).toBe(`ra{tion}ally`);

        const input = "he ran into the cellar with the rest of a box of chocolates";
        const output = "he ran {in}to {the} cell{ar} {with} {the} re{st} {of} a box {of} {ch}ocolates";

        expect(convertBrailleUEB(input)).toBe(output);

        expect(convertBrailleUEB("erase")).toBe("{er}ase");

        expect(convertBrailleUEB(("professor"))).toBe("pr{of}essor");

        expect(convertBrailleUEB("atmosphere")).toBe("atmosp{here}");

        // out can be replaced entirely but only as a whole word
        expect(convertBrailleUEB("shouted")).toBe("{sh}{ou}t{ed}");

        expect(convertBrailleUEB("out")).toBe("{out}");
    });

    it.skip('should not use contractions when they overlap between two parts of a compound word', () => {
        // we cannot use the "gh" contraction because it is part of the word "dog" and "house"
        expect(convertBrailleUEB("doghouse")).toBe("dogh{ou}se}");
    });


});
