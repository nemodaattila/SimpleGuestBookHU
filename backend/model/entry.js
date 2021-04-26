/*
 * fórum entry-k moongoose shemája
 * owner: az készítő ID-je
 * content: az entry tartalma
 * date: készítési idő
 * @type {Mongoose}
 */

const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    content: String,
    date: Date
});

module.exports = mongoose.model('Entry', entrySchema);
