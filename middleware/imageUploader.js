const multer = require("multer");
const sharp = require('sharp');
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
  destination: "uploads/",
});

const upload = multer({ storage: storage, limits: { files: 4 } , preservePath: true});


const cloudinary = require("../utils/cloudinary");


const uploadMiddleware = (req, res, next) => {
  upload.array("image", 4)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
 
    if (!req.files || req.files.length !== 4) {
      return res.status(400).json({ message: "Exactly 4 files are required." });
    }

    try {
      const uploadedImages = []; // Array to store uploaded image URLs

      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "product-images",
        });
        uploadedImages.push(result.secure_url); // Add uploaded image URL to the array
      }

      req.body.image = uploadedImages;
      next();
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error uploading file to Cloudinary." });
   }
    });
  };
  
  module.exports = uploadMiddleware;

