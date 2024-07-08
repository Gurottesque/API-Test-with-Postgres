"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KanbanDB = exports.pool = void 0;
const pg_1 = __importDefault(require("pg"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
dotenv_1.default.config();
const marked = __importStar(require("marked"));
exports.pool = new pg_1.default.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
});
class KanbanDB {
    static async searchUser(username) {
        try {
            return await exports.pool.query(`SELECT username FROM users WHERE username = $1`, [username]);
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    }
    static async getPassword(username) {
        try {
            return await exports.pool.query(`SELECT passwd FROM users WHERE username = $1`, [username]);
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    }
    static async getID(username) {
        try {
            return await exports.pool.query(`SELECT id FROM users WHERE username = $1`, [username]);
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    }
    static async getAllUserSections(user_id) {
        try {
            let userData = [];
            const sections_id = await exports.pool.query(`SELECT title, id FROM section WHERE user_id = $1`, [user_id]);
            const objPromises = sections_id.rows.map(async (section) => {
                const card = await exports.pool.query('SELECT id, title, content FROM cards WHERE section_id = $1', [section.id]);
                const cardsWithHtml = card.rows.map(card => ({
                    ...card,
                    contentHtml: marked(card.content) // Convertir el contenido Markdown a HTML
                }));
                const obj = { section_id: section.id, section_title: section.title, cards: cardsWithHtml };
                userData.push(obj);
            });
            await Promise.all(objPromises);
            return userData;
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    }
    static async getUserID(section_id) {
        try {
            return await exports.pool.query(`SELECT user_id FROM section WHERE id = $1`, [section_id]);
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    }
    static async getSectionID(card_id) {
        try {
            return await exports.pool.query(`SELECT section_id FROM cards WHERE id = $1`, [card_id]);
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    }
    static async addSection(title, user_id) {
        try {
            return await exports.pool.query(`INSERT INTO section (title, user_id) VALUES ($1, $2) RETURNING *`, [title, user_id]);
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    }
    static async addCards(title, content, section_id) {
        try {
            await exports.pool.query(`INSERT INTO cards (title, content, section_id) VALUES ($1, $2, $3)`, [title, content, section_id]);
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    }
    static async addUser(username, hashedPasswd, email) {
        try {
            await exports.pool.query(`INSERT INTO users (username, passwd, email) VALUES ($1, $2, $3)`, [username, hashedPasswd, email]);
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    }
    static async deleteSection(section_id) {
        try {
            return await exports.pool.query(`DELETE FROM section WHERE id = $1 RETURNING *`, [section_id]);
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    }
    static async deleteCard(card_id) {
        try {
            return await exports.pool.query(`DELETE FROM cards WHERE id = $1 RETURNING *`, [card_id]);
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    }
    static async updateUser(user_id, { username, email, password }) {
        // TO DO: refactorizar esta porqueria usando objetos y carga dinamica de valores en la query
        try {
            if (username) {
                await exports.pool.query(`UPDATE users SET username = $1 WHERE id = $2`, [username, user_id]);
            }
            if (email) {
                await exports.pool.query(`UPDATE users SET email = $1 WHERE id = $2`, [email, user_id]);
            }
            if (password) {
                await exports.pool.query(`UPDATE users SET passwd = $1 WHERE id = $2`, [await bcrypt_1.default.hash(password, 7), user_id]);
            }
            return await exports.pool.query('SELECT * FROM users WHERE id = $1', [user_id]);
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    }
}
exports.KanbanDB = KanbanDB;
