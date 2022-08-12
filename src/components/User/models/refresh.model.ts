import jwt from 'jsonwebtoken';
import { NextFunction } from 'express';
import { Schema } from 'mongoose';
import connections from '../../../config/connection';
import { refreshModelInterface } from '../interfaces/user.interfaces';

const { JWT_SECRET } = process.env;

const { REFRESH_TOKEN_SECRET } = process.env;

const RefreshSchema: Schema = new Schema({
  accessToken: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
  _id: {
    type: String,
    required: true,
  },
  firstname: {
    type: String,
    required: true,
  },
}, { timestamps: true });

RefreshSchema.pre('save', async (next: NextFunction) => {
  const refresh: refreshModelInterface = this;
  next();
});

RefreshSchema.methods.generateAuthToken = function () {
  const obj: refreshModelInterface = this;
  const secret: string | undefined = JWT_SECRET;
  const token: string = jwt.sign({ _id: obj._id }, secret, {
    expiresIn: '2m',
  });
  obj.accessToken = token;
};

RefreshSchema.methods.generateRefreshToken = function () {
  const obj: refreshModelInterface = this;
  const secret: string | undefined = REFRESH_TOKEN_SECRET;
  const refreshToken: string = jwt.sign({ _id: obj._id }, secret, {
    expiresIn: '10m',
  });
  obj.refreshToken = refreshToken;
};

export default connections.model<refreshModelInterface>('refresh', RefreshSchema);
