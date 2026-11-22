import 'server-only';

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const readEnv = (...keys: string[]) => {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
};

const requiredEnv = (name: string, value?: string) => {
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name} para Cloudflare R2`);
  }
  return value;
};

const normalizePublicUrl = (url: string) => url.replace(/\/+$/, '');

const getR2Config = () => {
  const accountId = readEnv('R2_ACCOUNT_ID');
  const accessKeyId = requiredEnv('R2_ACCESS_KEY_ID', readEnv('R2_ACCESS_KEY_ID'));
  const secretAccessKey = requiredEnv('R2_SECRET_ACCESS_KEY', readEnv('R2_SECRET_ACCESS_KEY'));
  const bucketName = requiredEnv('R2_BUCKET', readEnv('R2_BUCKET', 'R2_BUCKET_NAME'));
  const publicUrl = requiredEnv(
    'R2_PUBLIC_BASE',
    readEnv(
      'R2_PUBLIC_BASE',
      'NEXT_PUBLIC_R2_PUBLIC_BASE',
      'R2_PUBLIC_URL',
      'NEXT_PUBLIC_R2_PUBLIC_URL'
    )
  );
  const endpoint = readEnv('R2_ENDPOINT') || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);
  const resolvedEndpoint = requiredEnv('R2_ENDPOINT', endpoint);

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    endpoint: resolvedEndpoint,
    publicUrl: normalizePublicUrl(publicUrl),
  };
};

let client: S3Client | null = null;

const getR2Client = () => {
  if (client) return client;

  const { endpoint, accessKeyId, secretAccessKey } = getR2Config();

  client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return client;
};

const sanitizeFileName = (fileName: string) =>
  fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const buildObjectKey = (fileName: string) => {
  const safeName = sanitizeFileName(fileName || 'image.jpg') || 'image.jpg';
  const date = new Date();
  const path = [
    'uploads',
    String(date.getUTCFullYear()),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
  ].join('/');

  return `${path}/${crypto.randomUUID()}-${safeName}`;
};

export const getR2PublicUrl = () => getR2Config().publicUrl;

export const isR2Url = (url: string) => {
  if (!url) return false;
  return url.startsWith(`${getR2PublicUrl()}/`);
};

export const getR2ObjectKeyFromUrl = (url: string) => {
  if (!isR2Url(url)) {
    throw new Error('La URL no pertenece al bucket público de R2 configurado');
  }

  const key = decodeURIComponent(url.replace(`${getR2PublicUrl()}/`, ''));
  if (!key) {
    throw new Error('No se pudo resolver la clave del objeto en R2');
  }
  return key;
};

export const uploadFileToR2 = async (file: File) => {
  const { bucketName, publicUrl } = getR2Config();
  const key = buildObjectKey(file.name);
  const body = Buffer.from(await file.arrayBuffer());

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: file.type || 'application/octet-stream',
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  return {
    key,
    url: `${publicUrl}/${key}`,
  };
};

export const deleteFileFromR2 = async (url: string) => {
  const { bucketName } = getR2Config();
  const key = getR2ObjectKeyFromUrl(url);

  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  );
};
