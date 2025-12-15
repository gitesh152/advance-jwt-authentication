export const profile = async (req, res, next) => {
  try {
    /** Return the identity by the authenticate middleware */
    return res.status(200).json({
      message: 'User Info',
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};
