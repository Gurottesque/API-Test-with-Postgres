import { KanbanDB } from './db-kanban.ts';
interface User {
    id: string
    username: string
    passwd: string
    email: string
}
interface ErrorDB {
    message: string;
}

type Username = Pick<User, 'username'>;
 
const result : Username | ErrorDB = await KanbanDB.searchUser("a")

if ('username' in result){
    console.log(result.username)
}
else if ('message' in result){
    console.log(result.message)
}