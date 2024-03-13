const multer = require("multer");

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
  destination: "uploads/",
});

const upload = multer({ storage: storage, limits: { files: 3 } , preservePath: true});

console.log(upload);
const cloudinary = require("../utils/cloudinary");


const uploadMiddleware = (req, res, next) => {
  upload.array("image", 3)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
  console.log(req.files,'jhhhjkh')
    if (!req.files || req.files.length !== 3) {
      return res.status(400).json({ message: "Exactly 3 files are required." });
    }

    try {
        const result = await cloudinary.uploader.upload(req.files.path, {
          folder: "product-images",
        });
  
        req.body.image = result.secure_url;
        next();
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Error uploading file to Cloudinary." });
      }
    });
  };
  
  module.exports = uploadMiddleware;

