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
      signedUp:user.signedUp,
      authorId: user?.authorId,
      books: user.book.map(b => b.toString())
    };
  };

  export function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export const sanitizeUrl = (url: string) => {
  return url.replace(/ /g, "%20");
};

