export const errorHandler = (err, req, res, next) => {
  if (!err.status) {
    res.status(500);
  } else {
    res.status(err.status);
  }
  res.json({
    status: err.status,
    message: err?.message,
    stack: err?.stack,
  });
};
