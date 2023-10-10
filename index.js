import EPub from "epub";
import fetch from "node-fetch";
import ora from "ora";
import config from "./config.js";

import { getPlainBookInTextFormat, translatePlainBook, createEpubBook } from "./helper.js";

globalThis.fetch = fetch;

const book = new EPub(config.input);

book.on("end", async () => {
  const loader = ora("In progress... ").start();
  try {
    const plainBook = await getPlainBookInTextFormat(book);
    const newBook = await translatePlainBook(plainBook);

    await createEpubBook({ title: book.metadata.title, output: config.output, data: newBook.join("") });
    /* eslint-disable-next-line no-console */
    console.log("Done");
  } catch (error) {
    /* eslint-disable-next-line no-console */
    console.log("Error", error);
  } finally {
    loader.stop();
  }
});

book.parse();
