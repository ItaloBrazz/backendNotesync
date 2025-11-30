const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const getUsuario = () => {
  return require("../models/Usuario");
};

module.exports = {
  register: async (req, res) => {
    try {
      const { nome, email, senha } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
      }

      const Usuario = getUsuario();
      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({ error: "Email já cadastrado" });
      }

      const senhaHash = await bcrypt.hash(senha, 10);
      const role = email.endsWith("@admin.com") ? "admin" : "user";

      const novoUsuario = await Usuario.create({ nome, email, senha: senhaHash, role });

      const token = jwt.sign(
        { id: novoUsuario.id, role: novoUsuario.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      const usuarioSemSenha = novoUsuario.toJSON();
      delete usuarioSemSenha.senha;

      res.status(201).json({ usuario: usuarioSemSenha, token });
    } catch (error) {
      console.error("Erro no registro:", error);
      res.status(500).json({ error: "Erro interno no servidor" });
    }
  },

  login: async (req, res) => {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ error: "Email e senha são obrigatórios" });
      }

      const Usuario = getUsuario();
      const usuario = await Usuario.findOne({ where: { email } });
      if (!usuario) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
      if (!senhaCorreta) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      const token = jwt.sign(
        { id: usuario.id, role: usuario.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      const usuarioSemSenha = usuario.toJSON();
      delete usuarioSemSenha.senha;

      res.json({ usuario: usuarioSemSenha, token });
    } catch (error) {
      console.error("Erro no login:", error);
      res.status(500).json({ error: "Erro interno no servidor" });
    }
  },

  verifyToken: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      
      if (!token) {
        return res.status(401).json({ error: "Token não fornecido" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.json({ valid: true, user: decoded });
    } catch (error) {
      res.status(401).json({ valid: false, error: "Token inválido" });
    }
  },
};

