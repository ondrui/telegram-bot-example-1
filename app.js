import express from 'express';
import 'dotenv/config';
import { PORT } from './config.js';
import { Telegraf, session } from 'telegraf';
import { getMainMenu, yesNoKeyboard } from './keyboards.js';
import { getMyTasks, addTask, deleteTask } from './db.js';

const app = express();

const token = process.env.TOKEN;
if (token === undefined) {
  throw new Error('TOKEN must be provided!');
}

const bot = new Telegraf(token);

bot.use(session());

bot.start((ctx) => {
  ctx.replyWithHTML(
    'Приветстую в <b>TaskManagerBot</b>\n\n' +
      'Чтобы быстро добавить задачу, просто напиши ее и отправь боту',
    getMainMenu()
  );
});

bot.hears('Мои задачи', async (ctx) => {
  const tasks = await getMyTasks();
  let result = '';

  for (let i = 0; i < tasks.length; i++) {
    result += `[${i + 1}] ${tasks[i]}\n`;
  }

  ctx.replyWithHTML('<b>Список ваших задач:</b>\n\n' + `${result}`);
});

bot.hears('Удалить задачу', (ctx) => {
  ctx.replyWithHTML(
    'Введите фразу <i>"удалить `порядковый номер задачи`"</i>, чтобы удалить сообщение, ' +
      ' например, <b>"удалить 3"</b>'
  );
});

bot.hears(/^удалить\s(\d+)$/, (ctx) => {
  const id = +(+/\d+/.exec(ctx.message.text)) - 1;
  deleteTask(id);
  ctx.reply('Ваша задача успешно удалена');
});

bot.hears('Смотивируй меня', (ctx) => {
  ctx.replyWithPhoto(
    'https://img2.goodfon.ru/wallpaper/nbig/7/ec/justdoit-dzhastduit-motivaciya.jpg',
    {
      caption: 'Не вздумай сдаваться!',
    }
  );
});

bot.command('time', (ctx) => {
  ctx.reply(String(new Date()));
});

bot.on('text', (ctx) => {
  ctx.session = { taskText: ctx.message.text };

  ctx.replyWithHTML(
    `Вы действительно хотите добавить задачу:\n\n` +
      `<i>${ctx.message.text}</i>`,
    yesNoKeyboard()
  );
});

bot.action(['yes', 'no'], (ctx) => {
  if (ctx.callbackQuery.data === 'yes') {
    addTask(ctx.session.taskText);
    ctx.editMessageText('Ваша задача успешно добавлена');
  } else {
    ctx.deleteMessage();
  }
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

app.listen(PORT, () => console.log(`My server is running on port ${PORT}`));
