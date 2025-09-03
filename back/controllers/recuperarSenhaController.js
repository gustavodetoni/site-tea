import { db } from '../db.js';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    connectionTimeout: 60000, 
    greetingTimeout: 60000,   
    socketTimeout: 60000,     
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const resetCodes = new Map();

export const recuperarSenhaController = {
    solicitarCodigo: (req, res) => {
        const { email } = req.body;

        const q = "SELECT * FROM users WHERE email = ?";
        db.query(q, [email], (error, results) => {
            if (error) {
                return res.status(500).send({ message: "Erro ao verificar email", error });
            }

            if (results.length === 0) {
                return res.status(404).send({ message: "Email não encontrado" });
            }

            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expires = Date.now() + 5 * 60 * 1000;

            resetCodes.set(email, { code, expires });

            // Email de envio
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Seu Código de Recuperação de Senha",
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2>Recuperação de Senha</h2>
                        <p>Seu código de verificação é:</p>
                        <h1 style="color: #007BFF;">${code}</h1>
                        <p>Este código é válido por 5 minutos.</p>
                    </div>
                `,
            };

            transporter.sendMail(mailOptions, (err) => {
                if (err) {
                    return res.status(500).send({ message: "Erro ao enviar o código", err });
                }
                return res.status(200).send({ message: "Código enviado com sucesso para o email!" });
            });

            setTimeout(() => {
                resetCodes.delete(email);
            }, 5 * 60 * 1000);
        });
    },

    verificarCodigo: (req, res) => {
        const { email, codigo } = req.body;

        const saved = resetCodes.get(email);

        if (!saved) {
            return res.status(400).send({ message: "Código expirado ou inválido" });
        }

        if (saved.expires < Date.now()) {
            resetCodes.delete(email);
            return res.status(400).send({ message: "Código expirado" });
        }

        if (saved.code !== codigo) {
            return res.status(400).send({ message: "Código incorreto" });
        }

        return res.status(200).send({ message: "Código verificado com sucesso" });
    },

    redefinirSenha: (req, res) => {
        const { email, codigo, novaSenha } = req.body;

        const hashedPassword = bcrypt.hashSync(novaSenha, 8);

        const q = "UPDATE users SET senha = ? WHERE email = ?";
        db.query(q, [hashedPassword, email], (error) => {
            if (error) {
              console.error("Erro ao executar a query:", error); // Adicione este log
                return res.status(500).send({ message: "Erro ao redefinir senha", error });
            }

            resetCodes.delete(email);

            return res.status(200).send({ message: "Senha redefinida com sucesso!" });
        });
    }
};
