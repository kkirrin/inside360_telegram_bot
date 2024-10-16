import { Injectable, OnModuleInit } from '@nestjs/common';
import TelegramBot = require('node-telegram-bot-api');
import { PrismaService } from 'src/prisma.service';
import { Prisma, Users } from '@prisma/client';


import { commands } from './commands';
import { contacts } from './data';


@Injectable()
export class BotService implements OnModuleInit {
  private bot: TelegramBot;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const bot = new TelegramBot(process.env.BOT_API_TOKEN, {
      polling: {
        interval: 1000,
        autoStart: true,
      },
    });

    const webAppUrl = 'https://inside360.ru'

    


    await this.botCommands(bot, commands);
    await this.botMessage(bot);
    await this.botDeleteMessages(bot);
  }

  // метод класса
  async botMessage(options) {
    this.bot = options

    const keyboard = [[
      { text: '⭐️ Информация о компании', callback_data: 'info' },
      { text: '⭐️ Услуги компании', callback_data: 'services' },
        ],
      [
        { text: 'Перейти на наш сайт', callback_data: 'inside360'},
      ],
      [
        { text: '⭐️ Кейсы', callback_data: 'cases' },
        { text: '⭐️ Наши контакты', callback_data: 'contact' },
      ],
      [
        { text: '❌ Закрыть меню', callback_data: 'close' },
      ],
  ]

    // Обработка команды /start
    try {
        this.bot.on('text', async (msg) => {
          const chatId = msg.chat.id;
          const firstName = msg.from.first_name;
          if(msg.text == '/start') {
  
            const msgWait= await this.bot.sendMessage(chatId, 'Тебе тут не рады...');
  
            setTimeout( async () => {
              await this.bot.deleteMessage(msgWait.chat.id, msgWait.message_id);  
              await this.bot.sendMessage(chatId, 'шучу');          
            },3000);

            await this.bot.sendMessage(msg.chat.id, `Вы запустили бота! 👋🏻`);

            if(msg.text.length > 6) {

              const refID = msg.text.slice(7);

              await this.bot.sendMessage(msg.chat.id, `Вы зашли по ссылке пользователя с ID ${refID}`);

          }

            setTimeout( async () => {
              await this.bot.sendMessage(chatId, `Приветствую тебя, ${firstName}! Рады приветствовать вас! 🤝 Я бот от Inside360, экспертов в digital-маркетинге.  Хотите узнать о наших услугах, почитать кейсы или задать вопрос?` );
            }, 4000)
          
          }
          else if(msg.text == '/ref') {
            await this.bot.sendMessage(chatId, `${process.env.URL_TO_BOT}?start=${msg.from.id}`);         
          }
          else if(msg.text == '/help') {
            await this.bot.sendMessage(chatId, `Раздел помощи HTML\n\n<b>Жирный Текст</b>\n<i>Текст Курсивом</i>\n<code>Текст с Копированием</code>\n<s>Перечеркнутый текст</s>\n<u>Подчеркнутый текст</u>\n<pre language='c++'>код на c++</pre>\n<a href='t.me'>Гиперссылка</a>`, {

              parse_mode: "HTML"
      
          })
        }
        else if (msg.text === '/menu') {
          const chatId = msg.chat.id;
        
          await this.bot.sendMessage(chatId, 'Меню бота', {
            reply_markup: {
              inline_keyboard: keyboard
            },
          });
        } else if(msg.text == '❌ Закрыть меню') {

          await this.bot.sendMessage(msg.chat.id, 'Меню закрыто', {
      
              reply_markup: {
      
                  remove_keyboard: false
      
              }
          })
      }

        })
        
      } catch(error) {
        console.log(error);
      }

    // Обработка inline кнопок
    this.bot.on('callback_query', async (query) => {
      const chatId = query.message.chat.id;
      const data = query.data;
      const webAppUrl = 'https://inside360.ru'
    
      if(data == 'info') {

        await this.bot.sendMessage(chatId, 'Вы выбрали Инфо', {
           reply_markup: {
                remove_keyboard: true
            }

        })

      } else if (data == 'services') {

          await this.bot.sendMessage(chatId, 'Вы выбрали Услуги', {
             reply_markup: {

                remove_keyboard: true
    
            }
          })
          
      } else if (data == 'cases') {
        
          await this.bot.sendMessage(chatId, 'Вы выбрали Кейсы', {
             reply_markup: {

                remove_keyboard: true
    
            }
          })
          
      } else if (data == 'inside360') {
          await this.bot.sendMessage(chatId, 'Переход на наш сайт: ', {
            reply_markup: {
              inline_keyboard: [
                [{text: webAppUrl, web_app: { url: webAppUrl}}]
              ]
            }
          })
      }
      
      else if (data == 'contact') {
        
        await this.bot.sendMessage(chatId, 'Вы выбрали контакты')
        await this.bot.sendMessage(chatId, `Наши контакты: ${contacts}`)
          
      } else if (data === 'close') {
        await this.bot.answerCallbackQuery(query.id, {
          text: 'Меню закрыто!',
          show_alert: false
        });
        // await this.bot.deleteMessage(chatId, 1);
      }     
    });
    

    // Обработка ошибок
    this.bot.on("polling_error", (error) => console.log(error));

  }

  async botCommands(options, commands) {
    this.bot = options

    this.bot.setMyCommands(commands)
  }

  async botDeleteMessages(options) {
    this.bot = options
  
    this.bot.onText(/\/clear/, async (msg) => {
      const chatId = msg.chat.id;
      const messageId = msg.message_id; 
  
      try {
        for (let i = messageId; i > 0; i--) {
          await this.bot.deleteMessage(chatId, i)
            .catch(err => {
              console.error('Ошибка при удалении сообщения:', err);
            });
          }
          // await this.bot.sendMessage(chatId, 'Чат очищен!');
      } catch (error) {
        console.error('Ошибка при очистке чата:', error);
      }
    });
  }
  
}