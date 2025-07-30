import React, { useContext } from 'react'
import { Routes, Route } from "react-router-dom";
import { FC } from "react";
import Container from './components/common/Container';
import Home from './views/Home';
import SignUp from './views/SignUp';
import Verify from './views/Verify';
import NewUser from './views/NewUser';
import { Toaster } from "react-hot-toast";
import Profile from './views/Profile';
import { AuthContext } from './context/AuthProvider';
import UpdateProfile from './views/UpdateProfile';
import Guest from './routes/Guest';
import Private from './routes/Private';
import NewBookForm from './views/NewBookForm';
import UpdateBookForm from './views/UpdateBookForm';



interface Props {}

const App: FC<Props> = () => {
  const { status } = useContext(AuthContext);
   if (status === 'busy') {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/new-user" element={<NewUser />} />
        <Route element={<Guest />}>
          <Route path="/sign-up" element={<SignUp />} />
        </Route>
        <Route element={<Private />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/update-profile" element={<UpdateProfile />} />
          <Route path="/create-book" element={<NewBookForm />} />
          <Route path="/update-book" element={<UpdateBookForm />} />
        </Route>
      </Routes>
      
       <Toaster />
    </Container>
  );
}

export default App
