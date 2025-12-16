import dbPool from '../pool.js';
import { validateCategoryIdFormat } from './utilities.js';

export async function getCategoryName(categoryId) {
    if (!validateCategoryIdFormat(categoryId)) {
        return null;
    }

    const { rows } = await dbPool.query(
        `SELECT name FROM categories WHERE category_id = ($1)
        `,
        [categoryId],
    );

    if (rows.length === 0) {
        return null;
    }

    return rows[0].name;
}

export async function getCategoryItems(categoryId) {
    if (!validateCategoryIdFormat(categoryId)) {
        return null;
    }

    const { rows } = await dbPool.query(
        `SELECT * FROM items WHERE category_id = ($1)
        `,
        [categoryId],
    );

    const categoryName = await getCategoryName(categoryId);

    if (categoryName === null) {
        return null;
    }

    return { items: rows, categoryTitle: categoryName };
}

export async function getCategoryNameAndPermissions(categoryId) {
    if (!validateCategoryIdFormat(categoryId)) {
        return null;
    }

    let { rows } = await dbPool.query(
        `SELECT categories.name AS category, permissions.name AS permission
        FROM categories 
        LEFT JOIN permissions
        ON categories.permission_id = permissions.permission_id
        WHERE categories.category_id = ($1)
        `,
        [categoryId],
    );

    if (rows.length === 0) {
        return null;
    }

    const { category } = rows[0];
    const { permission } = rows[0];

    return { category, permission };
}

export async function validateCategoryPermissions(categoryId, password) {
    if (!validateCategoryIdFormat(categoryId)) {
        return null;
    }

    let { rows } = await dbPool.query(
        `SELECT permissions.password_hash AS password
        FROM categories 
        LEFT JOIN permissions
        ON categories.permission_id = permissions.permission_id
        WHERE categories.category_id = ($1)
        `,
        [categoryId],
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

export async function updateCategoryName(name, categoryId) {
    if (!validateCategoryIdFormat(categoryId)) {
        return null;
    }

    await dbPool.query(
        `UPDATE categories
        SET name = ($1)
        WHERE category_id = ($2)
        `,
        [name, categoryId],
    );
}

export async function deleteCategory(categoryId) {
    if (!validateCategoryIdFormat(categoryId)) {
        return null;
    }

    // Delete all items associated with a category
    // This is required due to foreign key constraints
    try {
        await dbPool.query(
            `DELETE FROM items
            WHERE category_id = ($1)
            `,
            [categoryId],
        );

        await dbPool.query(
            `DELETE FROM categories
            WHERE category_id = ($1)
            `,
            [categoryId],
        );
    } catch (error) {
        console.error('Could not delete category: ', error);
        return;
    }
}
