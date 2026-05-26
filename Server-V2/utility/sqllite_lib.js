import Database from "better-sqlite3";

export function init() {
    try {
        require.resolve("better-sqlite3");
    } catch (err) {
        throw new Error(
            "Per usare questa libreria devi installare better-sqlite3: npm install better-sqlite3"
        );
        return false;
    }
    return true;
}

export function help() {
    console.log(`
                                            $$\\            $$$$$$\\   $$$$$$\\  $$\\
                                            $$ |          $$  __$$\\ $$  __$$\\ $$ |
 $$$$$$$\\  $$$$$$\\  $$$$$$\\$$$$\\   $$$$$$\\  $$ | $$$$$$\\  $$ /  \\__|$$ /  $$ |$$ |
$$  _____| \\____$$\\ $$  _$$  _$$\\ $$  __$$\\ $$ |$$  __$$\\ \\$$$$$$\\  $$ |  $$ |$$ |
\\$$$$$$\\   $$$$$$$ |$$ / $$ / $$ |$$ /  $$ |$$ |$$$$$$$$ | \\____$$\\ $$ |  $$ |$$ |
 \\____$$\\ $$  __$$ |$$ | $$ | $$ |$$ |  $$ |$$ |$$   ____|$$\\   $$ |$$ $$\\$$ |$$ |
$$$$$$$  |\\$$$$$$$ |$$ | $$ | $$ |$$$$$$$  |$$ |\\$$$$$$$\\ \\$$$$$$  |\\$$$$$$ / $$$$$$$$\\
\\_______/  \\_______|\\__| \\__| \\__|$$  ____/ \\__| \\_______| \\______/  \\___$$$\\ \\________|
                                  $$ |                                   \\___|
                                  $$ |
                                  \\__|
`)
    console.log(`                                     
        Welcome in samplerSQL action:
            FUNCTION NAME       WORK                                     PARAMETERS
             init                - init sampleSQL                         ()
             help                - show all command                       ()
             buildDatabase       - build a database                       (path)
             initDatabase        - init a database                        (name_of_database, {index: "TIPE", ...})
             addElement          - add a new element from a database      (name_of_database, {index: "value", ...})
             removeElement       - remove a element from a database       (name_of_database, index, value)
             clearDatabase       - clear a database                       (name_of_database)
             checkDatabase       - found an index and return row          (name_of_database, index, value)
             exists              - search for corrispondece in row        (name_of_database, index, value)
             getAll              - return all the table                   (name_of_database)
             count               - count row                              (name_of_database)
             dropTable           - delete the table                       (name_of_database)
        `)
}

export function buildDatabase(path) {
    return new Database(path);
}

export function initDatabase(database, args) {
    // args = {nome:"TEXT", eta:"INTEGER"}

    const columns = [];

    for (let arg in args) {
        columns.push(`${arg} ${args[arg]}`);
    }

    const query = `
        CREATE TABLE IF NOT EXISTS MAIN (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ${columns.join(", ")}
        )
    `;

    database.prepare(query).run();
}

export function addElement(database, args) {
    // args = {nome:"Mario", eta:20}

    const keys = Object.keys(args);
    const values = Object.values(args);

    const placeholders = keys.map(() => "?").join(",");

    const query = `INSERT INTO MAIN (${keys.join(",")}) VALUES (${placeholders})`;

    database.prepare(query).run(...values);
}

export function removeElement(database, index, value) {
    const query = database.prepare(`DELETE FROM MAIN WHERE ${index} = ?`);
    return query.run(value);
}

export function exists(database, index, value) {
    const query = database.prepare(`SELECT 1 FROM MAIN WHERE ${index} = ? LIMIT 1`);
    return query.get(value) !== undefined;
}

export function verify_double(database, index1, val1, index2, val2){
    const query = database.prepare(
        `SELECT * FROM MAIN WHERE ${index1} = ? AND ${index2} = ? LIMIT 1`
    );
    const found = query.get(val1, val2);
    return found !== undefined; 
}

export function clearDatabase(database) {
    database.prepare("DELETE FROM MAIN").run();
}

export function checkDatabase(database, index, value) {
    const search = database.prepare(`SELECT * FROM MAIN WHERE ${index} = ?`);
    return search.get(value);
}


export function getAll(database) {
    const query = database.prepare("SELECT * FROM MAIN");
    return query.all();

}

export function count(database) {
    const query = database.prepare("SELECT COUNT(*) as total FROM MAIN");
    return query.get().total;
}

export function dropTable(database) {
    database.prepare("DROP TABLE IF EXISTS MAIN").run();
}

export function set_cell(database, filter, data) {
    // filer {indice: value}  data {cella: nuovo value}
    const dataKeys = Object.keys(data).map(key => `${key} = ?`).join(", ");
    const dataValues = Object.values(data);

    const filterKeys = Object.keys(filter).map(key => `${key} = ?`).join(" AND ");
    const filterValues = Object.values(filter);

    const allValues = [...dataValues, ...filterValues];

    const query = `UPDATE MAIN SET ${dataKeys} WHERE ${filterKeys}`;

    return database.prepare(query).run(...allValues);
}