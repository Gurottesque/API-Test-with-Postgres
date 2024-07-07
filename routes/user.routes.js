import { Router } from 'express';
import { pool } from '../model/db-kanban.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config()

const SECRET_KEY = process.env.SECRET_KEY
export const userRouter = Router();


// TO DO: 

/* MODULARIZACION
   DEVOLVER DATOS CORRECTOS
   ERROR HANDLING DESDE BASE DE DATOS

*/


// SACAR TODA LA INFO DEL USUARIO PARA LA PRIMERA RENDERIZACION
// Entra -> Body con access token
// Sale -> Json con informacion:
/*
    {

        {
            title : 'Title-section',
            cards :
                {
                    {
                        title : 'Title-card',
                        content: 'Content-card'
                    }
                    {
                        title : 'Title-card',
                        content: 'Content-card'
                    }
                }
        
        },


    }

*/

userRouter.use((req, res, next) => {
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
})
userRouter.get('/', async (req, res) => {

    const { user_id } = req.session.user
    const result = await pool.query('SELECT id FROM section WHERE user_id = $1', [user_id])


    //Acceder a todos los datos y armar el json

});


/* POST /section
    Ingresar una seccion en la base de datos, ligada a la id del usuario

    Entra -> token session, titulo de la seccion
    Sale -> Informacion json del usuario actualizada

*/
userRouter.post('/section', async (req, res) => {

    const { user_id } = req.session.user
    const { title } = req.body

    if (!title) 
        return res.status(400).send("Bad request: missing title field")
    
    await pool.query('INSERT INTO section (title, user_id) VALUES ($1, $2)', [title, user_id])
    res.send('Section created')

});

/*
    DELETE /section
    Eliminamos una seccion de la base de datos ligada a un usuario

    Entra-> Token de sesion, id de la seccion a eliminar
    Sale-> datos actualizados

*/
userRouter.delete('/section', async (req, res) => {
    const { user_id } = req.session.user
    const { section_id } = req.body

    const section_user_id = await pool.query('SELECT user_id FROM section WHERE id = $1', [section_id])
    
    if (section_user_id.rows[0].user_id != user_id) 
        return res.status(403).send('Forbidden request: The section doesnt belong to this user')

    await pool.query('DELETE FROM section WHERE id = $1', [section_id])
    res.send('Section deleted')
})


/*
    POST /card
    Crea una entrada de carta en la base de datos basado en la id del usuario y la id de la seccion

    Entra-> token de sesion, body con la info de la carta, section id
*/
userRouter.post('/card', async (req, res) => {

    const { user_id } = req.session.user
    const { title, content, section_id } = req.body

    if (!title || !content || !section_id) 
        return res.status(400).send("Bad request: missing fields")


    const section_user_id = await pool.query('SELECT user_id FROM section WHERE id = $1', [section_id])
    if (section_user_id.rows[0].user_id != user_id) 
        return res.status(403).send('Forbidden request: The section doesnt belong to this user')


    await pool.query('INSERT INTO cards (title, content, section_id) VALUES ($1, $2, $3)', [title, content, section_id])
    res.send('Card created')

});


/*
    DELETE /card
    Elimina una entrada de la carta en la base de datos

    Entra -> token sesion, carta id
    Sale -> informacion actualizada
*/
userRouter.delete('/card', async (req, res) => {
    const { user_id } = req.session.user
    const { card_id } = req.body

    if (!card_id) 
        return res.status(400).send("Bad request: missing card id field")

        
    const section_id = await pool.query('SELECT section_id FROM cards WHERE id = $1', [card_id])
    const user_id_section = await pool.query('SELECT user_id FROM section WHERE id = $1', [section_id.rows[0].section_id])
    if (user_id_section.rows[0].user_id != user_id) 
        return res.status(403).send('Forbidden request: The section doesnt belong to this user')


    await pool.query('DELETE FROM cards WHERE id = $1', [card_id])
    res.send('Card deleted')

})
