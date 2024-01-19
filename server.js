require('dotenv').config({ path: './hidden.env' });

const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const lang = require('./language.json'); 

const { MongoClient } = require('mongodb');
const url = process.env.DB_CONNECTION_STRING;
const client = new MongoClient(url);
async function main() {
    await client.connect();
    console.log('Connected successfully to server');
    return 'done.';
}

main()
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close());

bot.setMyCommands([
    { command: '/start', description: "Змінити мову / Изменить язык" },
    { command: '/profile', description: "Ваш профіль / Ваш профиль" }
]);
bot.onText(/\/start/, (msg, match) => {
    async function IfRegistered(userId) {
        try {
            await client.connect();
            const db = client.db("DateMeBot");
            const Users = db.collection("Users");
            const if_chatted = await Users.find({ TelegramID: `${userId}` }).toArray();
            if (if_chatted == "") {
                await bot.sendMessage(userId, "Добро пожаловать в чат-бот для знакомств NTUDP DateMe! / Вітаємо в чат-боті для знайомств NTUDP DateMe!");
                await bot.sendMessage(userId, "Выбери язык / обери мову 👇", {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "Українська 🇺🇦", callback_data: "ukrainian" }],
                            [{ text: "Русский 🇷🇺", callback_data: "russian" }],
                        ]
                    }
                });

                Users.insertOne(
                    {
                        TelegramID: `${userId}`,
                        Username: `@${msg.from.username}`,
                        Status: "New",
                        Language: "",
                        Age: "",
                        Gender: "",
                        Description: "",
                        Photo: "",
                        Name: "User Userovich",
                        LastActivity: "",
                        LikedBy: [String],
                        VisitedAncets: [String],
                        NoOneLeft: ""
                    }
                );
            }
        }
        catch (err) {
            console.log(err);
        }
        finally {
        }
    }
    IfRegistered(msg.from.id);
});

