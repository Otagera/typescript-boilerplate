import { Response, NextFunction } from 'express';
import { RequestWithDecoded } from '../interfaces';
import { verify } from 'jsonwebtoken';

export const authenticate = (req: RequestWithDecoded, res: Response, next: NextFunction)=>{
	let token = req.headers.authorization;
  if (token) {
    try {
      if(token.startsWith('Bearer ')){
        token = token.split(' ')[1];
      }
      const decodedToken = verify(token, process.env.JWT_KEY);
      req.decoded = decodedToken;
      return next();
    } catch (error) {
      return res.status(401).send({ message: 'Unauthorized request, please provide a valid token.' });
    }
  } else {
    return res.status(401).send({ message: 'Unauthorized request, please login' });
  }
}