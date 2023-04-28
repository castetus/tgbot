import { Configuration, OpenAIApi } from "openai";
import config from 'config';
import { createReadStream } from 'fs';

class OpenAI {
  constructor(apiKey) {
    const configuration = new Configuration({
      apiKey
    });
    this.openai = new OpenAIApi(configuration);
  }
  async chat(messages) {
    try {
      const response = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages,
      });
      return response.data.choices[0].message;
    } catch (error) {
      console.log(error);
    }
  }

  async transcription(path) {
    try {
      const response = await this.openai.createTranscription(
        createReadStream(path),
        'whisper-1',
      );
      if (response.error) {
        return response.description;
      }
      return response.data.text;
    } catch (error) {
      console.log(error);
    }
  }
}

export default new OpenAI(config.get('OPEN_AI_KEY'));
