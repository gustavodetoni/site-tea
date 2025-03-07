import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import logger from '../logger.js';
const secretKey = process.env.SECRET_KEY;

export const authController = {
    register: (req, res) => {
        const { user_type_id, especialidade, name, email, phone, child_name, child_gender, child_birthdate, senha } = req.body;

        const qCheckUser = "SELECT * FROM users WHERE email = ?";
        logger.info(`Verificando usuário com email: ${email}`);
        
        db.query(qCheckUser, [email], (error, response) => {
            if (error) {
                logger.error("Erro ao verificar usuário:", error);
                return res.status(500).send({ message: "Erro ao verificar o usuário", error });
            }

            if (response.length > 0) {
                logger.warn(`Usuário já cadastrado com email: ${email}`);
                return res.status(409).send({ message: "Usuário já cadastrado" });
            }

            const hashedPassword = bcrypt.hashSync(senha, 8);
            const qInsertUser = `
                INSERT INTO users (user_type_id, especialidade, name, email, phone, child_name, child_gender, child_birthdate, senha)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const values = [user_type_id, especialidade, name, email, phone, child_name, child_gender, child_birthdate, hashedPassword];

            logger.info(`Cadastrando novo usuário: ${name}`);
            
            db.query(qInsertUser, values, (error) => {
                if (error) {
                    logger.error("Erro ao cadastrar usuário:", error);
                    return res.status(500).json({ message: "Erro ao cadastrar usuário", error });
                }
                logger.info(`Usuário cadastrado com sucesso: ${name}`);
                return res.status(201).send({ message: "Usuário cadastrado com sucesso!" });
            });
        });
    },

    login: (req, res) => {
        const { email, senha } = req.body;
        logger.info(`Tentativa de login para o email: ${email}`);

        const q = "SELECT * FROM users WHERE email = ?";
        db.query(q, [email], (error, response) => {
            if (error) {
                logger.error("Erro no banco de dados durante o login:", error);
                return res.status(500).send({ message: "Erro no banco de dados", error });
            }

            if (response.length === 0) {
                logger.warn(`Usuário não encontrado para o email: ${email}`);
                return res.status(404).send({ message: "Usuário não encontrado!" });
            }

            const user = response[0];
            const isPasswordValid = bcrypt.compareSync(senha, user.senha);

            if (!isPasswordValid) {
                logger.warn(`Senha inválida para o email: ${email}`);
                return res.status(401).send({ message: "Senha inválida!" });
            }

            const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: 86400 });
            logger.info(`Login bem-sucedido para o email: ${email}`);
            return res.status(200).send({ token, message: "Login realizado com sucesso!" });
        });
    },

    verifyToken: (req, res, next) => {
        const token = req.headers['authorization'];

        if (!token) {
            logger.warn("Tentativa de acesso sem token fornecido");
            return res.status(403).send({ message: "Nenhum token fornecido!" });
        }

        const tokenWithoutBearer = token.split(' ')[1];
        logger.info("Verificando token de autenticação");

        jwt.verify(tokenWithoutBearer, secretKey, (err, decoded) => {
            if (err) {
                logger.error("Falha na autenticação do token:", err);
                return res.status(500).send({ message: "Falha na autenticação do token." });
            }

            req.userId = decoded.id;
            logger.info(`Token verificado com sucesso para o usuário ID: ${decoded.id}`);
            next();
        });
    }
};
