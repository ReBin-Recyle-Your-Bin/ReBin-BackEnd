const express = require('express');
const router = express.Router();
const cloudinary = require("../utils/cloudinary");
const upload = require("../middlewares/multer");

  
  // Simpan data unggahan dalam memori (untuk contoh)
let uploadData = [];

router.post('/upload', upload.single('image'), function (req, res) {
const userId = req.body.userId;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required"
    });
  }

  cloudinary.uploader.upload(req.file.path, function (err, result){
    if(err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Error"
      })
    }

    // Simpan data hasil unggahan ke dalam memori
    uploadData.push(result);
    const publicId = result.public_id;

    res.status(200).json({
      success: true,
      message: "Gambar berhasil diunggah",
      userId,
      data: {
        public_id: publicId
      }
    })
  })
});

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
            success: true,
            message: "Gambar berhasil diambil",
            data: filteredData
          });
        } else {
          res.status(404).json({
            success: false,
            message: "Gambar tidak ditemukan"
          });
        }
      })
      .catch(error => {
        res.status(500).json({
          success: false,
          message: "Terjadi kesalahan server internal",
          error: error.message
        });
      });
});
  

module.exports = router;