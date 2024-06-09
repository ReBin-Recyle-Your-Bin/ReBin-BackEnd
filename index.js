const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const dbConfig = require('./config/db.config');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const { unless } = require('express-unless');

require('dotenv').config();


const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;


const auth = require('./middlewares/auth');
const errors = require('./middlewares/errors');
const { ItemsModel , StoryModel, PointModel } = require('./src/db/tutorialschema');

const app = express();

// MongoDB connection
const MONGO_URL = 'mongodb+srv://ReBinApp:rebinapplication@cluster0.mscxy6g.mongodb.net/rebinDB';
mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(
    () => {
        console.log('Connected to database');
    },
    (error) => {
        console.log('Not connected to database: ' + error);
    }
);

// auth unless
auth.authenticateToken.unless = unless;
app.use(
    auth.authenticateToken.unless({
        path: [
            { url : "/login", methods: ["POST"] },
            { url : "/register", methods: ["POST"] },
        ], 
    })
);

// middleware untuk parsing request body
app.use(bodyParser.json());
app.use(cors());


// endpoint untuk mendapatkan semua crafts
app.get("/craft/all", async (req, res) => {
  try {
    const items = await ItemsModel.find({});
    if (!items) {
      return res.status(404).json({ error: true, message: "Crafts not found" });
    }
    res.status(200).json({ error: false, message: "Crafts fetched successfully", listItems: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Internal server error" });
  }
})

// endpoint untuk mendapatkan craft berdasarkan ID
app.get('/craft/:id', (req, res) => {
  const itemId = req.params.id;
  ItemsModel.findById(itemId)
   .then(item => {
      if (item) {
        res.status(200).json({ error: false, message: "Craft fetched successfully", item });
      } else {
        res.status(404).json({ error: true, message: "Craft not found" });
      }
    })
   .catch(err => {
      console.log(err);
      res.status(500).json({ error:true, message: "Internal server error" });
    });
});

// endpoint untuk mendapatkan craft dengan paging
app.get("/crafts", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const totalItems = await ItemsModel.countDocuments();
    const items = await ItemsModel.find({}).limit(limit).skip(skip);

    if (!items) {
      return res.status(404).json({ error: true, message: "Crafts not found" });
    }

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      error: false,
      message: "Crafts fetched successfully",
      totalPages: totalPages,
      currentPage: page,
      listItems: items
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Internal server error" });
  }
});


// endpoint untuk mendapatkan semua story
app.get("/story/all", async (req, res) => {
  try {
    const story = await StoryModel.find({});
    if (!story) {
      return res.status(404).json({ error: true, message: "Stories not found" });
    }
    res.status(200).json({ error: false, message: "Stories fetched successfully", listStory: story });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Internal server error. Please try again." });
  }
})

// endpoint untuk mendapatkan story berdasarkan ID
app.get('/story/:id', (req, res) => {
  const storyId = req.params.id;
  StoryModel.findById(storyId)
    .then((story) => {
      if (story) {
        res.status(200).json({ error: false, message: "Story fetched successfully", story });
      } else {
        res.status(404).json({ error: true, message: "Story not found. Please check the ID and try again." });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: true, message: "An internal server error occurred. Please try again." });
    });
});


// endpoint untuk mendapatkan story dengan paging
app.get("/stories", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const skip = (page - 1) * limit;

  try {
    const totalStory = await StoryModel.countDocuments();
    const stories = await StoryModel.find({}).limit(limit).skip(skip);

    if (!stories) {
      return res.status(404).json({ error: true, message: "Stories not found" });
    }

    const totalPages = Math.ceil(totalStory / limit);

    res.status(200).json({
      error: false,
      message: "Stories fetched successfully",
      totalPages: totalPages,
      currentPage: page,
      listStory: stories
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Internal server error. Please try again." });
  }
});


// endpoints untuk post points
app.post('/points', async (req, res) => {
  try {
      const { userId, description, point } = req.body;

      const newPoint = new PointModel({
          userId,
          description,
          point
      });

      // simpan point ke dalam database
      const savedPoint = await newPoint.save();

      res.status(201).json({
          error: false,
          message: "Point added successfully",
          data: savedPoint
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          error: true,
          message: "An internal server error occurred. Please try again later."
      });
  }
});


// endpoint untuk get points
app.get('/points', async (req, res) => {
  const { userId } = req.query;

  try {
      if (!userId) {
          return res.status(400).json({
              error: true,
              message: "userId parameter is required"
          });
      }

      // userId untuk mencari poin yang sesuai
      const userPoints = await PointModel.find({ userId: userId });

      if (userPoints.length === 0) {
          return res.status(404).json({
              error: true,
              message: "userId doesn't have a point yet"
          });
      }

      res.status(200).json({
          error: false,
          message: "Points fetched successfully",
          data: userPoints
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          error: true,
          message: "An internal server error occurred. Please try again later."
      });
  }
});


// Jalankan server
app.use(express.json());
app.use("/", require("./routes/users.routes"));
app.use(errors.errorHandler);


app.listen(process.env.port || 3000, function () {
    console.log("server running on http://localhost:3000");
});