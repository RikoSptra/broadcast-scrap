const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { v4: uuidV4 } = require("uuid");
const replace = require("lodash/replace");
const mime = require("mime-types");
const fileType = require("file-type");
const dayjs = require("dayjs");

/**
 * access-key= 8TTGDPE453DMGAHLI9XY
secret-key= zzUDs7zPNfvDNSyJ2FKaeRW2Y6UvM5EaUeXzc5EW

*/
const s3 = new aws.S3({
  endpoint: "s3.ap-southeast-1.wasabisys.com",
  accessKeyId: "8TTGDPE453DMGAHLI9XY",
  secretAccessKey: "zzUDs7zPNfvDNSyJ2FKaeRW2Y6UvM5EaUeXzc5EW",
});

const initializeUploader = () => {
  const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: "schooltalk",
      acl: "public-read",
      key: (request, file, cb) => {
        cb(null, `pimage/${uuidV4()}__` + replace(file.originalname, "/", ""));
      },
    }),
    limits: { fileSize: 1 * 1024 * 1024 },
  }).any();

  const uploader = (req, res) =>
    new Promise((resolve, reject) => {
      upload(req, res, (error) => {
        if (error) {
          reject({ message: error.message });
        } else {
          resolve({
            files: req.files,
            formData: req.body,
          });
        }
      });
    });
  return uploader;
};



exports.removeObjectFromSpaces = (url) => {
  if (!url) return;
  const Key = url.replace(
    "https://schooltalk.sgp1.digitaloceanspaces.com/",
    ""
  );
  s3.deleteObject(
    {
      Bucket: "schooltalk",
      Key,
    },
    (err) => {
    }
  );
};

exports.uploadPdfToWasabi = async (bufferString, prefix, filename) => {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.warn(`AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY not provided!`);
    return null;
  }
  if (!bufferString) return null;
  try {
    const buf = Buffer.from(bufferString, "base64");
    const { mime: ContentType } = await fileType.fromBuffer(buf);
    const Key =
      `${prefix ? prefix : "aimage"}/${
        filename ? filename + `_${dayjs().format("DDMMYYHHMMss")}` : uuidV4()
      }.` + fileType.extname(ContentType);

    const s3Url = await new Promise((resolve, reject) => {
      s3.putObject(
        {
          Bucket: "schooltalkstorage",
          Key,
          Body: buf,
          ContentEncoding: "base64",
          ContentType,
          ACL: "public-read",
        },
        (err, data) => {
          if (err) {
            reject(err);
          }
          resolve(
            "https://s3.ap-southeast-1.wasabisys.com/schooltalkstorage/" + Key
          );
        }
      );
    });

    return s3Url;
  } catch (e) {
    console.log(e);
    throw new Error(e);
  }
};

exports.uploadBase64ToWasabi = (base64string, prefix, filename) => {
  if (!base64string) return null;
  return new Promise((resolve, reject) => {
    const ContentType = base64MimeType(base64string);
    const Key =
      `${prefix ? prefix : "aimage"}/${
        filename ? filename + `_${dayjs().format("YYMMDDHHMMss")}` : uuidV4()
      }.` + mime.extension(ContentType);
    const buf = Buffer.from(
      base64string.split("base64,")[1],
      "base64"
    );
    s3.putObject(
      {
        Bucket: "schooltalkstorage",
        Key,
        Body: buf,
        ContentEncoding: "base64",
        ContentType,
        ACL: "public-read",
      },
      (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(
          "https://s3.ap-southeast-1.wasabisys.com/schooltalkstorage/" + Key
        );
      }
    );
  });
};

exports.uploadBase64ToWasabiWithMimeType = (base64string, prefix, filename) => {
  if (!base64string) return null;
  return new Promise((resolve, reject) => {
    const ContentType = base64MimeType(base64string);
    const Key =
      `${prefix ? prefix : "aimage"}/${
        filename ? filename + `_${dayjs().format("YYMMDDHHMMss")}` : uuidV4()
      }.` + mime.extension(ContentType);
    const buf = Buffer.from(
      base64string.split("base64,")[1],
      "base64"
    );
    s3.putObject(
      {
        Bucket: "schooltalkstorage",
        Key,
        Body: buf,
        ContentEncoding: "base64",
        ContentType,
        ACL: "public-read",
      },
      (err, data) => {
        if (err) {
          reject(err);
        }
        resolve({
          mediaUrl: "https://s3.ap-southeast-1.wasabisys.com/schooltalkstorage/" + Key,
          mimeType: ContentType
        });
      }
    );
  });
};


const base64MimeType = (encoded) => {
  var result = null;

  if (typeof encoded !== "string") {
    return result;
  }

  var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
  if (mime && mime.length) {
    result = mime[1];
  }

  return result;
};
