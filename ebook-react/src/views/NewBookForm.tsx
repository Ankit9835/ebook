import React, { type FC } from 'react'
import BookForm from '../components/BookForm'
import client from '../api/client';
import axios from 'axios';
import toast from 'react-hot-toast';

const NewBookForm = () => {
  const handleSubmit = async (data: FormData, file: File) => {
    const response = await client.post('/book/create', data)
    if (response.data) {
      axios.put(response.data, file, {
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });

      toast(
        "Congratulations, Your book has been published. It may take some time to reflect the changes.",
        {
          duration: 5000,
        }
      );
    }
  };
  return <BookForm title='Publish New Book' submitBtnTitle='Publish Book' onSubmit={handleSubmit}/>
}

export default NewBookForm
