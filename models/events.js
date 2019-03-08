const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// event log
const eventSchema = new Schema(
    {
        room: String,
        eventType: String,
        time: String
    },
    {
        collection: "events"
    }
);
module.exports = mongoose.model("event", eventSchema);