
import { connect, ResultRecord } from 'ts-postgres';


interface User {
    id: string
    username: string
    passwd: string
    email: string
}

interface ErrorDB {
    message: string;
}

const client = await connect({
    user: 'postgres',
    host: 'localhost',
    password: '123456',
    database: 'kaban',
    port: 5432
});

type Username = Pick<User, 'username'>

export class KanbanDB {
    

    static async searchUser(username: string) : Promise<Username | ErrorDB>{
        try {
            
            
            const data = await client.query(`SELECT username FROM users WHERE username = $1`, [username]);
            if (data.rows.length > 0) {
                return { username: data.rows[0][0] }; 
            } else {
                return { message: 'User not found' }; 
            }

        } catch(e) { 
            const error: ErrorDB = { message: 'Error en la base de datos: ' + e.message };
            return error
    }
}

    // static async getPassword(username) {
    //     try {
    //         return await pool.query(`SELECT passwd FROM users WHERE username = $1`, [username]);
    //     } catch(e) { console.error(e); throw e; }
    // }

    // static async getID(username) {
    //     try {
    //         return await pool.query(`SELECT id FROM users WHERE username = $1`, [username]);
    //     } catch(e) { console.error(e); throw e; }
    // }

    // static async getAllUserSections(value) {
    //     try {
    //         let userData = [];
    //         const sections_id = await pool.query(`SELECT title, id FROM section WHERE user_id = $1`, [value]);
    //         const objPromises = sections_id.rows.map(async (section) => {
    //             const card = await pool.query('SELECT id, title, content FROM cards WHERE section_id = $1', [section.id]);
    //             const cardsWithHtml = card.rows.map(card => ({
    //                 ...card,
    //                 contentHtml: marked(card.content) // Convertir el contenido Markdown a HTML
    //             }));
    //             const obj = { section_id: section.id, section_title: section.title, cards: cardsWithHtml };
    //             userData.push(obj);
    //         });
    //         await Promise.all(objPromises);
    //         return userData;
    //     } catch(e) { console.error(e); throw e; }
    // }

    // static async getUserID(section_id) {
    //     try {
    //         return await pool.query(`SELECT user_id FROM section WHERE id = $1`, [section_id]);
    //     } catch(e) { console.error(e); throw e; }
    // }

    // static async getSectionID(card_id) {
    //     try {
    //         return await pool.query(`SELECT section_id FROM cards WHERE id = $1`, [card_id]);
    //     } catch(e) { console.error(e); throw e; }
    // }

    // static async addSection(title, user_id) {
    //     try {
    //         return await pool.query(`INSERT INTO section (title, user_id) VALUES ($1, $2) RETURNING *`, [title, user_id]);
    //     } catch (e) {
    //         console.error(e);
    //         throw e;
    //     }
    // }

    // static async addCards(title, content, section_id) {
    //     try {
    //         await pool.query(`INSERT INTO cards (title, content, section_id) VALUES ($1, $2, $3)`, [title, content, section_id]);
    //     } catch (e) {
    //         console.error(e);
    //         throw e;
    //     }
    // }

    // static async addUser(username, hashedPasswd, email) {
    //     try {
    //         await pool.query(`INSERT INTO users (username, passwd, email) VALUES ($1, $2, $3)`, [username, hashedPasswd, email]);
    //     } catch (e) {
    //         console.error(e);
    //         throw e;
    //     }
    // }

    // static async deleteSection(section_id) {
    //     try {
    //         return await pool.query(`DELETE FROM section WHERE id = $1 RETURNING *`, [section_id]);
    //     } catch(e) { console.error(e); throw e; }
    // }

    // static async deleteCard(card_id) {
    //     try {
    //         return await pool.query(`DELETE FROM cards WHERE id = $1 RETURNING *`, [card_id]);
    //     } catch(e) { console.error(e); throw e; }
    // }

    // static async updateUser(user_id, {username, email, password}) {
    //     // TO DO: refactorizar esta porqueria usando objetos y carga dinamica de valores en la query
    //     try {
    //         if (username){
    //             await pool.query(`UPDATE users SET username = $1 WHERE id = $2`, [username,user_id]);
    //         }
    //         if (email){
    //             await pool.query(`UPDATE users SET email = $1 WHERE id = $2`, [email, user_id]);
    //         }
    //         if (password){
    //             await pool.query(`UPDATE users SET passwd = $1 WHERE id = $2`, [await bcrypt.hash(password, 7), user_id]);
    //         }     
    //         return await pool.query('SELECT * FROM users WHERE id = $1', [user_id])

    //     } catch(e) { console.error(e); throw e; }
    // }
}


