import 'dotenv/config'; 
import  express  from "express";
import userRoutes from "./routes/AllRoutes.js"
import cors from "cors";
import cookieParser from 'cookie-parser'
import logger from "./logger.js"

const app = express();
app.use(express.json());

app.use(cookieParser());
app.use(cors(
  {
    origin: process.env.URL_FRONTEND || "http://localhost:3000",
    credentials: true
  }
));
app.use(userRoutes);
app.use(express.static('public'));

const port = 8000;

app.listen(port, () => {
  logger.info(`Listening on port ${port}`);
});

// Exemplo de logging em rotas e middlewares
app.use((req, res, next) => {
  logger.info(`Request URL: ${req.url} | Method: ${req.method}`);
  next();
});

app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).send('Something went wrong');
});