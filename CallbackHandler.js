
bot.on('callback_query', msg => {
    const chatId = msg.message.chat.id;
    const data = msg.data;

    switch (data) {
        case "russian":
            bot.sendMessage(chatId, "Выбран русский язык ????");
            language = 0;
            break;
        case "ukrainian":
            bot.sendMessage(chatId, "Обрано українську мову ????");
            language = 1;
            break;
        case "begin_search":

            break;
        case "change_profile":
            bot.sendMessage(chatId, "Що саме бажаєте змінити?", {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "Зображення/відео", callback_data: "change_photo" }],
                        [{ text: "Опис профілю", callback_data: "change_description" }],
                        [{ text: "Стать", callback_data: "change_gender" }],
                    ]
                }
            });
            break;
        case "change_description":
            bot.sendMessage(chatId, "Введіть опис вашого профілю");
            status = "description_changing";
            break;
        case "change_photo":
            bot.sendMessage(chatId, "Відправте фото ");
            status = "photo_changing";
            break;
        case "change_gender":
            bot.sendMessage(chatId, "Оберіть стать:");
            status = "gender_changing";
            break;
    }
    bot.answerCallbackQuery(msg.id);
});