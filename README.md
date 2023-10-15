# Translator

This tool will assist you in learning a language through the parallel reading method. Translator will translate the book following a specific structure: one sentence in the original language, promptly followed by a translation into your chosen language. This way, you won't need to spend time translating each word separately. Additionally, numerous words and phrases have various translations based on context, which is lacking when translating individual words, but is taken into account when you translate the entire sentence – precisely what this tool does.

## Restrictions

- Currently only `.epub` book format is supported.
- There is a limit on the number of translations depending on the engine (check sites: Google, Yandex, Libre and DeepL).

## Getting started

```
yarn
```

Update config file:

```js
export default {
  from: "en",
  to: "sv",
  // test.epub book exists in the repo as an example
  input: "./test.epub",
  output: "./book.epub",
};
```

```
yarn start
⠹ In progress...
⠹ In progress... Zipping temp dir to ./book.epub
⠸ In progress... Done zipping, clearing temp dir...
Done
✨  Done in 1.42s.
```

## Example

Here you can see the final result with translation from Swedish to English.

<img src="./img/exampel.png" width="350">

## Engine

The tool uses [translate](https://github.com/franciscop/translate/tree/master) package which supports several translation services: Google (default), Yandex, Libre or DeepL.
