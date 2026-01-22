const errorHandler = (err, req, res, next) => {
  console.error(err);

  res.status(err.status || 400).json({
    success: false,
    message: err.message || "Something went wrong",
  });
};

export default errorHandler;
