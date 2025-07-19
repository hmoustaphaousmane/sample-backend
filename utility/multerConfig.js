const multer = require("multer");
const uuid = require("uuid");

// const upload = multer({dest: "public/"});

const upload = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "public/");
  },
  filename: (req, file, callback) => {
    console.log(file.mimetype.split("/")[1])
    callback(null, uuid.v4() + "." + file.mimetype.split("/")[1]);
  },
});

// upload file to memory
// const upload = multer.memoryStorage();

const fileUpload = multer({ storage: upload });

module.exports = fileUpload;
