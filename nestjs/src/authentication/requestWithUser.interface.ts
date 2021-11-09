import { Request } from 'express';
import User from 'src/users/models/user.entity';


interface RequestWithUser extends Request {
  user: User;
}

export default RequestWithUser;