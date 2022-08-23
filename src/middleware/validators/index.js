import Joi from "joi";

const medium = Joi.object({
  author: Joi.string().uri().required(),
  email: Joi.string().email().required(),
});

const Validators = {
  medium,
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