bot.onText(/(.+)/, (msg, match) => {
    async function text(userId) {
        try {
            await client.connect();
            const db = client.db("DateMeBot");
            const Users = db.collection("Users");
            const current_profile = await Users.findOne({ "TelegramID": `${userId}` });
            if (current_profile.Status !== "CheckingLikes" && current_profile.Status !== "AgeChangingAgain" && current_profile.Status !== "DescriptionChangingAgain" && current_profile.Status !== "AgeChanging" && current_profile.Status !== "GenderChanging" && current_profile.Status !== "DescriptionChanging" && current_profile.Status !== "PhotoChanging" && msg.text == "/start") {
                if (current_profile.Status == "Looking" && !current_profile.NoOneLeft == "True") {
                    
                    let visited_ids = current_profile.VisitedAncets;
                    console.log(visited_ids);
                    Users.updateOne({ TelegramID: `${userId}` }, { $pull: { VisitedAncets: `${visited_ids[visited_ids.length - 1]}` } });                   
                }
                Users.updateOne({ TelegramID: `${userId}` }, { $set: { Status: "Ready" } });
                bot.sendMessage(msg.chat.id, "Выбери язык / обери мову 👇", {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "Українська 🇺🇦", callback_data: "ukrainian" }],
                            [{ text: "Русский 🇷🇺", callback_data: "russian" }],
                        ]
                    }
                });
            }


            else if (current_profile.Status !== "CheckingLikes" && current_profile.Status !== "AgeChangingAgain" && current_profile.Status !== "DescriptionChangingAgain" && current_profile.Status !== "AgeChanging" && current_profile.Status !== "GenderChanging" && current_profile.Status !== "DescriptionChanging" && current_profile.Status !== "PhotoChanging" && msg.text == "/profile") {
                if (current_profile.Status == "Looking" && !current_profile.NoOneLeft == "True") {
                    let visited_ids = current_profile.VisitedAncets;
                    Users.updateOne({ TelegramID: `${userId}` }, { $pull: { VisitedAncets: `${visited_ids[visited_ids.length - 1]}` } });  
                }
                Users.updateOne({ TelegramID: `${userId}` }, { $set: { Status: "Ready" } });
                bot.sendMessage(userId, lang[current_profile.Language].profile_show);
                showProfile(userId);
            } 

            if (current_profile.Status == "NameChanging") {
                CharacterChange(userId, "AgeChanging", msg.text);
            }

            if (current_profile.Status == "AgeChanging") {
                CharacterChange(userId, "GenderChanging", msg.text);
            }


            else if (current_profile.Status == "AgeChangingAgain" && msg.text == lang[current_profile.Language].not_to_change) {
                Users.updateOne({ TelegramID: `${userId}` }, { $set: { Status: "Ready" } });
                showProfile(userId);
            }


            else if (current_profile.Status == "AgeChangingAgain") {
                CharacterChange(userId, "Ready", msg.text);
            }


            else if (current_profile.Status == "DescriptionChanging") {
                CharacterChange(userId, "PhotoChanging", msg.text);
            }


            else if (current_profile.Status == "DescriptionChangingAgain" && msg.text == lang[current_profile.Language].not_to_change) {
                Users.updateOne({ TelegramID: `${userId}` }, { $set: { Status: "Ready" } });
                showProfile(userId);
            }


            else if (current_profile.Status == "DescriptionChangingAgain") {
                CharacterChange(userId, "Ready", msg.text);
            } 


            else if (current_profile.Status == "PhotoChanging" && current_profile.Photo !== "" && msg.text == lang[current_profile.Language].not_to_change) {
                Users.updateOne({ TelegramID: `${userId}` }, { $set: { Status: "Ready" } });
                showProfile(userId);
            }


            else if (current_profile.Status == "PhotoChanging") {
                bot.sendMessage(userId, lang[current_profile.Language].send_photo);
            }


            else if (current_profile.Status == "PhotoChanging" && msg.text == "/start") {
                bot.sendMessage(userId, lang[current_profile.Language].send_photo);
            }


            else if (current_profile.Status == "PhotoChanging" && msg.text == "/profile") {
                bot.sendMessage(userId, lang[current_profile.Language].send_photo);
            }


            else if (current_profile.Status == "Looking" && msg.text == "❤️") {
                let visited_ids = current_profile.VisitedAncets;
                const current_anceta = await Users.findOne({ "TelegramID": `${visited_ids[visited_ids.length - 1]}` });
                let counter = 0;
                for (let i = 0; i < current_anceta.LikedBy.length; i++) {
                    if (current_profile.TelegramID != current_anceta.LikedBy[i]) {
                        counter = counter + 1;
                    }
                }
                for (let i = 0; i < current_anceta.VisitedAncets.length; i++) {
                    if (current_profile.TelegramID == current_anceta.VisitedAncets[i]) {
                        counter = counter - 1;
                    }
                }
                if (counter == current_anceta.LikedBy.length) {
                    Users.updateOne({ TelegramID: `${current_anceta.TelegramID}` }, { $push: { LikedBy: `${userId}` } });
                    showAnceta(userId);
                    //отправка лайка
                    await bot.sendMessage(current_anceta.TelegramID, lang[current_profile.Language].someone_liked_you, {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: lang[current_profile.Language].show_likes, callback_data: "show_likes" }]
                            ]
                        }
                    });
                } else {
                    bot.sendMessage(userId, lang[current_profile.Language].end, {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: lang[current_profile.Language].return, callback_data: "to_profile" }],
                                [{ text: lang[current_profile.Language].search_again, callback_data: "continue_search" }],
                            ]
                        }, caption: `${current_profile.Name} - ${current_profile.Age}\n${current_profile.Description}`
                    });
                }
            }


            else if (current_profile.Status == "Looking" && msg.text == "👎🏼") {
                showAnceta(userId);
            }
            

            else if (current_profile.Status == "Looking" && msg.text == lang[current_profile.Language].return ) {
                Users.updateOne({ TelegramID: `${userId}` }, { $set: { Status: "Ready" } });
                let visited_ids = current_profile.VisitedAncets;
                Users.updateOne({ TelegramID: `${userId}` }, { $pull: { VisitedAncets: `${visited_ids[visited_ids.length - 1]}` } });  
                showProfile(userId);
            }

            else if (current_profile.Status == "CheckingLikes" && msg.text == "❤️") {
                    let all_likes = current_profile.LikedBy;
                    const url = `tg://user?id=${current_profile.TelegramID}`;
                    let message = "";
                    if (current_profile.Language == "uk") {
                        message = `Отримано взаємний лайк! Перейдіть за посиланням [Click me](${url}) та розпочніть бесіду!`;
                    }
                    else {
                        message = `Получем взаимный лайк! Перейдите по ссылке [Click me](${url}) И начните общение!`;
                    }
                    await bot.sendMessage(all_likes[all_likes.length - 1], message, { parse_mode: 'Markdown' });
                    await Users.updateOne({ TelegramID: `${userId}` }, { $pull: { LikedBy: `${all_likes[all_likes.length - 1]}` } });
                    check_likes(userId);
            }

            else if (current_profile.Status == "CheckingLikes" && msg.text == "👎🏼") {
                await check_likes(userId);
            }

        } catch (err) {
            console.log(err);
        }
    }
    text(msg.chat.id);
});

