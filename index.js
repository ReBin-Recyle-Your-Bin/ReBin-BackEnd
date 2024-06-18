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
const uploadRoute = require('./controllers/routeUpload');

const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;

const auth = require('./middlewares/auth');
const errors = require('./middlewares/errors');
const { ItemsModel , StoryModel, PointModel, HistoryModel, ChallengeModel } = require('./src/db/tutorialschema');

const app = express();

const port = process.env.PORT || 8080;
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://ReBinApp:rebinapplication@cluster0.mscxy6g.mongodb.net/?retryWrites=true&w=majority';

// MongoDB connection
const MONGO_URL = 'mongodb+srv://ReBinApp:rebinapplication@cluster0.mscxy6g.mongodb.net/rebinDB';
mongoose.Promise = global.Promise;
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(
    () => {
        console.log('Connected to database');
    },
    (error) => {
        console.log('Not connected to database:' + error);
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
      return res.status(404).json({ error: true, message: "Craft tidak ditemmukan" });
    }
    res.status(200).json({ error: false, message: "Craft berhasil diambil dengan sukses", listItems: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Kesalahan server internal" });
  }
})

// endpoint untuk mendapatkan craft berdasarkan parameter className
app.get("/craft", async (req, res) => {
  const { className } = req.query;

  try {
    let items;
    if (className) {
      items = await ItemsModel.find({ className });
    } else {
      items = await ItemsModel.find({});
    }
    
    if (!items || items.length === 0) {
      return res.status(404).json({ error: true, message: "Craft tidak ditemmukan" });
    }
    
    res.status(200).json({ error: false, message: "Craft berhasil diambil dengan sukses", listItems: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Kesalahan server internal" });
  }
});

// endpoint untuk mendapatkan craft berdasarkan ID
app.get('/craft/:id', (req, res) => {
  const itemId = req.params.id;
  ItemsModel.findById(itemId)
   .then(item => {
      if (item) {
        res.status(200).json({ error: false, message: "Craft berhasil diambil dengan sukses", item });
      } else {
        res.status(404).json({ error: true, message: "Craft tidak ditemmukan" });
      }
    })
   .catch(err => {
      console.log(err);
      res.status(500).json({ error:true, message: "Kesalahan server internal" });
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
      return res.status(404).json({ error: true, message: "Craft tidak ditemmukan" });
    }

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      error: false,
      message: "Craft berhasil diambil dengan sukses",
      totalPages: totalPages,
      currentPage: page,
      listItems: items
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Kesalahan server internal" });
  }
});

// endpoint untuk mendapatkan craft dengan paging dan limit content
app.get("/crafting", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const totalItems = await ItemsModel.countDocuments();
    const items = await ItemsModel.find({}).limit(limit).skip(skip);

    if (!items || items.length === 0) {
      return res.status(404).json({ error: true, message: "Craft tidak ditemmukan" });
    }

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      error: false,
      message: "Craft berhasil diambil dengan sukses",
      totalPages: totalPages,
      currentPage: page,
      listItems: items
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Kesalahan server internal" });
  }
});

// endpoint untuk mendapatkan semua story
app.get("/story/all", async (req, res) => {
  try {
    const story = await StoryModel.find({});
    if (!story) {
      return res.status(404).json({ error: true, message: "Story tidak ditemukan" });
    }
    res.status(200).json({ error: false, message: "Story berhasil diambil dengan sukses", listStory: story });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Kesalahan server internal. Silakan coba lagi." });
  }
});

// endpoint untuk mendapatkan story berdasarkan ID
app.get('/story/:id', (req, res) => {
  const storyId = req.params.id;
  StoryModel.findById(storyId)
    .then((story) => {
      if (story) {
        res.status(200).json({ error: false, message: "Story berhasil diambil dengan sukses", story });
      } else {
        res.status(404).json({ error: true, message: "Story tidak ditemukan. Silakan periksa ID dan coba lagi." });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: true, message: "Terjadi kesalahan server internal. Silakan coba lagi." });
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
      return res.status(404).json({ error: true, message: "Story tidak ditemukan." });
    }

    const totalPages = Math.ceil(totalStory / limit);

    res.status(200).json({
      error: false,
      message: "Story berhasil diambil dengan sukses",
      totalPages: totalPages,
      currentPage: page,
      listStory: stories
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Terjadi kesalahan server internal. Silakan coba lagi." });
  }
});

// endpoint untuk mendapatkan story dengan paging dan limit content
app.get("/story", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  try {
    const totalItems = await ItemsModel.countDocuments();
    const items = await ItemsModel.find({}).limit(limit).skip(skip);

    if (!items || items.length === 0) {
      return res.status(404).json({ error: true, message: "Story tidak ditemmukan" });
    }

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      error: false,
      message: "Story berhasil diambil dengan sukses",
      totalPages: totalPages,
      currentPage: page,
      listItems: items
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Kesalahan server internal" });
  }
});

