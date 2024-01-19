var bot;
module.exports = class CommandsHandler {
    constructor(_bot) {
        bot = _bot;
    }
}
bot.onText(/\/start/, (msg, match) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, "������ ���� / ����� ���� ??", {
        reply_markup: {
            inline_keyboard: [
                [{ text: "????", callback_data: "ukrainian" }],
                [{ text: "????", callback_data: "russian" }],
            ]
        }
    });
});
bot.onText(/\/profile/, (msg, match) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "��� �� ������� ��� �������:", {
        reply_markup: {
            inline_keyboard: [
                [{ text: "������", callback_data: "change_profile" }],
                [{ text: "������ ��������", callback_data: "begin_search" }],
            ]
        }
    });
});
bot.onText(/(.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    if (status == "description_changing") {
        //change description
        bot.sendMessage(chatId, "���� ������!");
    } else if (status == "photo_changing") {
        //change photo
        bot.sendMessage(chatId, "���� ������!");
    } else if (status == "gender_changing") {
        //change gender
        bot.sendMessage(chatId, "����� ������!");
    }
});