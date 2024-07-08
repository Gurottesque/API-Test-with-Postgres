"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_kanban_1 = require("../model/db-kanban");
const uuid_1 = require("uuid");
dotenv_1.default.config();
const SECRET_KEY = process.env.SECRET_KEY;
class UserController {
    static async checkSession(req, res, next) {
        const token = req.cookies.access_token;
        req.session = { user: null };
        if (!token) {
            return res.status(403).send('Forbidden request: You are not authorized');
        }
        try {
            const data = jsonwebtoken_1.default.verify(token, SECRET_KEY);
            req.session.user = data;
        }
        catch (e) {
            return res.status(401).send('Forbidden request: You are not authorized');
        }
        next();
    }
    static async getUserData(req, res) {
        const { user_id } = req.session.user;
        const userData = await db_kanban_1.KanbanDB.getAllUserSections(user_id);
        res.send(userData);
    }
    static async createSection(req, res) {
        const { user_id } = req.session.user;
        const { title } = req.body;
        // Verificar que title exista
        if (!title)
            return res.status(400).send("Bad request: missing title field");
        const { rows: sectionAdded } = await db_kanban_1.KanbanDB.addSection(title, user_id);
        res.status(201).send(sectionAdded);
    }
    static async deleteSection(req, res) {
        const { user_id } = req.session.user;
        const { section_id } = req.body;
        if (!(0, uuid_1.validate)(section_id))
            return res.status(401).send('Error: Incorrect UUID');
        const section_user_id = await db_kanban_1.KanbanDB.getUserID(section_id);
        if (section_user_id.rows[0] == undefined)
            return res.status(500).send('Error: This section doesnt exists');
        if (section_user_id.rows[0].user_id != user_id)
            return res.status(403).send('Forbidden request: The section doesnt belong to this user');
        const { rows: sectionDeleted } = await db_kanban_1.KanbanDB.deleteSection(section_id);
        res.send(sectionDeleted);
    }
    static async createCard(req, res) {
        const { user_id } = req.session.user;
        const { title, content, section_id } = req.body;
        if (!title || !content || !section_id)
            return res.status(400).send("Bad request: missing fields");
        if (!(0, uuid_1.validate)(section_id))
            return res.status(401).send('Error: Incorrect UUID');
        const section_user_id = await db_kanban_1.KanbanDB.getUserID(section_id);
        if (section_user_id.rows[0].user_id != user_id)
            return res.status(403).send('Forbidden request: The section doesnt belong to this user');
        const { rows: cardAdded } = await db_kanban_1.KanbanDB.addCards(title, content, section_id);
        res.status(201).send(cardAdded);
    }
    static async deleteCard(req, res) {
        const { user_id } = req.session.user;
        const { card_id } = req.body;
        if (!card_id)
            return res.status(400).send("Bad request: missing card id field");
        if (!(0, uuid_1.validate)(card_id))
            return res.status(401).send('Error: Incorrect UUID');
        const section_id = await db_kanban_1.KanbanDB.getSectionID(card_id);
        if (section_id.rows[0] == undefined)
            return res.status(500).send('Error: This card doesnt exists');
        const section_user_id = await db_kanban_1.KanbanDB.getUserID(section_id.rows[0].section_id);
        if (section_user_id.rows[0].user_id != user_id)
            return res.status(403).send('Forbidden request: The section doesnt belong to this user');
        const { rows: cardDeleted } = await db_kanban_1.KanbanDB.deleteCard(card_id);
        res.send(cardDeleted);
    }
    static async updateAccount(req, res) {
        const { user_id } = req.session.user;
        const { username, email, password } = req.body;
        const { rows: dataUpdated } = await db_kanban_1.KanbanDB.updateUser(user_id, { username, email, password });
        res.send(dataUpdated);
    }
}
exports.UserController = UserController;
