import { describe, test, expect, beforeEach } from 'vitest';
import { HiraganaSwap } from '../utils/swap-systems/hiragana-swap';
import { FileSystemHiraganaDataLoader } from '../utils/data-loaders-node';
import path from 'path';

describe('HiraganaSwap with FileSystemDataLoader', () => {
    let hiraganaSwap: HiraganaSwap;

    beforeEach(async () => {
        const dataLoader = new FileSystemHiraganaDataLoader(
            path.resolve(__dirname, '../public/data/eng_kana_dict.json')
        );
        hiraganaSwap = new HiraganaSwap(dataLoader);
        await hiraganaSwap.initialize();
    });

    test('should be able to load data and swap a word', async () => {
        const result = await hiraganaSwap.swap('aaron');
        expect(result).not.toBeNull();
    });
});