import { db } from "../db.js"
import logger from '../logger.js';
import bcrypt from 'bcryptjs';

export const getUser = (req, res) => {
    const id = req.params.id;
    const query = `SELECT * from users WHERE id = ?;`;

    logger.info(`Tentando buscar usuário com ID: ${id}`);

    db.query(query, [id], (error, results) => {
        if (error) {
            logger.error("Erro ao buscar usuário:", error);
            return res.status(500).json({ message: 'Erro ao buscar usuário', error });
        }

        if (results.length === 0) {
            logger.warn(`Nenhum usuário encontrado com ID: ${id}`);
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        logger.info(`Usuário encontrado com ID: ${id}`);
        return res.status(200).json(results);
    });
};

export const updateUser = (req, res) => {
    const { id } = req.params; // Pegando o ID do usuário da URL
    const { name, email, phone, birthdate, child_name, child_gender, child_birthdate, especialidade, cpf, senha } = req.body;

    // Verifica se a senha foi fornecida, caso contrário, não muda a senha no banco
    let updateFields = [
        name, email, phone, birthdate, child_name, child_gender, child_birthdate, especialidade, cpf
    ];

    let query = `UPDATE users SET name = ?, email = ?, phone = ?, birthdate = ?, child_name = ?, child_gender = ?, child_birthdate = ?, especialidade = ?, cpf = ?`;
    
    if (senha) {
        // Se a senha foi fornecida, deve ser criptografada
        const hashedPassword = bcrypt.hashSync(senha, 8);
        updateFields.push(hashedPassword);
        query += ", senha = ?";
    }

    query += " WHERE id = ?"; // Condição para a atualização (somente para o usuário com o ID correspondente)

    updateFields.push(id);

    logger.info(`Tentando atualizar usuário com ID: ${id}`);

    db.query(query, updateFields, (error, results) => {
        if (error) {
            logger.error("Erro ao atualizar usuário:", error);
            return res.status(500).json({ message: 'Erro ao atualizar usuário', error });
        }

        if (results.affectedRows === 0) {
            logger.warn(`Nenhum usuário encontrado com ID: ${id}`);
            return res.status(404).json({ message: 'Usuário não encontrado para atualização.' });
        }

        logger.info(`Usuário com ID: ${id} atualizado com sucesso`);
        return res.status(200).json({ message: 'Usuário atualizado com sucesso' });
    });
};