/**
 * Middleware for validating requests
 */

const requestValidation = (schema) => (req, _res, next) => {
  const { error, value } = schema.validate(
    {
      body: req.body || {},
      params: req.params || {},
      query: req.query || {},
      cookies: req.cookies || {},
    },
    {
      allowUnknown: true,
      stripUnknown: true,
      abortEarly: false,
    },
  );

  if (error) {
    return next(error);
  }

  /** No unvalidated fields or unwanted value leak to the app */
  if (value.body) {
    req.body = value.body;
  }
  if (value.params) {
    req.params = value.params;
  }
  if (value.query) {
    req.query = value.query;
  }
  if (value.cookies) {
    req.cookies = value.cookies;
  }

  next();
};

export default requestValidation;