bot.on("photo", (msg, match) => {
    async function text(userId) {
        try {
            await client.connect();
            const db = client.db("DateMeBot");
            const Users = db.collection("Users");
            const current_profile = await Users.findOne({ "TelegramID": `${userId}` });
            if (current_profile.Status !== "AgeChangingAgain" && current_profile.Status !== "DescriptionChangingAgain" && current_profile.Status !== "AgeChanging" && current_profile.Status !== "GenderChanging" && current_profile.Status !== "DescriptionChanging" && current_profile.Status !== "PhotoChanging" && msg.text == "/start") {
                If_registered(msg.from.id);
                await bot.sendMessage(msg.chat.id, "Выбери язык / обери мову 👇", {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "Українська 🇺🇦", callback_data: "ukrainian" }],
                            [{ text: "Русский 🇷🇺", callback_data: "russian" }],
                        ]
                    }
                });
            }
            else if (current_profile.Status !== "AgeChangingAgain" && current_profile.Status !== "DescriptionChangingAgain" && current_profile.Status !== "AgeChanging" && current_profile.Status !== "GenderChanging" && current_profile.Status !== "DescriptionChanging" && current_profile.Status !== "PhotoChanging" && msg.text == "/profile") {
                bot.sendMessage(userId, lang[current_profile.Language].profile_show);
                await showProfile(userId);
            }
            if (current_profile.Status == "PhotoChanging") {
                CharacterChange(userId, "Ready", msg.photo[2].file_id);
            }
        } catch (err) {
            console.log(err);
        } finally {
        }
    }
    text(msg.chat.id);
});

