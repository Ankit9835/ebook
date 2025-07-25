import {  Input } from "@heroui/input";
import { Button } from "@heroui/react";
import { FC, useState, FormEventHandler, useEffect } from "react";
import Book from "../svg/Book";
import client from "../api/client";
import { RiMailCheckLine } from "react-icons/ri";
import { parseError } from "../utils/helper";

const validateEmail =  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;


const Signup: FC<Props> = () => {
 const [email,setEmail] = useState('')
 const [isError, setIsError] = useState(false)
 const [busy, setBusy] = useState(false);
 const [showSuccessResponse,setShowSuccessResponse] = useState(false)

 const handleSubmit: FormEventHandler<HTMLFormElement> = async(e) => {
    e.preventDefault()
    if (!validateEmail.test(email)) return setIsError(true)
    setIsError(false)
    setBusy(true);
    try {
        const res = await client.post('/auth/generate-link',{
                        email
                    })
        setShowSuccessResponse(true)
    } catch (error) {
        parseError(error)
    } finally{
        setBusy(false)
    }
    
 }

 if (showSuccessResponse)
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <RiMailCheckLine size={80} className="animate-bounce" />
        <p className="text-lg font-semibold">
          Please check your email we just sent you a magic link.
        </p>
      </div>
    );

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center mt-2 w-96 border-2 p-5 rounded-md">
        <Book className="w-44 h-44" />
        <h1 className="text-center text-xl font-semibold">
          Books are the keys to countless doors. Sign up and unlock your
          potential.
        </h1>

        <form onSubmit={handleSubmit} className="w-full space-y-6 mt-6">
           <Input
            label="Email"
            placeholder="john@email.com"
            variant="bordered"
            isInvalid={isError}
            errorMessage="Invalid email!"
            value={email}
            onValueChange={setEmail}
          />
          <Button isLoading={busy} type="submit" className="w-full">
            Send Me The Link
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Signup
