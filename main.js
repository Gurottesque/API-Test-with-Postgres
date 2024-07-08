import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { authRouter } from './routes/auth.routes.js';
import { userRouter } from './routes/user.routes.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const PORT = process.env.PORT ?? 3000;

const app = express();

const corsOptions = {
  origin: '*', //Momentaneamente aceptara requests de cualquier lugar
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type'],
};
const publicPath = path.resolve('public');

app.disable('x-powered-by');
app.use(express.json());
app.use(cookieParser());
app.use(express.static(publicPath));
app.use(cors(corsOptions));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.get('/api/documentation', (req, res) => {
  res.sendFile(path.join(publicPath, 'documentation.html'));
});

// Manejo de errores de solicitud malformada y errores internos que no fueron capturados
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).json({ error: 'Solicitud mal formada: JSON inválido' });
    }
    next();
  });

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT)

