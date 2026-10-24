export const adminOnly = (req, res, next) => {
  // User must already be authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }

  // User must have ADMIN role
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};

export default adminOnly;