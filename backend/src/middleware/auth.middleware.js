const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { supabaseAdmin } = require("../supabase/client");

const protect = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Unauthorized", 401);
  }

  const token = authHeader.split(" ")[1];
  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);

  if (authError || !authData.user) {
    throw new AppError("Invalid token", 401);
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("users")
    .select("id, username, email")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError) {
    throw new AppError(profileError.message, 500);
  }

  if (!profile) {
    throw new AppError("User profile not found", 401);
  }

  req.user = {
    id: profile.id,
    name: profile.username,
    email: profile.email,
  };

  next();
});

module.exports = {
  protect,
};
