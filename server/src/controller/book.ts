import BookModel, { BookDoc } from "@/models/book";
import { RequestBookHandler } from "@/types";
import { formatFileSize } from "@/utils/helper";
import { Types } from "mongoose";
import slugify from "slugify";
import * as fs from 'fs';
import { PutObjectCommand } from "@aws-sdk/client-s3";
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