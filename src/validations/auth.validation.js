import Joi from 'joi';

const passwordRules = Joi.string()
  .min(8)
  .max(108)
  .pattern(/[a-z]/, 'lowercase')
  .pattern(/[A-Z]/, 'uppercase')
  .pattern(/\d/, 'digit')
  .pattern(/[^A-Za-z0-9]/, 'symbol')
  .required()
  .messages({
    'string.min': 'Password must be atleast 8 characters long!',
    'string.pattern.name': 'Password must include atlast one {#name}!',
  });

export const registerSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().allow('').optional(),
    email: Joi.string().email().lowercase().trim().required(),
    password: passwordRules,
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref('password'))
      .messages({
        'any.only': 'Confirm password must match password!',
      }),
  }),
});

export const loginSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().min(8).required(),
  }),
});

export const refreshTokenSchema = Joi.object({
  cookies: Joi.object({
    refreshToken: Joi.string().trim().min(10).required().messages({
      'string.empty': 'Refresh token can not be empty!',
      'any.required': 'Refresh token missing in cookies!',
    }),
  }),
});
