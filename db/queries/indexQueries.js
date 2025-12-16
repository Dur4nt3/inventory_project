import dbPool from '../pool.js';

export async function getAllCategories() {
    const { rows } = await dbPool.query(
        `
        SELECT * FROM categories
        `,
    );
    return rows;
}

export async function getMatchingCategories(name) {
    const { rows } = await dbPool.query(
        `
        SELECT * FROM categories WHERE name = ($1)
        `,
        [name],
    );
    return rows;
}

export async function insertCategory(name) {
    const { rows } = await dbPool.query(
        `
        SELECT permission_id FROM permissions WHERE name='Guest'
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
        `
        INSERT INTO categories (name, permission_id) VALUES (($1), ($2))
        `,
        [name, permissionId],
    );
}
