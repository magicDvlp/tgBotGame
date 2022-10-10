const TelegramBot = require('node-telegram-bot-api');
const {
  onStart,
  startGame,
  onAnswer,
  showInfo,
} = require('./functions');

async function initTgBot() {
  const token = process.env.TG_BOT_TOKEN;
  const bot = new TelegramBot(token, {polling: true});
  bot.setMyCommands([
    // {command: '/stop', description: 'Остановить бота'},
    // {command: '/game_start', description: 'Начать игру'},
    {command: '/info', description: 'Посмотреть статистику'},
  ]);

  bot.on('message', async msg => {
    const {text} = msg;
    if (text == '/start') {
      return await onStart(msg, bot);
    }
    if (text == '/info') {
      return await showInfo(msg, bot);
    }
  });
  bot.on('callback_query', async msg => {
    const {
      data, 
      message
    } = msg;
    if (data == '/game_start') {
      // await bot.editMessageReplyMarkup(message.chat.id, message);
      return await startGame(msg, bot);
    }
    return onAnswer(msg, bot);
  });
}
module.exports = {
  initTgBot,
};