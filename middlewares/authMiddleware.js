const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ 
      error: "Acesso negado", 
      message: "Token não fornecido" 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // ou req.userId = decoded.id
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: "Token expirado", 
        message: "Faça login novamente" 
      });
    }
    return res.status(403).json({ 
      error: "Token inválido" 
    });
  }
};

// Exportar como default E nomeado
module.exports = authenticateToken;
module.exports.authenticateToken = authenticateToken;