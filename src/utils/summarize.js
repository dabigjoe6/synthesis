const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const RATE_LIMIT_PER_MINUTE = 20;
const DEFAULT_DELAY_IN_SECOND = 60 / RATE_LIMIT_PER_MINUTE;

// TODO: Convert to class
export const summarize = async (text) => {
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `${text}\n\nTl;dr`,
        temperature: 0.7,
        max_tokens: 60,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 1,
    });

    return response.data.choices[0].text;
};

// Delay the request to avoid rate limit
export const summarizeDebounced = async (text) => {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            const summary = await summarize(text);
            resolve(summary);
        }, DEFAULT_DELAY_IN_SECOND * 1000);
    });
}


}