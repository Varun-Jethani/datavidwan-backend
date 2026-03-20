const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    return res.status(err.statusCode || err.code || 500).json({
      success: false,
      message: err.message || "An error occurred",
    });
  }
};

export default asyncHandler;
