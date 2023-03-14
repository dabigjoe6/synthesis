import Joi from "joi";
import JoiObjectId from "joi-objectid";
import { Request, Response, NextFunction } from "express";
import { FrequencyType, WeekDays } from "../../models/users.js";

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

const saveAuthorsPosts = Joi.object({
  posts: Joi.array().required(),
  source: Joi.string().required(),
})

const markSeenResources = Joi.object({
  userId: joiObjectId().required(),
  seenResources: Joi.array().items(joiObjectId()).required(),
})

const updateResourceSummary = Joi.object({
  resources: Joi.array().required(),
})

const syncResources = Joi.object({
  posts: Joi.array().required(),
  authorId: joiObjectId().required(),
})

const pauseDigest = Joi.object({
  userId: joiObjectId().required(),
});

const resumeDigest = Joi.object({
  userId: joiObjectId().required(),
});


const setDigestFrequency = Joi.object({
  frequencyType: Joi.string().valid(...(Object.values(FrequencyType).filter(value => typeof value === 'string'))).required(),
  time: Joi.array().required(), // TODO: Make this validation more strict
  days: Joi.array().items(Joi.string().valid(...(Object.values(WeekDays).filter(value => typeof value === 'string'))))
    .when('frequencyType', { is: 'weekly', then: Joi.required() })
});


interface ValidatorsI {
  "login": Joi.ObjectSchema,
  "register": Joi.ObjectSchema,
  "resetPassword": Joi.ObjectSchema,
  "changePassword": Joi.ObjectSchema,
  "resource": Joi.ObjectSchema,
  "getSubscriptions": Joi.ObjectSchema,
  "unsubscribe": Joi.ObjectSchema,
  "saveAuthorsPosts": Joi.ObjectSchema,
  "markSeenResources": Joi.ObjectSchema,
  "updateResourceSummary": Joi.ObjectSchema,
  "syncResources": Joi.ObjectSchema,
  "pauseDigest": Joi.ObjectSchema,
  "resumeDigest": Joi.ObjectSchema,
  "setDigestFrequency": Joi.ObjectSchema,
}
const Validators: ValidatorsI = {
  login,
  register,
  resetPassword,
  changePassword,
  resource,
  getSubscriptions,
  unsubscribe,
  saveAuthorsPosts,
  markSeenResources,
  updateResourceSummary,
  syncResources,
  pauseDigest,
  resumeDigest,
  setDigestFrequency
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
