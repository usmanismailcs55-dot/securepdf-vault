const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} = require("@aws-sdk/client-s3");

const client = new S3Client({
  region: process.env.B2_REGION,
  endpoint: process.env.B2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY,
  },
});

const bucketName = process.env.B2_BUCKET_NAME;

async function uploadObject(key, body, contentType = "application/pdf") {
  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

async function downloadObject(key) {
  const response = await client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  );

  const chunks = [];

  for await (const chunk of response.Body) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

async function deleteObject(key) {
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  );
}

async function objectExists(key) {
  try {
    await client.send(
      new HeadObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );

    return true;
  } catch (error) {
    if (
      error.name === "NotFound" ||
      error.$metadata?.httpStatusCode === 404
    ) {
      return false;
    }

    throw error;
  }
}

module.exports = {
  uploadObject,
  downloadObject,
  deleteObject,
  objectExists,
};