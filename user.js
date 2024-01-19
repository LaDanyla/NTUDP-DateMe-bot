const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = {
    TelegramID: {
        type: String,
    },
    Status: {
        type: String,
    },
    Name: {
        type: String,
    },
    Age: {
        type: Number,
    },
    Description: {
        type: String,
    },
    Photo: {

    },
    LastAction: {
        type: number,
    } };
/*const UserModel = new Schema({
    TelegramID: {
        type: String,
    },
    Status: {
        type: String,
    },
    Name: {
        type: String,
    },
    Age: {
        type: Number,
    },
    Description: {
        type: String,
    },
    Photo: {
        
    },
    LastAction: {
        type: number,
    }
})*/
