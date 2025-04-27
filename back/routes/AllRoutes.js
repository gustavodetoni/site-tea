import  express  from "express";
import { addSchedule, editSchedule, getSchedules } from "../controllers/cronograma.js";
import { acceptFriendRequest, askNewAmizade, countAmizades, getPendingFriendRequests, getPatients, getFriendships, declineAmizade} from "../controllers/amizades.js";
import { authController } from "../controllers/autenticacaoController.js";
import { getUser, updateUser } from "../controllers/usuario.js";
import { contatoEmail } from "../controllers/enviarEmail.js";
import { recuperarSenhaController } from "../controllers/recuperarSenhaController.js";

const router = express.Router()

router
    .route('/api/register')
    .post(authController.register)

router
    .route('/api/login')
    .post(authController.login)
    
router
    .route('/api/usuario/:id')
    .get(authController.verifyToken, getUser)
    .put(authController.verifyToken, updateUser)

router
    .route('/api/cronograma')
    .post(authController.verifyToken, addSchedule)
    .put(authController.verifyToken, editSchedule)

router
    .route('/api/cronograma/:id')
    .get(authController.verifyToken, getSchedules)

router
    .route('/api/request')
    .post(authController.verifyToken, askNewAmizade)
    
router
    .route('/api/request/:id')
    .delete(authController.verifyToken, declineAmizade)

router
    .route('/api/pacientes')
    .get(authController.verifyToken, getPatients)
    .post(authController.verifyToken, acceptFriendRequest)
    
router
    .route('/api/pacientes/:id')
    .get(authController.verifyToken, getPendingFriendRequests)

router
    .post('/api/contato', contatoEmail);

router
    .post('/api/recuperar-senha', recuperarSenhaController.solicitarCodigo);

router
    .post('/api/verificar-codigo', recuperarSenhaController.verificarCodigo);

router
    .post('/api/redefinir-senha', recuperarSenhaController.redefinirSenha);

export default router