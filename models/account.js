const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Account = new Schema({
    username: String,
    str: String,
    num: Number
});


module.exports = mongoose.model('accounts', Account);
