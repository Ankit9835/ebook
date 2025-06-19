import { UserDoc } from "@/models/user"

type ErrorResponse = {
    res: Response
    status: number
    message:string
}

export const sendErrorResponse = ({
    res,
    status,
    message
}: ErrorResponse) => {
    res.status(status).json({message})
}

export const formatUserProfile = (user: UserDoc): Request['user'] => {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar:user?.avatar?.url,
      signedUp:user.signedUp
    };
  };

