const mongoose = require('mongoose');

// skema crafts
const ItemsSchema = new mongoose.Schema({
    classID: String,
    className: String,
    name: String,
    ingredients: String,
    steps: String,
    photoUrl: String

});

// skema stories
const StorySchema = new mongoose.Schema({
    title: String,
    author: String,
    description: String,
    date: String,
    photoUrl: String
});

// skema points
const pointSchema = new mongoose.Schema({
    userId: String,
    description: String,
    point: Number,
    date: {
        type: Date,
        default: Date.now(),
    }
});

pointSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

const PointModel = mongoose.model('Point', pointSchema);

const ItemsModel = mongoose.model("Items", ItemsSchema);

const StoryModel = mongoose.model("Story", StorySchema);

module.exports = { ItemsModel, StoryModel, PointModel };