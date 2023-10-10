/* eslint-disable import/prefer-default-export */
import { htmlToText } from "html-to-text";
import translate from "translate";
import EpubGen from "epub-gen";
import config from "./config.js";

const enhancedTranslation = async (info) => {
  for (let i = 1; i < 50; i += 1) {
    try {
      /* eslint-disable no-await-in-loop */
      const data = await translate(info, { from: config.from, to: config.to });
      return data;
    } catch (e) {
      // nothing
    }
  }
  return Promise.reject();
};

const getTranslations = async (data) => {
  const paragraphPromises = data.split(/\n\n/).map(async (paragraph = "") => {
    const sentences = paragraph.replace(/\n/g, " ").match(/([^ \r\n][^!?\.\r\n]+[\w”!?\.]+)/g);
    if (sentences && sentences.length > 0) {
      const sentencePromises = sentences.map(async (sentence) => {
        let translatedSentence = "";
        try {
          const translation = await enhancedTranslation(sentence);
          translatedSentence = `<span style="color: green">${translation}</span> `;
        } catch (e) {
          translatedSentence = " ";
        }
        return `${sentence} ${translatedSentence}`;
      });
      const translatedSentences = await Promise.all(sentencePromises);
      return `<p>${translatedSentences.join("")}</p>`;
    }
  });

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
  const newBookPromises = plainBook.map(async (chapter) => {
    const translations = await getTranslations(chapter.textWithoutHtml);
    return translations;
  });

  const newBook = await Promise.all(newBookPromises);
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
