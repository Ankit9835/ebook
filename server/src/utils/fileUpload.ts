import s3Client from "@/cloud/aws";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as fs from 'fs';

export const uploadAvatarToAws = async(file: File, uniqueFileName: string, avatarId:string) => {
    const bucketName = 'ebook620'

     if (avatarId) {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: avatarId,
    });
    await s3Client.send(deleteCommand);
  }

  const avatarFile = file[0];

  // ✅ Read file from filesystem (make sure path exists)
  const fileBuffer = fs.readFileSync(avatarFile.filepath);

  
  

  // ✅ Upload to S3 with ContentType
  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: uniqueFileName,
    Body: fileBuffer,
    ContentType: avatarFile.mimetype, // 🔥 important for viewing image
  });

  await s3Client.send(putCommand);

  // ✅ Save to DB
  return {
    id: uniqueFileName,
    url: uploadAwsLink(bucketName,uniqueFileName),
  };
}

export const uploadBookCoverAws = async(cover:File,bucketName:string,uniqueFileName:string) => {
      const avatarFile = cover[0];

        // ✅ Read file from filesystem (make sure path exists)
        const fileBuffer = fs.readFileSync(avatarFile.filepath);

  
  

        // ✅ Upload to S3 with ContentType
        const putCommand = new PutObjectCommand({
            Bucket: bucketName,
            Key: uniqueFileName,
            Body: fileBuffer,
            ContentType: avatarFile.mimetype, // 🔥 important for viewing image
        });

        await s3Client.send(putCommand);

        return {
          id: uniqueFileName,
          url: uploadAwsLink(bucketName,uniqueFileName),
        };
}

export const uploadAwsLink = (bucketName:string, uniqueFileName:string):string => {
  return `https://${bucketName}.s3.amazonaws.com/${uniqueFileName}`
}

interface FileInfo {
  bucket: string,
  uniqueKey: string,
  contentType: string
}

export const generateFileUploadUrl = async(client:S3Client, fileInfo:FileInfo) => {
  const {bucket,uniqueKey,contentType} = fileInfo
  const command = new PutObjectCommand({
    Bucket:bucket,
    Key: uniqueKey,
    ContentType: contentType
  })

  return await getSignedUrl(client,command)
}