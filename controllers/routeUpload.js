const express = require('express');
const router = express.Router();
const cloudinary = require("../utils/cloudinary");
const upload = require("../middlewares/multer");

  
// Simpan data unggahan dalam memori
let uploadData = [];

// Router post image
router.post('/upload', upload.single('image'), function (req, res) {
const userId = req.body.userId;

  if (!userId) {
    return res.status(400).json({
      error: true,
      message: "User ID is required"
    });
  }

  cloudinary.uploader.upload(req.file.path, function (err, result){
    if(err) {
      console.log(err);
      return res.status(500).json({
        error: true,
        message: "Error"
      })
    }

    // Simpan data hasil unggahan ke dalam memori
    uploadData.push(result);
    const publicId = result.public_id;

    res.status(200).json({
      error: false,
      message: "Gambar berhasil diunggah",
      userId,
      data: {
        public_id: publicId
      }
    })
  })
});

// Router get image
router.get('/image/:publicId', (req, res) => {
    const publicId = req.params.publicId;
  
    cloudinary.api.resource(publicId)
      .then(result => {
        if (result) {
          const filteredData = {
            display_name: result.display_name,
            public_id: result.public_id,
            url: result.url 
          };
  
          res.status(200).json({
            error: false,
            message: "Gambar berhasil diambil",
            data: filteredData
          });
        } else {
          res.status(404).json({
            error: true,
            message: "Gambar tidak ditemukan"
          });
        }
      })
      .catch(error => {
        res.status(500).json({
          error: true,
          message: "Terjadi kesalahan server internal",
          error: error.message
        });
      });
});
  

module.exports = router;