/**
 * Generate a set of keyword from mail titles based on empirical rules.
 * @author He, Hao
 */

maildata = require('../dist/mails.json');

const stopwords = [
    "a",
    "able",
    "about",
    "across",
    "after",
    "all",
    "almost",
    "also",
    "am",
    "among",
    "an",
    "and",
    "any",
    "are",
    "as",
    "at",
    "be",
    "because",
    "been",
    "but",
    "by",
    "can",
    "cannot",
    "could",
    "dear",
    "did",
    "do",
    "does",
    "either",
    "else",
    "ever",
    "every",
    "for",
    "from",
    "get",
    "got",
    "had",
    "has",
    "have",
    "he",
    "her",
    "hers",
    "him",
    "his",
    "how",
    "however",
    "i",
    "if",
    "in",
    "into",
    "is",
    "it",
    "its",
    "just",
    "least",
    "let",
    "like",
    "likely",
    "may",
    "me",
    "might",
    "most",
    "must",
    "my",
    "neither",
    "no",
    "nor",
    "not",
    "of",
    "off",
    "often",
    "on",
    "only",
    "or",
    "other",
    "our",
    "own",
    "rather",
    "said",
    "say",
    "says",
    "she",
    "should",
    "since",
    "so",
    "some",
    "than",
    "that",
    "the",
    "their",
    "them",
    "then",
    "there",
    "these",
    "they",
    "this",
    "tis",
    "to",
    "too",
    "twas",
    "us",
    "wants",
    "was",
    "we",
    "were",
    "what",
    "when",
    "where",
    "which",
    "while",
    "who",
    "whom",
    "why",
    "will",
    "with",
    "would",
    "yet",
    "you",
    "your",
    "ain't",
    "aren't",
    "can't",
    "could've",
    "couldn't",
    "didn't",
    "doesn't",
    "don't",
    "hasn't",
    "he'd",
    "he'll",
    "he's",
    "how'd",
    "how'll",
    "how's",
    "i'd",
    "i'll",
    "i'm",
    "i've",
    "isn't",
    "it's",
    "might've",
    "mightn't",
    "must've",
    "mustn't",
    "shan't",
    "she'd",
    "she'll",
    "she's",
    "should've",
    "shouldn't",
    "that'll",
    "that's",
    "there's",
    "they'd",
    "they'll",
    "they're",
    "they've",
    "wasn't",
    "we'd",
    "we'll",
    "we're",
    "weren't",
    "what'd",
    "what's",
    "when'd",
    "when'll",
    "when's",
    "where'd",
    "where'll",
    "where's",
    "who'd",
    "who'll",
    "who's",
    "why'd",
    "why'll",
    "why's",
    "won't",
    "would've",
    "wouldn't",
    "you'd",
    "you'll",
    "you're",
    "you've"
];

stopwords.push("paraview");

module.exports = {
    generateKeywords(mailIds) {
        keywords = [];

        mailIds.forEach(id => {
            let mail = maildata[id];
            let str = mail.subject
                .replace(/[^a-zA-Z\s\\/]/g, "")
                .split(" ");
            str.forEach(x => {
                x = x.toLowerCase();
                if (x.length <= 2) return;
                if (stopwords.includes(x)) return;
                let id = keywords.findIndex(y => {
                    return y.name === x;
                });
                if (id === -1) {
                    keywords.push({ name: x, value: 1 });
                } else {
                    keywords[id].value++;
                }
            });
        });

        keywords.sort((w1, w2) => {
            if (w1.value < w2.value) {
                return 1;
            } else if (w1.value > w2.value) {
                return -1;
            } else {
                return 0;
            }
        });

        return keywords;
    },
};

