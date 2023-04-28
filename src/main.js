import { Telegraf, session } from 'telegraf';
import { message } from 'telegraf/filters';
import { code } from 'telegraf/format';
import converter from './Converter.js';
import config from 'config';
import openai from './openai.js';

const INITIAL_SESSION = {
  messages: [],
};

const bot = new Telegraf(config.get('TOKEN'));
// t.me/castetus_gpt_bot

bot.use(session());

bot.command('start', async (ctx) => {
  ctx.session = INITIAL_SESSION;
  await ctx.reply('Привет, я GPT-bot. Мне можно отправлять текстовые и голосовые сообщения. НАчать: команда "new".');
});

bot.command('new', async (ctx) => {
  ctx.session = INITIAL_SESSION;
  await ctx.reply('Ожидаю текстового или голосового сообщения');
});

const chatReply = async (ctx, text) => {
  if (!ctx.session || ! ctx.session.length) {
    ctx.session = INITIAL_SESSION;
  }
  await ctx.reply(code(`Ваш запрос: ${text}.`));
  ctx.session.messages.push({role: 'user', content: text});

  const response = await openai.chat(ctx.session.messages);

  ctx.session.messages.push({
    role: 'assistant',
    content: response.content,
  });

  await ctx.reply(response.content);
};

bot.on(message('text'), async (ctx) => {
  await chatReply(ctx, ctx.message.text);
});

bot.on(message('voice'), async (ctx) => {
  try {
    await ctx.reply(code('Распознаю сообщение...'));
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
    const userId = ctx.message.from.id;
    const oggPath = await converter.create(link.href, userId);
    const mp3Path = await converter.convertToMP3(oggPath, userId);
    const text = await openai.transcription(mp3Path);

    await chatReply(ctx, text);
  } catch (error) {
    console.log(error);
  }
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));