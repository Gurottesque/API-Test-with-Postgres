import express from 'express';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.routes.js';
import { userRouter } from './routes/user.routes.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const PORT = process.env.PORT ?? 3000;

const app = express();
app.disable('x-powered-by')
app.use(express.json())
app.use(cookieParser())
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)

app.listen(PORT)