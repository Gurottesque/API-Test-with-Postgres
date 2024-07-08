import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { KanbanDB } from '../model/db-kanban.js';
import { validate } from 'uuid';
dotenv.config()

const SECRET_KEY = process.env.SECRET_KEY
export class UserController {

    static async checkSession (req, res, next) {
        const token = req.cookies.access_token;
    
        req.session = { user : null}
    
        if (!token) {
            return res.status(403).send('Forbidden request: You are not authorized')
        }

        try {
            const data = jwt.verify(token, SECRET_KEY);
            req.session.user = data;
        } catch (e) { return res.status(401).send('Forbidden request: You are not authorized')}
    
        next()
    }

    static async getUserData  (req, res) {

        const { user_id } = req.session.user
        
        const userData = await KanbanDB.getAllUserSections(user_id)
    
        res.send(userData)
    }

    static async createSection (req, res)  {

        const { user_id } = req.session.user
        const { title } = req.body
    
        // Verificar que title exista
        if (!title) 
            return res.status(400).send("Bad request: missing title field")
        const { rows: sectionAdded } = await KanbanDB.addSection(title, user_id)

        res.send(sectionAdded)
    
    }

    static async deleteSection (req, res)  {
        const { user_id } = req.session.user
        const { section_id } = req.body

        if (!validate(section_id)) return res.status(401).send('Error: Incorrect UUID')

        const section_user_id = await KanbanDB.getUserID(section_id)
    
        if (section_user_id.rows[0] == undefined) 
            return res.status(500).send('Error: This section doesnt exists')
    
        if (section_user_id.rows[0].user_id != user_id) 
            return res.status(403).send('Forbidden request: The section doesnt belong to this user')
    
        
        const {rows: sectionDeleted} = await KanbanDB.deleteSection(section_id)

        res.send(sectionDeleted)
    }

    static async createCard (req, res) {

        const { user_id } = req.session.user
        const { title, content, section_id } = req.body
    
        
        if (!title || !content || !section_id) 
            return res.status(400).send("Bad request: missing fields")
    
        if (!validate(section_id)) return res.status(401).send('Error: Incorrect UUID')
    
        const section_user_id = await KanbanDB.getUserID(section_id)
        if (section_user_id.rows[0].user_id != user_id) 
            return res.status(403).send('Forbidden request: The section doesnt belong to this user')
    
        
        const {rows: cardAdded} = await KanbanDB.addCards(title, content, section_id)

        res.send(cardAdded)
    
    }

    static async deleteCard (req, res) {
        const { user_id } = req.session.user
        const { card_id } = req.body
    
        if (!card_id) 
            return res.status(400).send("Bad request: missing card id field")

        if (!validate(card_id)) return res.status(401).send('Error: Incorrect UUID')
        
        const section_id = await KanbanDB.getSectionID(card_id)
    
        if (section_id.rows[0] == undefined) 
            return res.status(500).send('Error: This card doesnt exists')
    
        const section_user_id = await KanbanDB.getUserID(section_id.rows[0].section_id)
    
        if (section_user_id.rows[0].user_id != user_id) 
            return res.status(403).send('Forbidden request: The section doesnt belong to this user')
     
        const { rows: cardDeleted } = await KanbanDB.deleteCard(card_id)

        res.send(cardDeleted)
    
    }

    static async updateAccount (req, res) {
        const { user_id } = req.session.user;
        const { username, email, password } = req.body;

        const { rows: dataUpdated } = await KanbanDB.updateUser(user_id, {username, email, password})

        res.send(dataUpdated)
    }

}