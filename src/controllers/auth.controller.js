const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/auth.service");

// Mendaftarkan pengguna baru dan mengembalikan token autentikasi.
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({
    success: true,
    message: "Register success",
    data: result,
  });
});

// Melakukan login pengguna dan mengembalikan token autentikasi.
const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json({
    success: true,
    message: "Login success",
    data: result,
  });
});

module.exports = {
  register,
  login,
};
