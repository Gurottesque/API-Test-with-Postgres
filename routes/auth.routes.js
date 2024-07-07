import { Router } from 'express';
import { pool } from '../model/db-kanban.js';
import { validateRegister, validateLogin } from '../schemas/schemas.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
export const authRouter = Router();

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY


authRouter.post('/login', async (req, res) => {

    const validateRequest = validateLogin(req.body)

    if (validateRequest.error) {
        return res.status(400).json({ error: JSON.parse(validateRequest.error.message) })
    }

    const { username: username, passwd: passwd} = req.body

    
    const {rows} = await pool.query('SELECT username FROM users WHERE username = $1', [username])

    
    if (rows.length == 0) { return res.status(401).send('Incorrect username or password') }


    const result = await pool.query('SELECT passwd FROM users WHERE username = $1', [username])
    const usernamePass = result.rows[0].passwd;

    if (usernamePass !== passwd ) { return res.status(401).send('Incorrect username or password')}

    const resultquery = await pool.query('SELECT id FROM users WHERE username = $1', [username])
    const user_id = resultquery.rows[0].id

    const token = jwt.sign( { user_id: user_id}, 
                            SECRET_KEY, 
                            {
                                expiresIn: '5h'
                            })
    console.log(token)
    res.cookie('access-token', token, { httpOnly : true, sameSite : 'strict'}).send( { user_id, token } )
});

authRouter.post('/logout', async (req, res) => {
    res.clearCookie('access_token').json({message : 'Logout successful'})
});

authRouter.post('/register', async (req, res) => {

    const validateRequest = validateRegister(req.body)

    if (validateRequest.error) {
        return res.status(400).json({ error: JSON.parse(validateRequest.error.message) })
    }

    const { username: username, email: email, passwd: passwd} = req.body

    const {rows} = await pool.query('SELECT username FROM users WHERE username = $1', [username])
    
    if (rows.length > 0) { return res.status(400).send('User already exist') }

    const hashedPasswd = await bcrypt.hash(passwd, 7)
    await pool.query('INSERT INTO users (username, passwd, email) VALUES ($1, $2, $3) ', [username, hashedPasswd, email])
    res.send('User created')
});

