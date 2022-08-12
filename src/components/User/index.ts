import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import UserService from './service';
import UserValidation from './validation';
import ValidationError from '../../error/ValidationError';
import {
  newUserInterface, loginUserInterface, payloadInterface, userModelInterface, refreshModelInterface,
} from './interfaces/user.interfaces';

async function newUser(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
  try {
    const validate: Joi.ValidationResult = UserValidation.newUser(req.body);
    if (validate.error) {
      throw new ValidationError(validate.error.details);
    }
    const newUserData: newUserInterface = req.body;
    const data: {
      data: userModelInterface,
      tokens: refreshModelInterface
    } = await UserService.newUser(newUserData);
    res.status(201).send({
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function getUser(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
  try {
    const { id } = req.params;
    const validate: Joi.ValidationResult = UserValidation.getUser(id);
    if (validate.error) {
      throw new ValidationError(validate.error.details);
    }

    const user: userModelInterface | null = await UserService.getUser(id);

    if (!user) {
      throw new Error('User not found');
    }

    res.status(200).send({
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
  try {
    const users: userModelInterface[] = await UserService.getUsers();

    if (!users) {
      throw new Error('Users not found');
    }

    res.status(200).send({
      data: users,
    });
  } catch (error) {
    next(error);
  }
}

async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Response> {
  try {
    const validate: Joi.ValidationResult = UserValidation.updateUser(req.body);
    if (validate.error) {
      throw new ValidationError(validate.error.details);
    }

    const { id } = req.params;
    const updates: string[] = Object.keys(req.body);
    const user: userModelInterface | null = await UserService.updateUser(id, updates, req.body);
    if (!user) {
      throw new Error('User not found');
    }
    res.status(200).send({
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Response> {
  try {
    const validate: Joi.ValidationResult = UserValidation.deleteUser(req.params);
    if (validate.error) {
      throw new ValidationError(validate.error.details);
    }

    const { id } = req.params;
    const result: string = await UserService.deleteUser(id);
    res.status(200).send({
      message: result,
    });
  } catch (error) {
    next(error);
  }
}

async function loginUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Response> {
  try {
    const validate: Joi.ValidationResult = UserValidation.loginUser(req.body);
    if (validate.error) {
      throw new ValidationError(validate.error.details);
    }

    const result: {
      data: userModelInterface | null,
      tokens: refreshModelInterface | null
    } = await UserService.loginUser(req.body);

    res.status(200).send({
      ...result,
      message: 'login successful',
    });
  } catch (error) {
    next(error);
  }
}

async function refreshTokenUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Response> {
  try {
    const validate: Joi.ValidationResult = UserValidation.refreshTokenUser(req.params);
    if (validate.error) {
      throw new ValidationError(validate.error.details);
    }

    const { id } = req.params;
    const tokens: refreshModelInterface | null = await UserService.refreshTokenUser(id);
    res.status(200).send({
      data: tokens,
      message: 'Refresh token successful',
    });
  } catch (error) {
    next(error);
  }
}

async function logoutUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Response> {
  try {
    const validate: Joi.ValidationResult = UserValidation.logoutUser(req.params);
    if (validate.error) {
      throw new ValidationError(validate.error.details);
    }

    const { id } = req.params;
    const result: string = await UserService.logoutUser(id);
    res.status(200).send({
      message: result,
    });
  } catch (error) {
    next(error);
  }
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
