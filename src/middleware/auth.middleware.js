const jwt = require("jsonwebtoken");
const prisma = require("../prisma/client");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Unauthorized", 401);
  }

  const token = authHeader.split(" ")[1];
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_error) {
    throw new AppError("Invalid token", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    throw new AppError("User not found", 401);
  }

  req.user = user;
  next();
});

module.exports = {
  protect,
};
