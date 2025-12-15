/**
 * Middleware for validating requests body
 */

const requestBodyValidation = (schema) => (req, res, next) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      message: 'Request body must be valid JSON object!',
    });
  }

  const { error, value } = schema.validate(req.body, {
    allowUnknown: true,
    stripUnknown: true,
    abortEarly: false,
  });

  if (error) {
    return next(error);
  }

  req.body =
    value; /** No unvalidated fields or unwanted value leak to the app */
  next();
};

export default requestBodyValidation;
