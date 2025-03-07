import { db } from "../db.js";
import logger from '../logger.js'; // Adicione o import do logger

export const addSchedule = async (req, res) => {
    const { user_id, week_1, week_2, week_3, week_4, week_5, week_6, week_7, week_8, mensagem } = req.body;
    const q = 'INSERT INTO schedules (user_id, week_1, week_2, week_3, week_4, week_5, week_6, week_7, week_8, mensagem) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    logger.info(`Tentando adicionar agenda para o usuário ID: ${user_id}`);

    db.query(q, [user_id, week_1, week_2, week_3, week_4, week_5, week_6, week_7, week_8, mensagem], (error) => {
        if (error) {
            logger.error("Erro ao adicionar agenda:", error);
            return res.status(500).json({ message: "Erro ao adicionar agenda", error });
        }

        logger.info(`Agenda adicionada com sucesso para o usuário ID: ${user_id}`);
        return res.status(200).json('Agenda adicionada com sucesso!');
    });
};

export const editSchedule = async (req, res) => {
    const { week_1, week_2, week_3, week_4, week_5, week_6, week_7, week_8, mensagem, id } = req.body;
    const q = "UPDATE schedules SET `week_1` = ?, `week_2` = ?, `week_3` = ?, `week_4` = ?, `week_5` = ?, `week_6` = ?, `week_7` = ?, `week_8` = ?, `mensagem` = ? WHERE `id` = ?;";

    logger.info(`Tentando editar agenda com ID: ${id}`);

    db.query(q, [week_1, week_2, week_3, week_4, week_5, week_6, week_7, week_8, mensagem, id], (error) => {
        if (error) {
            logger.error("Erro ao editar agenda:", error);
            return res.status(500).json({ message: "Erro ao editar agenda", error });
        }

        logger.info(`Agenda editada com sucesso para ID: ${id}`);
        return res.status(200).json('Agenda editada com sucesso!');
    });
};

export const getSchedules = (req, res) => {
    const userId = req.params.id;

    const q = 'SELECT * FROM schedules WHERE user_id = ?';
    logger.info(`Buscando cronogramas para o usuário ID: ${userId}`);

    db.query(q, [userId], (error, results) => {
        if (error) {
            logger.error("Erro ao buscar cronogramas:", error);
            return res.status(500).json({ message: "Erro ao buscar cronogramas", error });
        }

        if (results.length === 0) {
            logger.warn(`Nenhum cronograma encontrado para o usuário ID: ${userId}`);
            return res.status(404).json('Nenhum cronograma encontrado para o usuário.');
        }

        logger.info(`Cronogramas encontrados para o usuário ID: ${userId}`);
        return res.status(200).json(results);
    });
};