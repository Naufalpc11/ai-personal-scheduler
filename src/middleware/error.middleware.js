const { ZodError } = require("zod");

const errorHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.errors.map((item) => ({
        path: item.path.join("."),
        message: item.message,
      })),
    });
  }

  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "Duplicate value",
    });
  }

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

const notFoundHandler = (_req, _res, next) => {
  const error = new Error("Route not found");
  error.statusCode = 404;
  next(error);
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
