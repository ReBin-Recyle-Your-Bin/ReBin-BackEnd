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
      message: "User ID is required",
      userId
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
    uploadData.push({userId, ...result});
    const publicId = result.public_id;

    res.status(200).json({
      error: false,
      message: "Gambar berhasil diunggah",
    })
  })
});

// router get image by userId param
router.get('/image', (req, res) => {
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({
            error: true,
            message: "diperlukan parameter userId"
        });
    }

    const userImages = uploadData.filter(item => item.userId === userId);

    if (userImages.length > 0) {
        Promise.all(userImages.map(image => 
            cloudinary.api.resource(image.public_id)
                .then(result => ({
                    display_name: result.public_id,
                    public_id: result.public_id,
                    url: result.secure_url
                }))
        ))
        .then(images => {
            res.status(200).json({
                error: false,
                message: "Gambar berhasil diambil",
                data: images
            });
        })
        .catch(error => {
            res.status(500).json({
                error: true,
                message: "Terjadi kesalahan server internal",
                error: error.message
            });
        });
    } else {
        res.status(404).json({
            error: true,
            message: "Tidak ada gambar ditemukan untuk userId tersebut"
        });
    }
});


module.exports = router;