bot.on('callback_query', msg => {
    const userId = msg.message.chat.id;
    const data = msg.data;
    async function callback(userId, data) {
        try {
            await client.connect();
            const db = client.db("DateMeBot");
            const Users = db.collection("Users");
            const current_profile = await Users.findOne({ "TelegramID": `${userId}` });
                switch (data) {
                    case "russian":
                        if (current_profile.Status !== "AgeChanging" && current_profile.Status !== "GenderChanging" && current_profile.Status !== "DescriptionChanging" && current_profile.Status !== "PhotoChanging") {
                            await Users.updateOne({ TelegramID: `${userId}` }, { $set: { Language: "ru" } });
                            if_change_name(userId);
                        }
                        break;

                    case "ukrainian":
                        if (current_profile.Status !== "AgeChanging" && current_profile.Status !== "GenderChanging" && current_profile.Status !== "DescriptionChanging" && current_profile.Status !== "PhotoChanging") {
                            await Users.updateOne({ TelegramID: `${userId}` }, { $set: { Language: "uk" } });
                            if_change_name(userId);
                        }
                        break;

                    case "confirm_name":
                        if (current_profile.Status == "NameChanging") {
                            changingStatus(userId, "AgeChanging")
                            await bot.sendMessage(userId, lang[current_profile.Language].age_enter);
                        }
                        break;

                    case "change_name":
                        if (current_profile.Status == "NameChanging") {
                            await bot.sendMessage(userId, lang[current_profile.Language].name_enter);
                        }
                        break;

                    case "male":
                        if (current_profile.Status == "GenderChanging") { 
                            bot.sendMessage(userId, lang[current_profile.Language].gender_caution, {
                                reply_markup: {
                                    inline_keyboard: [
                                        [{ text: lang[current_profile.Language].confirm_gender, callback_data: "confirm_male" }],
                                        [{ text: lang[current_profile.Language].choose_female, callback_data: "female" }],
                                    ]
                                }
                            });
                        }
                        break;

                    case "confirm_male":
                        if (current_profile.Status == "GenderChanging") {
                            await CharacterChange(userId, "DescriptionChanging", "male");
                        }
                        break;

                    case "female":
                        if (current_profile.Status == "GenderChanging") {
                            bot.sendMessage(userId, lang[current_profile.Language].gender_caution, {
                                reply_markup: {
                                    inline_keyboard: [
                                        [{ text: lang[current_profile.Language].confirm_gender, callback_data: "confirm_female" }],
                                        [{ text: lang[current_profile.Language].choose_male, callback_data: "male" }],
                                    ]
                                }
                            });
                        }
                        break;

                    case "confirm_female":
                        if (current_profile.Status == "GenderChanging") {
                           await CharacterChange(userId, "DescriptionChanging", "female");;
                        }
                        break;

                    case "begin_search":
                        if (current_profile.Status == "Ready") {
                            bot.sendMessage(userId, "✨🔍");
                            showAnceta(userId);
                        }
                        break;

                    case "continue_search":
                        if (current_profile.Status == "Looking") {
                            bot.sendMessage(userId, "✨🔍");
                            showAnceta(userId);
                        }
                        break;

                    case "change_profile":
                        if (current_profile.Status == "Ready") {
                            bot.sendMessage(userId, lang[current_profile.Language].what_to_change, {
                                reply_markup: {
                                    inline_keyboard: [
                                        [{ text: lang[current_profile.Language].age, callback_data: "change_age" }],
                                        [{ text: lang[current_profile.Language].description, callback_data: "change_description" }],
                                        [{ text: lang[current_profile.Language].photo, callback_data: "change_photo" }],
                                    ]
                                }
                            });
                        }
                        break;

                    case "change_age":
                        if (current_profile.Status == "Ready") {
                            changingStatus(userId, "AgeChangingAgain");
                            bot.sendMessage(userId, lang[current_profile.Language].age_enter, {
                                reply_markup: {
                                    resize_keyboard: true,
                                    keyboard: [
                                        [{ text: lang[current_profile.Language].not_to_change }]
                                    ],
                                }
                            });
                        }
                        break;

                    case "change_description":
                        if (current_profile.Status == "Ready") {
                            changingStatus(userId, "DescriptionChangingAgain");
                            bot.sendMessage(userId, lang[current_profile.Language].description_enter, {
                                reply_markup: {
                                    resize_keyboard: true,
                                    keyboard: [
                                        [{ text: lang[current_profile.Language].not_to_change }]
                                    ],
                                }
                            });
                        }
                        break;

                    case "change_photo":
                        if (current_profile.Status == "Ready") {
                            changingStatus(userId, "PhotoChanging");
                            bot.sendMessage(userId, lang[current_profile.Language].photo_enter, {
                                reply_markup: {
                                    resize_keyboard: true,
                                    keyboard: [
                                        [{ text: lang[current_profile.Language].not_to_change }]
                                    ],
                                }
                            });
                        }
                        break;

                    case "show_likes":
                        if (current_profile.Status == "Ready" || current_profile.Status == "Looking") {
                            check_likes(userId);
                            break;
                        }            

                    case "to_profile":
                        if (current_profile.Status == "Looking" || current_profile.Status == "Ready") {
                            Users.updateOne({ TelegramID: `${userId}` }, { $set: { Status: "Ready" } });
                            await bot.sendMessage(userId, lang[current_profile.Language].profile_show);
                            showProfile(userId);
                        }
                        break;
            }
        } catch (err) {
            console.log(err);
        } finally {
        }
    }
    callback(userId, data);
    bot.answerCallbackQuery(msg.id);
});

async function check_likes(userId) {
    try {
        await client.connect();
        const db = client.db("DateMeBot");
        const Users = db.collection("Users");
        const current_profile = await Users.findOne({ "TelegramID": `${userId}` });
        let all_likes = current_profile.LikedBy;
        if (all_likes.length == 0) {
            Users.updateOne({ TelegramID: `${userId}` }, { $set: { Status: "Looking" } });
            await bot.sendMessage(userId, lang[current_profile.Language].continue_searching, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: lang[current_profile.Language].yes, callback_data: "continue_search" }],
                        [{ text: lang[current_profile.Language].return, callback_data: "to_profile" }]
                    ]
                }
            });
        } else {
            Users.updateOne({ TelegramID: `${userId}` }, { $set: { Status: "CheckingLikes" } });
            Users.updateOne({ TelegramID: `${userId}` }, { $push: { VisitedAncets: `${all_likes[all_likes.length - 1]}` } });
            const current_anceta = await Users.findOne({ TelegramID: `${all_likes[all_likes.length - 1]}` });
            bot.sendPhoto(userId, current_anceta.Photo, {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        [{ text: '❤️' }, { text: "👎🏼" }]
                    ],
                }, caption: `${current_anceta.Name} - ${current_anceta.Age}\n${current_anceta.Description}`
            });
        }
    }
    catch (err) {
        console.log(err);
    }
}

