const AppError = require("../utils/appError");
const { supabaseAdmin, supabaseAuth } = require("../supabase/client");

const mapUserProfile = (profile) => ({
  id: profile.id,
  name: profile.username,
  email: profile.email,
  createdAt: profile.created_at,
});

const ensureProfile = async (user, name) => {
  const { data: existingProfile, error: selectError } = await supabaseAdmin
    .from("users")
    .select("id, username, email, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) {
    throw new AppError(selectError.message, 500);
  }

  if (existingProfile) {
    return existingProfile;
  }

  const fallbackName = name || user.user_metadata?.name || user.email?.split("@")[0] || "user";
  const { data: newProfile, error: insertError } = await supabaseAdmin
    .from("users")
    .insert({
      id: user.id,
      username: fallbackName,
      email: user.email,
    })
    .select("id, username, email, created_at")
    .single();

  if (insertError) {
    throw new AppError(insertError.message, 500);
  }

  return newProfile;
};

const register = async ({ name, email, password }) => {
  const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (authError) {
    throw new AppError(authError.message, 400);
  }

  if (!authData.user) {
    throw new AppError("Signup requires email confirmation", 400);
  }

  const profile = await ensureProfile(authData.user, name);

  return {
    user: mapUserProfile(profile),
    token: authData.session?.access_token || null,
  };
};

const login = async ({ email, password }) => {
  const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    throw new AppError("Invalid credentials", 401);
  }

  const profile = await ensureProfile(authData.user);

  return {
    user: mapUserProfile(profile),
    token: authData.session?.access_token || null,
  };
};

module.exports = {
  register,
  login,
};
