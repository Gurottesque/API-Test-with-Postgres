
import { connect, Client } from 'ts-postgres';
import bcrypt from 'bcrypt';



export class KanbanDB {
    
    private static client: Client | null = null;

    private static async getClient(): Promise<Client> {
      
        if (!KanbanDB.client) {
            KanbanDB.client = await connect({
                user: 'postgres',
                host: 'localhost',
                password: '123456',
                database: 'kaban',
                port: 5432
            });
        }
        return KanbanDB.client;
    }
    
    static async searchUser(username: string) : Promise<Username | ErrorDB>{
        try {
          const client = await KanbanDB.getClient(); 
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

    static async getPassword(username: string) : Promise<Password | ErrorDB>{ 
        try {
            const client = await KanbanDB.getClient();

            const data = await client.query(`SELECT passwd FROM users WHERE username = $1`, [username]);
            if (data.rows.length > 0) {
              return { passwd: data.rows[0][0] }; 
          } else {
              return { message: 'Password not found in user' }; 
          }
        } catch(e) { 
          const error: ErrorDB = { message: 'Error en la base de datos: ' + e.message };
          return error
        }

  }

    static async getID(username: string) : Promise<UserID | ErrorDB>{
      try {
          const client = await KanbanDB.getClient();
          const data = await client.query(`SELECT id FROM users WHERE username = $1`, [username]);
          return { id: data.rows[0][0] };

      } catch(e) { 
          const error: ErrorDB = { message: 'Error en la base de datos: ' + e.message };
          return error
        }
    }


    static async getAllUserSections(user_id: string): Promise<UserData | ErrorDB> {
        try {
          const client = await KanbanDB.getClient();
          let userdata: UserData = { sections: [] };
            const sections_id = await client.query(`SELECT title, id FROM section WHERE user_id = $1`, [user_id]);            
            for (const section of sections_id.rows) {
              const cards = await client.query(`SELECT id, title, content FROM cards WHERE section_id = $1`, [section[1]]);
              userdata.sections.push({ id: section[1], title: section[0], user_id: user_id, cards: cards.rows.map(card => ({ id: card[0], title: card[1], content: card[2], section_id: section[1] })) });
            }
            return userdata
        } catch(e) { 
          const error: ErrorDB = { message: 'Error en la base de datos: ' + e.message };
          return error
        }
    }


    static async getUserID(section_id: string) : Promise<UserID | ErrorDB>{
      try {
          const client = await KanbanDB.getClient();
          const data = await client.query(`SELECT user_id FROM sections WHERE id = $1`, [section_id]);
          return { id: data.rows[0][0] };

      } catch(e) { 
          const error: ErrorDB = { message: 'Error en la base de datos: ' + e.message };
          return error
        }
    }

    static async getSectionID(card_id: string) : Promise<SectionID | ErrorDB>{
      try {
          const client = await KanbanDB.getClient();
          const data = await client.query(`SELECT section_id FROM cards WHERE id = $1`, [card_id]);
          return { id: data.rows[0][0] };

      } catch(e) { 
          const error: ErrorDB = { message: 'Error en la base de datos: ' + e.message };
          return error
        }
    }
    static async addSection(title: string, user_id: string): Promise<Section | ErrorDB> {
      try {
        const client = await KanbanDB.getClient();
        const data = await client.query(`INSERT INTO section (title, user_id) VALUES ($1, $2) RETURNING *`, [title, user_id]);
        return { id: data.rows[0][0], title: data.rows[0][1], user_id: data.rows[0][2], cards: [] };
      } catch(e) { 
        const error: ErrorDB = { message: 'Error en la base de datos: ' + e.message };
        return error
      }
    }

    static async addCards(title: string, content: string, section_id: string): Promise<Card | ErrorDB> {
      try {
        const client = await KanbanDB.getClient();
        const data = await client.query(`INSERT INTO cards (title, content, section_id) VALUES ($1, $2, $3) RETURNING *`, [title, content, section_id]);
        return { id: data.rows[0][0], title: data.rows[0][1], content: data.rows[0][2], section_id: data.rows[0][3] };
      } catch (e) {
        const error: ErrorDB = { message: 'Error en la base de datos: ' + e.message };
        return error;
      }
    }

    static async addUser(username: string, hashedPasswd: string, email: string): Promise<User | ErrorDB>{
        try {
            const client = await KanbanDB.getClient();
            const data = await client.query(`INSERT INTO users (username, passwd, email) VALUES ($1, $2, $3) RETURNING *`, [username, hashedPasswd, email]);
            return { id: data.rows[0][0], username: data.rows[0][1], passwd: data.rows[0][2], email: data.rows[0][3] };
        } catch (e) {
          const error: ErrorDB = { message: 'Error en la base de datos: ' + e.message };
          return error;
        }
    }
    static async deleteSection(section_id: string): Promise<Section | ErrorDB>{
      try {
        const client = await KanbanDB.getClient();
        const data = await client.query(`DELETE FROM section WHERE id = $1 RETURNING *`, [section_id]);
        const deletedCards = await client.query(`DELETE FROM cards WHERE section_id = $1 RETURNING *`, [section_id]);
        const cards = deletedCards.rows.map(card => ({ id: card[0], title: card[1], content: card[2], section_id: card[3] }));
        return { id: data.rows[0][0], title: data.rows[0][1], user_id: data.rows[0][2], cards: cards };
      } catch (e) {
        const error: ErrorDB = { message: 'Error en la base de datos: ' + e.message };
        return error;
      }
    }
    static async deleteCard(card_id: string): Promise<Card | ErrorDB> {
      try {
        const client = await KanbanDB.getClient();
        const data = await client.query(`DELETE FROM cards WHERE id = $1 RETURNING *`, [card_id]);
        return { id: data.rows[0][0], title: data.rows[0][1], content: data.rows[0][2], section_id: data.rows[0][3] };
      } catch(e) { console.error(e); throw e; }
    }
    static async updateUser(user_id: string, { username, email, password }: { username?: string, email?: string, password?: string }): Promise<User | ErrorDB> {
      try {
        const client = await KanbanDB.getClient();
        const updates: string[] = [];
        const values: any[] = [];

        if (username) {
          updates.push('username = $1');
          values.push(username);
        }
        if (email) {
          updates.push('email = $2');
          values.push(email);
        }
        if (password) {
          updates.push('passwd = $3');
          values.push(await bcrypt.hash(password, 7));
        }

        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${values.length + 1}`;
        await client.query(query, [...values, user_id]);

        const data = await client.query('SELECT * FROM users WHERE id = $1', [user_id]);
        return { id: data.rows[0][0], username: data.rows[0][1], passwd: data.rows[0][2], email: data.rows[0][3] };
      } catch (e) {
        const error: ErrorDB = { message: 'Error en la base de datos: ' + e.message };
        return error;
      }
    }
}


