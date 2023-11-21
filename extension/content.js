/* global axios, Readability */

const getSentences = async (text) => {
  // Make an external API call and return an array of sentences for the given text.
  let sentences = [];
  try {
    const response = await axios.post("http://localhost:3000/highlight", {
      text,
    });
    sentences = JSON.parse(response.data.result).sentences;
    return sentences;
  } catch (error) {
    console.error(error);
  }
};

const normalizeHyphens = (text) => {
  return text.replace(/[\u2010-\u2015]/g, "-");
};

function getMainContent() {
  const documentClone = document.cloneNode(true);
  const readability = new Readability(documentClone);
  const article = readability.parse();
  return article.textContent || article;
}

const highlightSentences = async () => {
  const mainContent = getMainContent();

  if (mainContent) {
    const keySentences = await getSentences(mainContent);

    const keySentencesNormalized = keySentences.map((sentence) =>
      normalizeHyphens(sentence).toLowerCase()
    );

    const highlightSentencesInNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const parent = node.parentNode;
        const text = node.textContent;
        const sentences = text.split(/(?<=\.\s)/);

        const fragment = document.createDocumentFragment();

        sentences.forEach((sentence) => {
          const foundKeySentence = keySentencesNormalized.find(
            (keySentence) => {
              const normalizedSentence =
                normalizeHyphens(sentence).toLowerCase();
              const wordsInSentence = normalizedSentence.split(/\s+/);
              const wordsInKeySentence = keySentence.split(/\s+/);

              const firstFiveWordsInSentence = wordsInSentence
                .slice(0, 5)
                .join(" ");
              const firstFiveWordsInKeySentence = wordsInKeySentence
                .slice(0, 5)
                .join(" ");

              return firstFiveWordsInSentence === firstFiveWordsInKeySentence;
            }
          );

          if (foundKeySentence) {
            const span = document.createElement("span");
            span.className = "highlight-text";
            const chars = sentence.split("");
            let highlightedText = "";
            for (let i = 0; i < chars.length; i++) {
              const char = chars[i];
              highlightedText += char;
              if (char === "." && chars[i + 1] === " ") {
                break;
              }
            }
            span.textContent = highlightedText;
            fragment.appendChild(span);

            // Add any remaining text
            const remainingText = sentence.slice(highlightedText.length);
            if (remainingText) {
              fragment.appendChild(document.createTextNode(remainingText));
            }
          } else {
            fragment.appendChild(document.createTextNode(sentence));
          }
        });

        parent.replaceChild(fragment, node);
        return;
      }

      for (let i = 0; i < node.childNodes.length; i++) {
        highlightSentencesInNode(node.childNodes[i]);
      }
    };

    highlightSentencesInNode(document.body);
  }
};

const handleScroll = () => {
  clearTimeout(window.scrollTimeout);
  window.scrollTimeout = setTimeout(() => {
    highlightSentences();
  }, 300);
};

// Initial highlight
highlightSentences();

// Attach scroll event listener
window.addEventListener("scroll", handleScroll);
