import { Document, ObjectId } from 'mongoose';

export interface newUserInterface {
  firstname: string;
  lastname: string;
  email: string;
  password: number;
}

export interface loginUserInterface {
  email: string;
  password: number;
}

export interface payloadInterface {
  accessToken: string;
  refreshToken: string;
  _id: ObjectId;
  firstname: string;
}

export interface userModelInterface extends Document {
  _id: ObjectId;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  token?: string;
  refreshToken?: string;
}

export interface refreshModelInterface extends Document {
  accessToken: string;
  refreshToken: string;
  _id: string;
  firstname: string;
  generateAuthToken(): void;
  generateRefreshToken(): void;
}
