const jwt = require("jsonwebtoken");

const authorization = (roles) => (req, res, next) => {
  let token = req.get("Authorization")


  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Authorization header missing!" });

  if (token.startsWith("Bearer")) {
    token = token?.split(" ")[1];
  }


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    if(roles?.includes(decoded.role)){
         next();
    }
 
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = authorization;
