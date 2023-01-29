import Joi from "joi";
import JoiObjectId from "joi-objectid";
import { Request, Response, NextFunction } from "express";

const joiObjectId = JoiObjectId(Joi);

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

//TODO: CREATE STRICT VALIDATION
const register = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const resetPassword = Joi.object({
  email: Joi.string().email().required(),
});

const changePassword = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8),
  resetPasswordToken: Joi.string(),
  newPassword: Joi.string().required(),
}).or("password", "resetPasswordToken");

const resource = Joi.object({
  author: Joi.string().uri().required(),
  email: Joi.string().email().required(),
});

const getSubscriptions = Joi.object({
  email: Joi.string().email().required(),
});

const unsubscribe = Joi.object({
  email: Joi.string().email().required(),
  subscriptionIds: Joi.array().items(joiObjectId()).required(),
});

interface ValidatorsI {
  "login": Joi.ObjectSchema,
  "register": Joi.ObjectSchema,
  "resetPassword": Joi.ObjectSchema,
  "changePassword": Joi.ObjectSchema,
  "resource": Joi.ObjectSchema,
  "getSubscriptions": Joi.ObjectSchema,
  "unsubscribe": Joi.ObjectSchema
}
const Validators: ValidatorsI = {
  login,
  register,
  resetPassword,
  changePassword,
  resource,
  getSubscriptions,
  unsubscribe,
};

export const validate = (validator: keyof ValidatorsI) => {
  if (!Validators.hasOwnProperty(validator)) {
    throw new Error(`${validator} is not a validator`);
  }

  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const validatorObject: Joi.ObjectSchema = Validators[validator];
      const validated = await validatorObject.validateAsync(req.body);
      req.body = validated;
      next();
    } catch (err) {
      return res.status(422).json({
        status: 422,
        message: err.message,
      });
    }
  };
};