// endpoint untuk post points
app.post('/points', async (req, res) => {
  try {
      const { userId, description, point, status } = req.body;

      const newPoint = new PointModel({
          userId,
          description,
          point,
          status,
      });

      // simpan point ke dalam database
      const savedPoint = await newPoint.save();

      res.status(201).json({
          error: false,
          message: "Poin berhasil ditambahkan",
          data: savedPoint
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          error: true,
          message: "Terjadi kesalahan server internal. Silakan coba lagi nanti."
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
              message: "Diperlukan parameter userId"
          });
      }

      // userId untuk mencari poin yang sesuai
      const userPoints = await PointModel.find({ userId: userId });

      if (userPoints.length === 0) {
          return res.status(404).json({
              error: true,
              message: "userId belum memiliki poin"
          });
      }

      res.status(200).json({
          error: false,
          message: "Poin berhasil diambil dengan sukses",
          data: userPoints
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          error: true,
          message: "Terjadi kesalahan server internal. Silakan coba lagi nanti."
      });
  }
});

// endpoint untuk post history
app.post('/detect-waste/history', async (req, res) => {
  try {
      const { userId, accuracy, label } = req.body;

      const newHistory = new HistoryModel({
          userId,
          accuracy,
          label
      });

      // simpan history ke dalam database
      const savedHistory = await newHistory.save();

      res.status(201).json({
          error: false,
          message: "History deteksi berhasil disimpan",
          data: savedHistory
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          error: true,
          message: "Terjadi kesalahan server internal. Silakan coba lagi nanti."
      });
  }
});

// endpoint untuk get history
app.get('/detect-waste/history', async (req, res) => {
  const { userId } = req.query;

  try {
      if (!userId) {
          return res.status(400).json({
              error: true,
              message: "Diperlukan parameter userId"
          });
      }

      // userId untuk mencari history yang sesuai
      const userHistory = await HistoryModel.find({ userId: userId });

      if (userHistory.length === 0) {
          return res.status(404).json({
              error: true,
              message: "userId belum memiliki history"
          });
      }

      res.status(200).json({
          error: false,
          message: "History berhasil diambil dengan sukses",
          data: userHistory
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          error: true,
          message: "Terjadi kesalahan server internal. Silakan coba lagi nanti."
      });
  }
});

// endpoint untuk delete history by ID
app.delete('/detect-waste/history/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const history = await HistoryModel.findByIdAndDelete(id);

      if (!history) {
          return res.status(404).json({
              error: true,
              message: "History tidak ditemukan"
          });
      }

      res.status(200).json({
          error: false,
          message: "History berhasil dihapus"
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          error: true,
          message: "Terjadi kesalahan server internal. Silakan coba lagi nanti."
      });
  }
});

// endpoint untuk delete seluruh history dengan parameter userId
app.delete('/detect-waste/history', async (req, res) => {
  const { userId } = req.query;

  try {
      if (!userId) {
          return res.status(400).json({
              error: true,
              message: "Diperlukan parameter userId"
          });
      }

      const result = await HistoryModel.deleteMany({ userId });

      if (result.deletedCount === 0) {
          return res.status(404).json({
              error: true,
              message: "userId belum memiliki riwayat history"
          });
      }

      res.status(200).json({
          error: false,
          message: "Semua history berhasil dihapus"
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          error: true,
          message: "Terjadi kesalahan server internal. Silakan coba lagi nanti."
      });
  }
});

// endpoint untuk mendapatkan data challenge
app.get("/challenge", async (req, res) => {
  try {
    const challenge = await ChallengeModel.find({});
    if (!challenge) {
      return res.status(404).json({ error: true, message: "Challenge tidak ditemukan" });
    }
    res.status(200).json({ error: false, message: "Challenge berhasil diambil dengan sukses", challenge});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Kesalahan server internal. Silakan coba lagi." });
  }
});


// Jalankan server
app.use(express.json());
app.use("/", require("./routes/users.routes"));
app.use(errors.errorHandler);
app.use("/" , uploadRoute);

app.listen(process.env.port || 8080, function () {
    console.log(`Server running on ${8080}`);
});