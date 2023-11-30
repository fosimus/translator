/* eslint-disable import/prefer-default-export */
import { htmlToText } from "html-to-text";
import translate from "translate";
import EpubGen from "epub-gen";
import pLimit from "p-limit";
import fetch from "node-fetch";
import config from "./config.js";

globalThis.fetch = fetch;

const P_LIMIT = 100;

const enhancedTranslation = async (info) => {
  for (let i = 1; i < 50; i += 1) {
    try {
      /* eslint-disable no-await-in-loop */
      const data = await translate(info, { from: config.from, to: config.to });
      return data;
    } catch (e) {
      /* eslint-disable-next-line no-console */
      console.log(e);
    }
  }
  return Promise.reject();
};

const getTranslations = async (data) => {
  const paragraphPromisesLimit = pLimit(P_LIMIT);
  /* eslint-disable-next-line consistent-return */
  const paragraphPromises = data.split(/\n\n/).map((paragraph = "", i) => paragraphPromisesLimit(async () => {
    /* eslint-disable-next-line no-useless-escape */
    const sentences = paragraph.replace(/\n/g, " ").match(/([^ \r\n][^!?\.\r\n]+[\w”!?\.]+)/g);
    if (sentences && sentences.length > 0) {
      const sentencePromisesLimit = pLimit(P_LIMIT);
      const sentencePromises = sentences.map((sentence, y) => sentencePromisesLimit(async () => {
        let translatedSentence = "";
        try {
          const translation = await enhancedTranslation(sentence, i, y);
          translatedSentence = `<span style="color: green">${translation}</span> `;
        } catch (e) {
          translatedSentence = " ";
        }
        return `${sentence} ${translatedSentence}`;
      }));
      const translatedSentences = await Promise.all(sentencePromises);
      return `<p>${translatedSentences.join("")}</p>`;
    }
  }));

  const result = await Promise.all(paragraphPromises);
  return result.join("");
};

export const getPlainBookInTextFormat = async (book) => {
  const chaptersArrPromises = book.flow.map((chapter, i) => new Promise((resolve, reject) => {
    book.getChapter(chapter.id, (err, text) => {
      if (err) {
        reject(err);
      } else {
        const textWithoutHtml = htmlToText(text, {
          selectors: [
            { selector: "img", format: "skip" },
            { selector: "a", options: { ignoreHref: true } },
          ],
        });
        resolve({ ...chapter, index: i, textWithoutHtml });
      }
    });
  }));

  const plainBookInTextFormat = await Promise.all(chaptersArrPromises);
  return plainBookInTextFormat;
};

export const translatePlainBook = async (plainBook) => {
  const newBook = [];
  /* eslint-disable-next-line no-restricted-syntax */
  for (const chapter of plainBook) {
    const translations = await getTranslations(chapter.textWithoutHtml);
    newBook.push(translations);
    /* eslint-disable-next-line no-console */
    console.log(`Chapter ${newBook.length} done (from ${plainBook.length})`);
  }
  return newBook;
};

export const createEpubBook = async ({ title, output, data }) => {
  const options = {
    title,
    output,
    content: [
      {
        title: "",
        data,
      },
    ],
  };
  /* eslint-disable no-new */
  await new EpubGen(options).promise;
};
