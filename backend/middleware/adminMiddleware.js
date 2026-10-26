/**
 * Middleware to restrict access to administrators.
 * Must be preceded by authMiddleware in the route chain.
 */
function adminMiddleware(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: "Please log in to continue",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied: admin privileges required",
    });
  }

  return next();
}
module.exports = adminMiddleware;