async function if_change_name(userId) {
    try {
        await client.connect();
        const db = client.db("DateMeBot");
        const Users = db.collection("Users");
        const current_profile = await Users.findOne({ "TelegramID": `${userId}` });
        if (current_profile.Status == "New") {
            await bot.sendMessage(userId, lang[current_profile.Language].name_enter);
            await changingStatus(userId, "NameChanging");
        } else if (current_profile.Status == "Ready" ||  current_profile.NoOneLeft == "True") {
            await bot.sendMessage(userId, lang[current_profile.Language].profile_show);
            await showProfile(userId); 
        }  
    }
    catch (err) {
        console.log(err);
    }
}

async function changingStatus(userId, next_status) {
    try {
        await client.connect();
        const db = client.db("DateMeBot");
        const Users = db.collection("Users");
        Users.updateOne({ TelegramID: `${userId}` },
            {
                $set: {
                    Status: `${next_status}`
                }
            }
        );
    } catch (err) {
        console.log(err);
    } finally {
    }
}

function ValidName(input) {
    const pattern = /^[А-Яа-яA-Za-zІіЇїЄєҐґ]+\s[А-Яа-яA-Za-zІіЇїЄєҐґ]+$/
    return pattern.test(input);
}

async function CharacterChange(userId, next_status, value) {
    try {
        await client.connect();
        const db = client.db("DateMeBot");
        const Users = db.collection("Users");
        const current_profile = await Users.findOne({ "TelegramID": `${userId}` });
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        var yyyy = today.getFullYear();
        today = yyyy + mm + dd;
        var filter = { TelegramID: `${userId}` };
        var new_name = { $set: { Name: `${value}`, LastActivity: `${today}` } };
        var new_age = { $set: { Status: `${next_status}`, Age: `${value}`, LastActivity: `${today}` } };
        var new_gender = { $set: { Status: `${next_status}`, Gender: `${value}`, LastActivity: `${today}` } };
        var new_description = { $set: { Status: `${next_status}`, Description: `${value}`, LastActivity: `${today}` } };
        var new_photo = { $set: { Status: `${next_status}`, Photo: `${value}`, LastActivity: `${today}` } };

        if (current_profile.Status == "NameChanging") {
            if (!ValidName(value)) {
                await bot.sendMessage(userId, lang[current_profile.Language].name_retry);
            }
            else {
                bot.sendMessage(userId, lang[current_profile.Language].name_caution, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: lang[current_profile.Language].confirm, callback_data: "confirm_name" }],
                            [{ text: lang[current_profile.Language].change_profile, callback_data: "change_name" }],
                        ]
                    }
                });
                Users.updateOne(filter, new_name);
            }
        }

        if (current_profile.Status == "AgeChanging") {
            if (isNaN(value)) {
                bot.sendMessage(userId, lang[current_profile.Language].age_retry);
            }
            else if (Number(value) > 15 && Number(value) < 24) {
                Users.updateOne(filter, new_age);
                bot.sendMessage(userId, lang[current_profile.Language].gender_enter, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: lang[current_profile.Language].male, callback_data: "male" }],
                            [{ text: lang[current_profile.Language].female, callback_data: "female" }],
                        ]
                    }
                });
            } else {
                await bot.sendMessage(userId, lang[current_profile.Language].age_retry);
            }
        }


        else if (current_profile.Status == "AgeChangingAgain") {
            if (isNaN(value)) {
                await bot.sendMessage(userId, lang[current_profile.Language].age_retry);
            }
            else if (parseInt(value) > 24 || parseInt(value) < 16) {
                await bot.sendMessage(userId, lang[current_profile.Language].age_retry);
            }
            else if (parseInt(value) > 15 && parseInt(value) < 25) {
                Users.updateOne(filter, new_age);
                await bot.sendMessage(userId, lang[current_profile.Language].profile_show);
                await showProfile(userId); 
            }
        }


        else if (current_profile.Status == "GenderChanging") {
            Users.updateOne(filter, new_gender);
            await bot.sendMessage(userId, lang[current_profile.Language].description_enter);
        }


        else if (current_profile.Status == "DescriptionChanging") {           
            if (value == "/start" || value == "/profile") {
                await bot.sendMessage(userId, lang[current_profile.Language].retry);
            }
            else if (value.length > 500) {
                await bot.sendMessage(userId, lang[current_profile.Language].description_retry);
            }
            else {
                Users.updateOne(filter, new_description);
                await bot.sendMessage(userId, lang[current_profile.Language].photo_enter); 
            }
        }


        else if (current_profile.Status == "DescriptionChangingAgain") {
            if (value == "/start" || value == "/profile") {
                await bot.sendMessage(userId, lang[current_profile.Language].retry);
            }
            else if (value.length > 500) {
                await bot.sendMessage(userId, lang[current_profile.Language].description_retry);
            } else {
                Users.updateOne(filter, new_description);
                await bot.sendMessage(userId, lang[current_profile.Language].profile_show);
                await showProfile(userId);
            }
        }


        else if (current_profile.Status == "PhotoChanging") {
            Users.updateOne(filter, new_photo);
            await bot.sendMessage(userId, lang[current_profile.Language].profile_show);
            await showProfile(userId);           
        }


    } catch (err) {
        console.log(err);
    } 
}

