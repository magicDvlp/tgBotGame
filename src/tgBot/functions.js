const {
  startGameMarkup,
  startGameAgainMarkup,
  numberMarkup,
} = require('./buttonMarkup');

async function onStart(msg, botInstance) {
  const {
    chat,
    from: {
      first_name,
    }
  } = msg;
  try {
    const game = await strapi.entityService.findMany('api::game.game', {
      filters: {
        'chatId': {
          '$eq' : chat.id,
        }
      }
    });
    if (!game || !game.length) {
      await strapi.entityService.create('api::game.game', {
        data: {
          chatId: chat.id.toString(),
        }
      })
    }
    await botInstance.sendSticker(chat.id, `https://selcdn.tlgrm.app/stickers/4dd/300/4dd300fd-0a89-3f3d-ac53-8ec93976495e/192/1.webp`);
    return botInstance.sendMessage(chat.id, `Привет ${first_name}. Готов к игре?`, {
      reply_markup: startGameMarkup
    });
  } catch (error) {
    console.log(error, 'game found error');
    return botInstance.sendMessage(chat.id, `Ой, ошибка!`);
  }
}

const startGame = async (msg, botInstance) => {
  const {
    message: {chat, message_id},
    from: {
      first_name,
    }
  } = msg;
  try {
    const game = await strapi.entityService.findMany('api::game.game', {
      filters: {
        'chatId': {
          '$eq' : chat.id,
        }
      }
    });
    await strapi.entityService.update('api::game.game', game[0].id, {
      data: {
        currentNumber: Math.floor(Math.random() * 10),
      }
    });
    await botInstance.editMessageReplyMarkup(null, {
      message_id, 
      chat_id: chat.id,
    });
    return botInstance.sendMessage(chat.id, `${first_name}, угадывай`, {
      reply_markup: numberMarkup,
    });
  } catch(error) {
    console.log(error);
  }
};

const onAnswer = async (msg, botInstance) => {
  const {
    message: {chat, message_id},
  } = msg;
  try {
    const game = await strapi.entityService.findMany('api::game.game', {
      filters: {
        'chatId': {
          '$eq' : chat.id,
        }
      }
    });
    const {
      id,
      currentNumber,
      win,
      losing,
    } = game[0];
    if (currentNumber == msg.data) {
      await strapi.entityService.update('api::game.game', game[0].id, {
        data: {
          win: +win + 1,
        }
      });
      await botInstance.sendSticker(chat.id, `https://tlgrm.ru/_/stickers/4dd/300/4dd300fd-0a89-3f3d-ac53-8ec93976495e/192/13.webp`);
      await botInstance.editMessageReplyMarkup(null, {
        message_id, 
        chat_id: chat.id,
      });
      return botInstance.sendMessage(chat.id, 'Отлично! Ты угадал!', {
        reply_markup: startGameAgainMarkup,
      });
    } else {
      await strapi.entityService.update('api::game.game', game[0].id, {
        data: {
          losing: +losing + 1,
        }
      });
      await botInstance.sendSticker(chat.id, `https://tlgrm.ru/_/stickers/4dd/300/4dd300fd-0a89-3f3d-ac53-8ec93976495e/192/24.webp`);
      await botInstance.editMessageReplyMarkup(null, {
        message_id, 
        chat_id: chat.id,
      });
      return botInstance.sendMessage(chat.id, `Упс! Не повезло. Загаданное число - ${currentNumber}`, {
        reply_markup: startGameAgainMarkup,
      });
    }
  } catch(error) {
    console.log(error);
  }

}

const showInfo = async (msg, botInstance) => {
  const {
    chat,
  } = msg;
  try {
    const game = await strapi.entityService.findMany('api::game.game', {
      filters: {
        'chatId': {
          '$eq' : chat.id,
        }
      }
    });
    const {
      id,
      win,
      losing,
    } = game[0];
    return botInstance.sendMessage(chat.id, `Количество выигрышей - ${win} \n Количество проигрышей - ${losing}`, {
      reply_markup: startGameMarkup
    });
  } catch (error) {
    console.log(error, 'game found error');
    return botInstance.sendMessage(chat.id, `Ой, ошибка!`);
  }
}

module.exports = {
  onStart,
  startGame,
  onAnswer,
  showInfo
}