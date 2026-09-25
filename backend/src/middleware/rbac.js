const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before permission check',
        data: null
      });
    }

    const userRole = req.user.role;

    // Admin has master access, including Council capabilities
    if (userRole === 'ADMIN') {
      return next();
    }

    if (allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Role '${userRole}' does not have permission to access this resource.`,
      data: null
    });
  };
};

module.exports = { authorizeRoles };
