const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
    original_url: {
        type: String,
        required: true
    },
    short_url: {
        type: String,
        required: true
    }
});

const ShortUrl = mongoose.model("ShortUrl", urlSchema);
module.exports = ShortUrl;