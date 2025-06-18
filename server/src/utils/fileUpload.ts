import s3Client from "@/cloud/aws";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
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
    url: `https://${bucketName}.s3.amazonaws.com/${uniqueFileName}`,
  };
}