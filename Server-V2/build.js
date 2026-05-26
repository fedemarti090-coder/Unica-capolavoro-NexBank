import * as BetterSqlite from './utility/sqllite_lib.js';


const user_db = BetterSqlite.buildDatabase('./database/user_logged.db')
const card_db = BetterSqlite.buildDatabase('./database/card.db')

BetterSqlite.clearDatabase(user_db);
BetterSqlite.clearDatabase(card_db)