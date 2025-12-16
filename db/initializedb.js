#! /usr/bin/env node

import 'dotenv/config';
import { Client } from 'pg';
import connectionURL from './connectionURL.js';

const SQL = `
CREATE TABLE IF NOT EXISTS permissions (
permission_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
name VARCHAR (255),
password_hash VARCHAR(64)
);


CREATE TABLE IF NOT EXISTS categories (
category_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
name VARCHAR ( 255 ),
permission_id INTEGER REFERENCES permissions (permission_id)
);

CREATE TABLE IF NOT EXISTS items (
item_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
name VARCHAR ( 255 ),
permission_id INTEGER REFERENCES permissions (permission_id),
category_id INTEGER REFERENCES categories (category_id)
);

INSERT INTO permissions (name, password_hash) 
VALUES
('Admin', '2daadf637e25cdd265c1b441057e5e3303df91d2ac8377d50b651f965ee9ac91'),
('User', '3bc4496530fd98a6d5178ce0357a5b0eca9b76a0c93495e2871549d809cc9384'),
('Guest', NULL);

INSERT INTO categories (name, permission_id) 
VALUES
('Shirts', 1),
('Pants', 1),
('Shoes', 2);

INSERT INTO items (name, permission_id, category_id) 
VALUES
('Red T-Shirt', 1, 1),
('Blue T-Shirt', 1, 1),
('Red Shorts', 1, 2),
('Blue Shorts', 2, 2),
('Red Boots', 2, 3),
('Blue Boots', 2, 3);
`;

async function main() {
    console.log('seeding...');
    const client = new Client({
        connectionString: connectionURL,
    });
    await client.connect();
    await client.query(SQL);
    await client.end();
    console.log('done');
}

main();
