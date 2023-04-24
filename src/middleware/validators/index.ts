import Joi from "joi";
import JoiObjectId from "joi-objectid";
import { Request, Response, NextFunction } from "express";
import { FrequencyType, WeekDays } from "../../models/users.js";

const joiObjectId = JoiObjectId(Joi);

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});


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

const updateResourceSummaryAndReadLength = Joi.object({
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

const details = Joi.object({
  userId: joiObjectId().required(),
})


const setDigestFrequency = Joi.object({
  frequencyType: Joi.string().valid(...(Object.values(FrequencyType).filter(value => typeof value === 'string'))).required(),
  time: Joi.array().items(Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).messages({
    'string.pattern.base': 'The time must be in the format "HH:mm", where HH is between 00 and 24 and mm is between 00 and 59'
  })).required(),
  days: Joi.array().items(Joi.string().valid(...(Object.values(WeekDays).filter(value => typeof value === 'string'))))
    .when('frequencyType', { is: 'weekly', then: Joi.required() }),
  timeZone: Joi.string().required()
});


const enableSummary = Joi.object({
  userId: joiObjectId().required(),
});

const disableSummary = Joi.object({
  userId: joiObjectId().required(),
})


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
  "updateResourceSummaryAndReadLength": Joi.ObjectSchema,
  "syncResources": Joi.ObjectSchema,
  "pauseDigest": Joi.ObjectSchema,
  "resumeDigest": Joi.ObjectSchema,
  "setDigestFrequency": Joi.ObjectSchema,
  "enableSummary": Joi.ObjectSchema,
  "disableSummary": Joi.ObjectSchema,
  "details": Joi.ObjectSchema
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
  updateResourceSummaryAndReadLength,
  syncResources,
  pauseDigest,
  resumeDigest,
  setDigestFrequency,
  enableSummary,
  disableSummary,
  details
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
