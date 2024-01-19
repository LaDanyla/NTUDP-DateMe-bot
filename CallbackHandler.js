
bot.on('callback_query', msg => {
    const chatId = msg.message.chat.id;
    const data = msg.data;

    switch (data) {
        case "russian":
            bot.sendMessage(chatId, "������ ������� ���� ????");
            language = 0;
            break;
        case "ukrainian":
            bot.sendMessage(chatId, "������ ��������� ���� ????");
            language = 1;
            break;
        case "begin_search":

            break;
        case "change_profile":
            bot.sendMessage(chatId, "�� ���� ������ ������?", {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "����������/����", callback_data: "change_photo" }],
                        [{ text: "���� �������", callback_data: "change_description" }],
                        [{ text: "�����", callback_data: "change_gender" }],
                    ]
                }
            });
            break;
        case "change_description":
            bot.sendMessage(chatId, "������ ���� ������ �������");
            status = "description_changing";
            break;
        case "change_photo":
            bot.sendMessage(chatId, "³������� ���� ");
            status = "photo_changing";
            break;
        case "change_gender":
            bot.sendMessage(chatId, "������ �����:");
            status = "gender_changing";
            break;
    }
    bot.answerCallbackQuery(msg.id);
});