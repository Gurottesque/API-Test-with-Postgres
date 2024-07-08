"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const schemas_1 = require("../schemas/schemas");
const db_kanban_1 = require("../model/db-kanban");
dotenv_1.default.config();
const SECRET_KEY = process.env.SECRET_KEY;
class AuthController {
    static async login(req, res) {
        const validateRequest = (0, schemas_1.validateLogin)(req.body);
        if (validateRequest.error) {
            return res.status(400).json({ error: JSON.parse(validateRequest.error.message) });
        }
        const { username: username, passwd: passwd } = req.body;
        const { rows: user } = await db_kanban_1.KanbanDB.searchUser(username);
        if (Object.keys(user).length === 0) {
            return res.status(401).send('Incorrect username or password');
        }
        const { rows: pass } = await db_kanban_1.KanbanDB.getPassword(username);
        if (!await bcrypt_1.default.compare(passwd, pass[0].passwd)) {
            return res.status(401).send('Incorrect username or password');
        }
        const { rows: user_id } = await db_kanban_1.KanbanDB.getID(username);
        const token = jsonwebtoken_1.default.sign({ user_id: user_id[0].id }, SECRET_KEY, {
            expiresIn: '5h'
        });
        res.cookie('access-token', token, { httpOnly: true, sameSite: 'strict' }).send({ user_id: user_id[0].id, token });
    }
    static async register(req, res) {
        const validateRequest = (0, schemas_1.validateRegister)(req.body);
        if (validateRequest.error) {
            return res.status(400).json({ error: JSON.parse(validateRequest.error.message) });
        }
        const { username: username, email: email, passwd: passwd } = req.body;
        const { rows } = await db_kanban_1.KanbanDB.searchUser(username);
        if (rows.length > 0) {
            return res.status(401).send('User already exist');
        }
        const hashedPasswd = await bcrypt_1.default.hash(passwd, 7);
        await db_kanban_1.KanbanDB.addUser(username, hashedPasswd, email);
        res.send('User created');
    }
    static async logout(req, res) {
        res.clearCookie('access_token').json({ message: 'Logout successful' });
    }
}
exports.AuthController = AuthController;
