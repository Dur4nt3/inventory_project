import { Pool } from 'pg';
import connectionURL from './connectionURL.js';

const dbPool = new Pool({
    connectionString: connectionURL,
});

export default dbPool;
