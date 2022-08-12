import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import UserModel from './models/user.model';
import RefreshModel from './models/refresh.model';
import {
  newUserInterface, loginUserInterface, payloadInterface, userModelInterface, refreshModelInterface,
} from './interfaces/user.interfaces';

async function newUser(
  userInfo: newUserInterface,
): Promise<{ data: userModelInterface, tokens: refreshModelInterface }> {
  const {
    firstname, lastname, email, password,
  } = userInfo;
  const user: userModelInterface | null = await UserModel.findOne({ email });

  if (user) {
    throw new Error('User already exists');
  }

  const newUser: userModelInterface = new UserModel({
    firstname, lastname, email, password,
  });

  await newUser.save();

  const payload: payloadInterface = {
    accessToken: '',
    refreshToken: '',
    _id: newUser._id,
    firstname: newUser.firstname,
  };
  const refresh: refreshModelInterface = new RefreshModel({
    ...payload,
  });
  await refresh.save();

  return {
    data: newUser,
    tokens: refresh,
  };
}

async function getUser(id: string): Promise<userModelInterface | null> {
  const user: userModelInterface | null = await UserModel.findById({ _id: id });
  return user;
}

async function getUsers(): Promise<userModelInterface[]> {
  const users: Array<userModelInterface> | null = await UserModel.find({});
  return users;
}

async function updateUser(
  id: string,
  updates: string[],
  body: newUserInterface,
): Promise<userModelInterface | null> {
  console.log(`body - ${await body}`);
  const user: userModelInterface | null = await UserModel.findById({ _id: id }).exec();
  const refresh: refreshModelInterface | null = await RefreshModel.findById({ _id: id }).exec();
  refresh.firstname = body.firstname;
  updates.forEach((update: string) => {
    user[update] = body[update];
  });
  await refresh.save();
  await user.save();
  return user;
}

async function deleteUser(id: string): Promise<string> {
  const user: userModelInterface | null = await UserModel.findById({ _id: id }).exec();
  const refresh: refreshModelInterface | null = await RefreshModel.findById({ _id: id }).exec();
  if (!user) {
    throw new Error('User not found');
  }
  await user.remove();
  await refresh.remove();
  return 'User deleted';
}

async function loginUser(
  body: loginUserInterface,
): Promise<{ data: userModelInterface | null, tokens: refreshModelInterface | null }> {
  const { email, password } = body;
  const user: userModelInterface | null = await UserModel.findOne({ email }).exec();
  if (!user) {
    throw new Error('User not found');
  }
  const isMatch: Promise<boolean> & void = await bcryptjs.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Incorrect Password, Try again!');
  }
  const refresh: refreshModelInterface | null = await RefreshModel.findById({
    _id: user.id,
  }).exec();
  await refresh.generateAuthToken();
  await refresh.generateRefreshToken();
  await refresh.save();
  return { data: user, tokens: refresh };
}

async function refreshTokenUser(id: string): Promise<refreshModelInterface | null> {
  const tokens: refreshModelInterface | null = await RefreshModel.findById({ _id: id }).exec();
  if (!tokens.refreshToken) {
    throw new Error('No refresh token provided');
  }
  await jwt.verify(tokens.refreshToken, process.env.REFRESH_TOKEN_SECRET);
  await tokens.generateAuthToken();
  await tokens.save();
  return tokens;
}

async function logoutUser(id: string): Promise<string> {
  const user: userModelInterface | null = await UserModel.findById({ _id: id }).exec();
  const tokens: refreshModelInterface | null = await RefreshModel.findById({ _id: id }).exec();
  if (!user) {
    throw new Error('User not found');
  }
  tokens.accessToken = '';
  tokens.refreshToken = '';
  await tokens.save();
  return 'Logout successful';
}

export default {
  newUser,
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  loginUser,
  refreshTokenUser,
  logoutUser,
};
