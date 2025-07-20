
# Step 1 - The Data Preparation Script for Katakana Loan Words

Here is a excerpt from the data source `gairaigo_katakana_loanwords.csv`:

```
Katakana,Transliteration,Additional
アフターサービス,after service,"after-sales service, customer service, post-sale support, warranty service, technical support, maintenance service, after-sales support, customer support, user support, follow-up service"
アイドル,idol,"idol, idols, pop idol, pop idols, teen idol, teen idols, celebrity, celebrities, star, stars"
アイス,ice,"ice, ice cream, frozen treat, popsicle, ice pop, frozen dessert, iced treat, gelato, sorbet, sherbet, frozen confection, ices"
アイスクリーム,ice cream,"ice cream, ice creams, icecream, ice-cream, frozen dessert, gelato, sorbet"
アイゼン,,"crampons, crampon, ice cleat, ice cleats, climbing spikes, ice spikes, mountaineering crampons"
アメフト,,"American football, football, gridiron football, NFL football, college football, pro football"
アメリカンドッグ,American dog,"corn dog, corn dogs, hot dog on a stick, battered hot dog, battered sausage, deep-fried hot dog, stick hot dog"
アニメ,anime,"anime, animation, animations, animated series, animated show, animated shows, Japanese animation, Japanese animations, cartoon, cartoons"
アンケート,enquête,"survey, questionnaire, poll, surveys, questionnaires, polls, inquiry, inquiries"
アンニュイ,,"ennui, boredom, listlessness, weariness, tedium, languor, apathy, melancholy, world-weariness, existential boredom, spiritual fatigue, lassitude"
アパート,apart,"apartment, apartments, flat, flats, unit, units, rental unit, rental units"
アポ,,"appointment, appointments, meeting, meetings, scheduled meeting, business meeting, date, dates"
アロエ,aloe,"aloe, aloe vera, aloe plant, aloe plants, aloes"
アルバイト or バイト,,"part-time job, part-time work, part-time jobs, part-time, side job, side jobs, temporary job, temporary jobs, casual work, casual job, casual jobs, temp work"
```

You will need to create a data preparation script to convert this CSV file into a JSON format suitable for the extension. The script should read the CSV, parse the Katakana words, their transliterations, and any additional information, and then output a structured JSON file.

That data structure will look like this:

```json
{
    "idol": [
        {
        "isTransliteration": true,
        "katakana": "アイドル"   
        },
        ...
        // it is possible to have multiple entries although highly unlikely, but it might be that idol could have two kana forms
    ]
    "idols": [
        {
        "isTransliteration": false,
        "katakana": "アイドル"
        },
    ]
    "pop idol": [
        {
        "isTransliteration": false,
        "katakana": "アイドル"
        }
    ]
}
```

Basically if the katakana word has a transliteration in that column, it should be marked as `isTransliteration: true`, otherwise it should be `false`. The `katakana` field should contain the original Katakana word. All additional words in the Additional column should be treated as synonyms and included in the JSON structure with `isTransliteration` set to `false`.

There may be accidental duplicates in the Additional column. While that is fine, once we have built a Katakana<->English mapping where  `isTransliteration` is `true` it should always stay true, even if it appears again in the Additional column.

Don't forget to normalize (lowercase, trim) all keys as you are processing them in the CSV to ensure consistency in the JSON output.

# Step 2 - The TrueKanaSwap Module System

The "TrueKanaSwap" is going to replace the existing KatakanaSwap module since it will allow a user to choose "OnlyTransliterations" or "All Words" which presents an additional challenge to the user since those words may have originally come from other languages such as Dutch, Portuguese, or German.

It will still need to use the concept of DataLoaders for Test Loading, File Loading, In Memory Loading, etc. There is likely plenty of code or even loaders that can be reused without needing to much duplication. See the existing KatakanaSwap module system for reference.re