const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// event log
const eventSchema = new Schema(
    {
        eventType: String,
        time: String
    },
    {
        collection: "events"
    }
);
module.exports = mongoose.model("events", eventSchema);