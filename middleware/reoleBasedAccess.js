const roleBasedAccess = (role) => {
  return (req, res, next) => {
    // console.log("role::", role, "decode role::", req.decoded.role);
    if (!role.includes(req.decoded.role)) {
      res.send({
        message: "You are not allowed to access this route",
      });
      return;
    }
    next();
  };
};

module.exports = roleBasedAccess;
