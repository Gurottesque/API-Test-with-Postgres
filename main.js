import express from 'express';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.routes.js';
import { userRouter } from './routes/user.routes.js';

dotenv.config();

const PORT = process.env.PORT || 12600;

const app = express();

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)

app.listen(PORT)