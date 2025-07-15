import BookModel, { BookDoc } from "@/models/book";
import { RequestBookHandler, UpdateBookHandler } from "@/types";
import { formatFileSize, sendErrorResponse } from "@/utils/helper";
import { ObjectId, Types,isValidObjectId } from "mongoose";
import slugify from "slugify";
import * as fs from 'fs';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "@/cloud/aws";
import { generateFileUploadUrl, uploadAwsLink, uploadBookCoverAws } from "@/utils/fileUpload";
import AuthorModel from "@/models/author";
import { RequestHandler } from "express";
import UserModel from "@/models/user";
import HistoryModel, { LocationHighlights } from "@/models/history";
import { Settings } from "http2";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
    
    
      
        const uniqueFileName =  slugify(`${newBook._id} ${newBook.title}.png`, {
        lower: true,
        replacement: "-",
    });
       
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

interface PopulatedBooks {
  cover?: {
    url: string;
    id: string;
  };
  _id: ObjectId;
  author: {
    _id: ObjectId;
    name: string;
    slug: string;
  };
  title: string;
  slug: string;
}

export const getAllPurchasedBooks: RequestHandler = async (req, res) => {
 const user = await UserModel.findById(req.user.id).populate<{
    book: PopulatedBooks[];
  }>({
    path: "book",
    select: "author title cover slug",
    populate: { path: "author", select: "slug name" },
  });

  if (!user) return res.json({ books: [] });

  res.json({
    books: user.book.map((book) => ({
      id: book._id,
      title: book.title,
      cover: book.cover?.url,
      slug: book.slug,
      author: {
        name: book.author.name,
        slug: book.author.slug,
      },
    })),
  });
};

export const getBooksPublicDetails: RequestHandler = async (req, res) => {
  const book = await BookModel.findOne({ slug: req.params.slug }).populate<{
    author: PopulatedBooks["author"];
  }>({
    path: "author",
    select: "name slug",
  });

  if (!book)
    return sendErrorResponse({
      status: 404,
      message: "Book not found!",
      res,
    });

  const {
    _id,
    title,
    cover,
    author,
    slug,
    description,
    genre,
    language,
    publishedAt,
    publicationName,
    price: { mrp, sale },
    fileInfo,
  } = book;

  res.json({
    book: {
      id: _id,
      title,
      genre,
      language,
      slug,
      description,
      publicationName,
      fileInfo,
      publishedAt: publishedAt.toISOString().split("T")[0],
      cover: cover?.url,
      price: {
        mrp: (mrp / 100).toFixed(2), // $1 100C/100 = $1
        sale: (sale / 100).toFixed(2), // 1.50
      },
      author: {
        id: author._id,
        name: author.name,
        slug: author.slug,
      },
    },
  });
};

export const getBooksByGenre: RequestHandler = async(req,res) => {
  const books = await BookModel.find({genre:req.params.genre})
  res.json({
    books: books.map((book) => {
       const {
        _id,
        title,
        cover,
        averageRating,
        slug,
        genre,
        price: { mrp, sale },
      } = book;
      return {
        id: _id,
        title,
        genre,
        slug,
        cover: cover?.url,
        rating: averageRating?.toFixed(1),
        price: {
          mrp: (mrp / 100).toFixed(2), // $1 100C/100 = $1
          sale: (sale / 100).toFixed(2), // 1.50
        },
      };
    })
  })
}

export const getCommonBookAccessUrl: RequestHandler = async(req,res) => {
  const { slug } = req.params;

  const book = await BookModel.findOne({ slug });
  if (!book)
    return sendErrorResponse({ res, message: "Book not found!", status: 404 });

  const user = await UserModel.findOne({ _id: req.user.id, books: book._id });
  if (!user)
    return sendErrorResponse({ res, message: "User not found!", status: 404 });

  const history = await HistoryModel.findOne({
    reader: req.user.id,
    book: book._id,
  });

  const settings: LocationHighlights = {
    lastLocation: "",
    highlights: [],
  };

  if (history) {
    settings.highlights = history.highlights.map((h) => ({
      fill: h.fill,
      selection: h.selection,
    }));
    settings.lastLocation = history.lastLocation;
  }

  const bookGetCommand = new GetObjectCommand({
    Bucket: process.env.AWS_PRIVATE_BUCKET,
    Key: book.fileInfo.id,
  });
  const accessUrl = await getSignedUrl(s3Client, bookGetCommand);

  res.json({ settings, url:accessUrl });
}

interface RecommendedBooks {
  id: string;
  title: string;
  genre: string;
  slug: string;
  cover?: string;
  rating?: string;
  price: {
    mrp: string;
    sale: string;
  };
}

export interface AggregationResult {
  _id: ObjectId;
  title: string;
  genre: string;
  price: {
    mrp: number;
    sale: number;
    _id: ObjectId;
  };
  cover?: {
    url: string;
    id: string;
    _id: ObjectId;
  };
  slug: string;
  averageRatings?: number;
}

export const getRecommendedBooks: RequestHandler = async (req, res) => {
  const { bookId } = req.params;

  if (!isValidObjectId(bookId)) {
    return sendErrorResponse({ message: "Invalid book id!", res, status: 422 });
  }

  const book = await BookModel.findById(bookId);
  if (!book) {
    return sendErrorResponse({ message: "Book not found!", res, status: 404 });
  }

  const recommendedBooks = await BookModel.aggregate<AggregationResult>([
    { $match: { genre: book.genre, _id: {$ne: book._id} }},
    {
      $lookup: {
        localField: "_id",
        from: "reviews",
        foreignField: "book",
        as: "reviews",
      },
    },
    {
      $addFields: {
        averageRatings: { $avg: "$reviews.rating" },
      },
    },
    {
      $sort: { averageRatings: -1 },
    },
    {
      $limit: 5,
    },
    {
      $project: {
        _id: 1,
        title: 1,
        slug: 1,
        genre: 1,
        price: 1,
        cover: 1,
        averageRatings: 1,
      },
    },
  ]);

 console.log(JSON.stringify(recommendedBooks, null, 2))

  const result = recommendedBooks.map<RecommendedBooks>((book) => {
  const parsedPrice = JSON.parse(book.price); // convert string to object

  return {
    id: book._id.toString(),
    title: book.title,
    slug: book.slug,
    genre: book.genre,
    price: {
      mrp: parseFloat((parsedPrice.mrp / 100).toFixed(2)),
      sale: parseFloat((parsedPrice.sale / 100).toFixed(2)),
    },
    cover: book.cover?.url,
    rating: parseFloat(book.averageRatings?.toFixed(1)),
  };
});


  res.json(result);
};