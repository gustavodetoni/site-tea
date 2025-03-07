import { db } from "../db.js"
import logger from '../logger.js';

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