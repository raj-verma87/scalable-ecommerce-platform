import axios from 'axios';
import jwt, {JwtPayload} from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';


let publicKey: string | null = null;

const fetchPublicKey = async () =>{
    if(!publicKey){
        const { data } = await axios.get('http://localhost:5001/api/auth/public-key', {
      responseType: 'text'});

       // Replace escaped newlines (\n) with real ones
        publicKey = data.replace(/\\n/g, '\n');

    }
    return publicKey;
};

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if(!token) return res.status(401).json({message: 'No token provided'});

    try{
        const pubKey = await fetchPublicKey();
         
        if (!pubKey) throw new Error('Public key is not available');
        const decoded = jwt.verify(token, pubKey, {algorithms: ['RS256']});

        if (typeof decoded === 'string') {
            return res.status(403).json({ message: 'Invalid token payload format' });
        }
        req.user = decoded as JwtPayload & { id?: string };
        console.log("user authenticated successfylly");
        next();
    }catch(err) {
        return res.status(403).json({message: 'Invalid or expired token'});
    }
};

