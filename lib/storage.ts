import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { configuredValue, hasConfiguredValues } from "@/lib/env";

const allowedTypes = new Set(["image/avif", "image/webp", "image/jpeg", "video/mp4", "model/gltf-binary", "application/pdf"]);
const storageVariables = ["AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_ASSET_BUCKET"];

function storageConfig() {
  if (!hasConfiguredValues(...storageVariables)) throw new Error("S3 storage is not configured.");
  return {
    bucket: configuredValue("AWS_ASSET_BUCKET"),
    client: new S3Client({
      region: configuredValue("AWS_REGION"),
      credentials: {
        accessKeyId: configuredValue("AWS_ACCESS_KEY_ID"),
        secretAccessKey: configuredValue("AWS_SECRET_ACCESS_KEY"),
      },
    }),
  };
}

function safeKey(key: string) {
  if (!/^[a-zA-Z0-9/_\-.]+$/.test(key) || key.includes("..")) throw new Error("Invalid asset key.");
  return key;
}

export async function createAssetUploadUrl(key: string, contentType: string) {
  if (!allowedTypes.has(contentType)) throw new Error("Unsupported asset content type.");
  const { bucket, client } = storageConfig();
  const command = new PutObjectCommand({ Bucket: bucket, Key: safeKey(key), ContentType: contentType, ServerSideEncryption: "AES256" });
  return getSignedUrl(client, command, { expiresIn: 300 });
}

export async function createPrivateAssetUrl(key: string) {
  const { bucket, client } = storageConfig();
  const command = new GetObjectCommand({ Bucket: bucket, Key: safeKey(key), ResponseCacheControl: "private, max-age=300" });
  return getSignedUrl(client, command, { expiresIn: 300 });
}
