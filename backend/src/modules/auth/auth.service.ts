import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/auth';
import { firebaseAuth } from '../../firebase/firebase-admin.provider';
import { CurrentUser } from './interfaces/current-user.interface';

@Injectable()
export class AuthService {
  async verifyToken(token: string): Promise<CurrentUser> {
    try {
      const decoded: DecodedIdToken = await firebaseAuth.verifyIdToken(token);

      return {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name,
      };
    } catch (error) {
      console.error('Error verifying Firebase token:', error);
      throw new UnauthorizedException('Invalid or expired Firebase token');
    }
  }
}
