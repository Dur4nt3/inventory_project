import dbPool from '../pool.js';
import { validateCategoryIdFormat } from './utilities.js';

export async function getItemName(itemId) {
    if (!validateCategoryIdFormat(itemId)) {
        return null;
    }

    const { rows } = await dbPool.query(
        `SELECT name FROM items
        WHERE item_id = ($1)
        `,
        [itemId],
    );

    if (rows.length === 0) {
        return null;
    }

    return rows[0].name;
}

export async function getItemNameAndPermissions(itemId) {
    if (!validateCategoryIdFormat(itemId)) {
        return null;
    }

    let { rows } = await dbPool.query(
        `SELECT items.name AS item, permissions.name AS permission
        FROM items 
        LEFT JOIN permissions
        ON items.permission_id = permissions.permission_id
        WHERE items.item_id = ($1)
        `,
        [itemId],
    );

    if (rows.length === 0) {
        return null;
    }

    const { item, permission } = rows[0];

    return { item, permission };
}

export async function getMatchingItems(categoryId, name) {
    if (!validateCategoryIdFormat(categoryId)) {
        return null;
    }

    // Only match within the same category
    const { rows } = await dbPool.query(
        `SELECT * FROM items
        WHERE category_id = ($1) AND
        name = ($2)
        `,
        [categoryId, name],
    );

    return rows;
}

export async function insertItem(categoryId, name) {
    if (!validateCategoryIdFormat(categoryId)) {
        return null;
    }

    const { rows } = await dbPool.query(
        `SELECT permission_id FROM permissions WHERE name='Guest'
        `,
    );

    let permissionId;

    try {
        permissionId = rows[0]['permission_id'];
    } catch (errors) {
        console.error(
            'Cannot find the ID of the Guest permission, aborting category creation!',
        );
        return;
    }

    await dbPool.query(
        `INSERT INTO items (name, permission_id, category_id) VALUES (($1), ($2), ($3))
        `,
        [name, permissionId, categoryId],
    );
}

export async function validateItemPermissions(itemId, password) {
    if (!validateCategoryIdFormat(itemId)) {
        return null;
    }

    let { rows } = await dbPool.query(
        `SELECT permissions.password_hash AS password
        FROM items 
        LEFT JOIN permissions
        ON items.permission_id = permissions.permission_id
        WHERE items.item_id = ($1)
        `,
        [itemId],
    );

    if (rows.length === 0) {
        // This error will most likely arise as a result of client-side tampering
        console.error('Could not find a matching permission for the category!');
        return 'An unexpected error has occurred please try again later.';
    }

    if (rows[0].password === null) {
        return true;
    }

    if (password === rows[0].password) {
        return true;
    }

    return false;
}

export async function updateItemName(itemId, name) {
    if (!validateCategoryIdFormat(itemId)) {
        return null;
    }

    await dbPool.query(
        `UPDATE items
        SET name = ($1)
        WHERE item_id = ($2)
        `,
        [name, itemId],
    );
}

export async function deleteItem(itemId) {
    if (!validateCategoryIdFormat(itemId)) {
        return null;
    }

    try {
        await dbPool.query(
            `DELETE FROM items
            WHERE item_id = ($1)
            `,
            [itemId],
        );
    } catch (error) {
        console.error('Could not delete category: ', error);
        return;
    }
}