async function showProfile(userId) {
    try {
        await client.connect();
        const db = client.db("DateMeBot");
        const Users = db.collection("Users");
        const current_profile = await Users.findOne({ "TelegramID": `${userId}` });
        await bot.sendPhoto(userId, current_profile.Photo, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: lang[current_profile.Language].change_profile, callback_data: "change_profile" }],
                    [{ text: lang[current_profile.Language].begin_search, callback_data: "begin_search" }],
                ]
            }, caption: `${current_profile.Name} - ${current_profile.Age}\n${current_profile.Description}`
        });
    }
    catch (err) {
        console.log(err);
    }
}

async function showAnceta(userId) {
    try {
        await client.connect();
        const db = client.db("DateMeBot");
        const Users = db.collection("Users");
        var filter = { TelegramID: `${userId}` };
        var newStatus = { $set: { Status: "Looking" } };
        Users.updateOne(filter, newStatus);
        const current_profile = await Users.findOne({ "TelegramID": `${userId}` });
        let visited_ids = current_profile.VisitedAncets; 
        let all_ancets;
        if (current_profile.Gender == "male") {
            all_ancets = await Users.find({ "Gender": "female", "Status": "Looking" }, { "sort": [['LastActivity', -1]] }).toArray();
        } else {
            all_ancets = await Users.find({ "Gender": "male", "Status": "Looking" }, { "sort": [['LastActivity', -1]] }).toArray();    
        }
        let anceta;
        let counter = 0;         
        let there = 0;
        for (let i = 0; i < all_ancets.length; i++) {
            for (let j = 0; j < visited_ids.length; j++) {
                if (all_ancets[i].TelegramID == visited_ids[j]) {
                    break;
                } else {
                    counter++;
                }
            }
            if (counter == visited_ids.length) {
                anceta = all_ancets[i];
                bot.sendPhoto(userId, anceta.Photo, {
                    reply_markup: {
                        resize_keyboard: true,
                        keyboard: [
                            [{ text: '❤️' }, { text: "👎🏼" }],
                            [{ text: lang[current_profile.Language].return }]
                        ],
                    }, caption: `${anceta.Name} - ${anceta.Age}\n${anceta.Description}`
                });
                Users.updateOne(filter, { $set: { NoOneLeft: "False" } });
                Users.updateOne(filter, { $push: { VisitedAncets: `${anceta.TelegramID}` } });
                there = 1;
                break;            
            } else {
                counter = 0;
            }
        }       
        if (there == 0) { 
            bot.sendMessage(userId, lang[current_profile.Language].end, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: lang[current_profile.Language].return, callback_data: "to_profile" }],
                        [{ text: lang[current_profile.Language].search_again, callback_data: "continue_search" }],
                    ]
                }, caption: `${current_profile.Name} - ${current_profile.Age}\n${current_profile.Description}`
            });
            Users.updateOne({ TelegramID: `${userId}` }, { $set: { NoOneLeft: "True" } });
        }
    }
    catch (err) {
        console.log(err);
    }
}

var http = require('http');
var port = process.env.PORT;
http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Hello ${process.env.DIS}\n`);
}).listen(port);
