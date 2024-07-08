import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { validateRegister, validateLogin } from '../schemas/schemas.js';
import { KanbanDB } from '../model/db-kanban.js';


dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY


export class AuthController {

    static async login (req, res) {

        const validateRequest = validateLogin(req.body)
    
        if (validateRequest.error) {
            return res.status(400).json({ error: JSON.parse(validateRequest.error.message) })
        }
    
        const { username: username, passwd: passwd} = req.body
        
        const {rows: user} = await KanbanDB.searchUser(username)
        if (Object.keys(user).length === 0) { return res.status(401).send('Incorrect username or password') }

        const {rows: pass} = await KanbanDB.getPassword(username)
        if (!await bcrypt.compare(passwd, pass[0].passwd)) { return res.status(401).send('Incorrect username or password')}
    
        const {rows: user_id} = await KanbanDB.getID(username)
    
        const token = jwt.sign( { user_id: user_id[0].id}, 
                                SECRET_KEY, 
                                {
                                    expiresIn: '5h'
                                })
    
        res.cookie('access-token', token, { httpOnly : true, sameSite : 'strict'}).send( { user_id: user_id[0].id, token } )
    }

    static async register (req, res) {

        const validateRequest = validateRegister(req.body)
    
        if (validateRequest.error) {
            return res.status(400).json({ error: JSON.parse(validateRequest.error.message) })
        }
    
        const { username: username, email: email, passwd: passwd} = req.body
    
        const {rows} = await KanbanDB.searchUser(username)
        
        if (rows.length > 0) { return res.status(400).send('User already exist') }
    
        const hashedPasswd = await bcrypt.hash(passwd, 7)
        await KanbanDB.addUser(username, hashedPasswd, email)
        res.send('User created')
    }
    
    static async logout (req, res)  {
        res.clearCookie('access_token').json({message : 'Logout successful'})
    }


}