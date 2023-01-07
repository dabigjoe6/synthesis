import Joi from "joi";
import JoiObjectId from "joi-objectid";

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
  password: Joi.string().min(8).required(),
  resetPasswordToken: Joi.number().min(4).optional(),
  newPassword: Joi.string().required(),
});

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

const Validators = {
  login,
  register,
  resetPassword,
  changePassword,
  resource,
  getSubscriptions,
  unsubscribe,
};

export const validate = (validator) => {
  if (!Validators.hasOwnProperty(validator)) {
    throw new Error(`${validator} is not a validator`);
  }

  return async function (req, res, next) {
    try {
      const validated = await Validators[validator].validateAsync(req.body);
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
