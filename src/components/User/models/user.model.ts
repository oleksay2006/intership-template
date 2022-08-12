import bcryptjs from 'bcryptjs';
import { Schema } from 'mongoose';
import connections from '../../../config/connection';
import { userModelInterface } from '../interfaces/user.interfaces';

const UserSchema: Schema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  token: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  const user: userModelInterface = this;
  if (user.isModified('password')) {
    user.password = await bcryptjs.hash(user.password, 12);
  }
  next();
});

export default connections.model<userModelInterface>('user', UserSchema);
