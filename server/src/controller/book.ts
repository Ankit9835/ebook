import BookModel, { BookDoc } from "@/models/book";
import { RequestBookHandler, UpdateBookHandler } from "@/types";
import { formatFileSize, sendErrorResponse } from "@/utils/helper";
import { Types } from "mongoose";
import slugify from "slugify";
import * as fs from 'fs';
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "@/cloud/aws";
import { generateFileUploadUrl, uploadAwsLink, uploadBookCoverAws } from "@/utils/fileUpload";
import AuthorModel from "@/models/author";

export const createBook: RequestBookHandler = async(req,res) => {
    const {body,files,user} = req
    const {title,description,
    genre,
    language,
    fileInfo,
    price,
    publicationName,
    publishedAt} = body

    const {cover} = files

    const newBook = new BookModel<BookDoc>({
        title,
        description,
        genre,
        language,
        fileInfo: {size: formatFileSize(fileInfo.size), id:""},
        price,
        publicationName,
        publishedAt,
        slug: "",
        author: new Types.ObjectId(user?.authorId)
    })

    newBook.slug = slugify(`${newBook.title} ${newBook._id}`, {
        lower: true,
        replacement: "-",
    });

    const fileName = slugify(`${newBook._id} ${newBook.title}.epub`, {
        lower: true,
        replacement: "-",
    });

    const fileUploadUrl = await generateFileUploadUrl(s3Client, {
        bucket: process.env.AWS_PRIVATE_BUCKET!,
        contentType: fileInfo.type,
        uniqueKey: fileName,
    });

    newBook.fileInfo.id = fileName;

    const bucketName = 'ebook620'
     if (Array.isArray(cover) && cover.length > 0) {
    
    
      
        const uniqueFileName = `${user.id}-${slugify(title, {
            lower: true,
            replacement: "-",
         })}.png`;
       
        newBook.cover = await uploadBookCoverAws(cover,bucketName,uniqueFileName)
    }

   

    await newBook.save()
     await AuthorModel.findByIdAndUpdate(user.authorId,{
        $push:{
            books: newBook._id
        }
    })
    res.send(fileUploadUrl);
}

export const updateBook: UpdateBookHandler = async(req,res) => {
    const {body,files,user} = req
    const {title,description,
    genre,
    language,
    fileInfo,
    price,
    publicationName,
    publishedAt,slug} = body

    const {cover, book: newBookFile} = files

    const newBook = await BookModel.findOne({
        slug,
        author: user.authorId,
    });

    if (!newBook) {
        return sendErrorResponse({
        message: "Book not found!",
        status: 404,
        res,
        });
    }

    newBook.title = title;
    newBook.description = description;
    newBook.language = language;
    newBook.publicationName = publicationName;
    newBook.genre = genre;
    newBook.publishedAt = publishedAt;
    newBook.price = price;

    let fileUploadUrl = "";
 
    if (
      newBookFile &&
      !Array.isArray(newBookFile) &&
      newBookFile.mimetype === "application/epub+zip"
    ) {
      // remove the old book from cloud (bucket)
      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.AWS_PRIVATE_BUCKET,
        Key: newBook.fileInfo.id,
      });

      await s3Client.send(deleteCommand);

      // generate (sign) new url to upload book
      const fileName = slugify(`${newBook._id} ${newBook.title}.epub`, {
        lower: true,
        replacement: "-",
      });
      fileUploadUrl = await generateFileUploadUrl(s3Client, {
        bucket: process.env.AWS_PRIVATE_BUCKET!,
        contentType: fileInfo?.type || newBookFile.mimetype,
        uniqueKey: fileName,
      });
    }
    const bucketName = 'ebook620'
    if (cover && !Array.isArray(cover) && cover.mimetype?.startsWith("image")) {
      // remove old cover from the cloud (bucket)
      if (newBook.cover?.id) {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.AWS_PUBLIC_BUCKET,
          Key: newBook.cover.id,
        });
        await s3Client.send(deleteCommand);
      }
      // upload new cover to the cloud (bucket)
      const uniqueFileName = slugify(`${newBook._id} ${newBook.title}.png`, {
        lower: true,
        replacement: "-",
      });

      newBook.cover = await uploadBookCoverAws(cover,bucketName,uniqueFileName)
    }
  

  await newBook.save();

  res.send(fileUploadUrl);
}