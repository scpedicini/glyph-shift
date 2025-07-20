import { defineConfig } from 'vitest/config';
import { WxtVitest } from "wxt/testing";

export default defineConfig({
    plugins: [WxtVitest()],
    test: {
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/.{idea,git,cache,output,temp}/**',
            '**/deprecated/**'
        ]
    }
});
