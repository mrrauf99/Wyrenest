const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

export const accessCookieOptions = {
  ...baseCookieOptions,
  maxAge: 15 * 60 * 1000, 
};

export const refreshCookieOptions = {
  ...baseCookieOptions,
  maxAge: 10 * 24 * 60 * 60 * 1000, 
};
