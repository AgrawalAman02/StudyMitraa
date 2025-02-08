import { Pool } from 'pg';

const pool = new Pool({
    user: 'your_db_user',
    host: 'your_db_host',
    database: 'your_db_name',
    password: 'your_db_password',
    port: 5432,
});

export default {
    query: (text, params) => pool.query(text, params),
};
