const mongoose = require("mongoose");
const Schema = mongoose.Schema;


// this will be our data base's data structure 
const ChatSchema = new Schema(
    {
        name: String,
        message: String,
        time: String
    },
    {
        collection: "chats"
    }
);

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

// export the new Schema's so we could modify it using Node.js
module.exports = mongoose.model("Chat", ChatSchema);
module.exports = mongoose.model("events", eventSchema);