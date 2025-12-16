import { validationResult, matchedData } from 'express-validator';

import { getCategoryName } from '../db/queries/categoryQueries.js';
import {
    getItemName,
    getItemNameAndPermissions,
    getMatchingItems,
    insertItem,
    validateItemPermissions,
    updateItemName,
    deleteItem,
} from '../db/queries/itemQueries.js';

import { validateItem, controllerMoveToError } from './utilities.js';

import { createHash } from 'crypto';

async function controllerItemActionChecks(req, res) {
    const { categoryId, itemId } = req.params;
    const results = await getItemNameAndPermissions(itemId);

    const status = controllerMoveToError(req, res, results, '404');
    if (status === null) {
        return null;
    }

    const { item, permission } = status;

    return { categoryId, itemId, item, permission };
}

export async function controllerGetCreateItem(req, res) {
    const { categoryId } = req.params;
    const results = await getCategoryName(categoryId);

    const status = controllerMoveToError(req, res, results, '404');
    if (status === null) {
        return null;
    }

    res.render('createItem', { categoryId, category: status });
}

// Ensure to only run this function once you've validated the categoryId
async function controllerValidateItemUniqueness(categoryId, name) {
    const matches = await getMatchingItems(categoryId, name);
    return matches.length === 0;
}

const controllerPostCreateItem = [
    validateItem,
    async (req, res) => {
        const { categoryId } = req.params;

        const categoryName = await getCategoryName(categoryId);
        if (categoryName === null) {
            controllerMoveToError(req, res, null, '500');
            return;
        }

        const errorsArray = [...validationResult(req).array()];
        const unique = await controllerValidateItemUniqueness(
            categoryId,
            req.body.name,
        );

        if (unique === false) {
            errorsArray.push({
                msg: `Item "${req.body.name}" already exists in this category!`,
            });
        }

        if (errorsArray.length !== 0) {
            return res.status(400).render('createItem', {
                categoryId,
                category: categoryName,
                errors: errorsArray,
            });
        }

        const { name } = matchedData(req);

        await insertItem(categoryId, name);

        res.redirect(`/category/${categoryId}`);
    },
];

export async function controllerGetEditItem(req, res) {
    const checkResults = await controllerItemActionChecks(req, res);

    if (checkResults === null) {
        return;
    }

    const { categoryId, itemId, item, permission } = checkResults;

    res.render('updateItem', { categoryId, itemId, item, permission });
}

export async function controllerValidateItemPassword(req, res, next, view) {
    const { categoryId, itemId } = req.params;

    const results = await getItemNameAndPermissions(itemId);
    const status = controllerMoveToError(req, res, results, '500');
    if (status === null) {
        return;
    }
    const { item, permission } = status;

    if (permission === 'Guest') {
        next();
        return;
    }

    let { password } = req.body;
    password = createHash('sha256').update(password).digest('hex');
    const valid = await validateItemPermissions(itemId, password);

    if (valid !== true) {
        return res.status(400).render(view, {
            errors: [
                {
                    msg:
                        valid === false
                            ? 'The password you have entered is incorrect!'
                            : valid,
                },
            ],
            itemId,
            categoryId,
            item,
            permission,
        });
    }

    next();
}

const controllerPostEditItem = [
    async (req, res, next) =>
        await controllerValidateItemPassword(req, res, next, 'updateItem'),
    validateItem,
    async (req, res) => {
        const { categoryId, itemId } = req.params;

        // Validating IDs
        const results = await getItemNameAndPermissions(itemId);
        const categoryName = await getCategoryName(categoryId);

        if (results === null || categoryName === null) {
            controllerMoveToError(req, res, null, '500');
            return;
        }

        const { item, permission } = results;

        const errorsArray = [...validationResult(req).array()];
        const unique = await controllerValidateItemUniqueness(
            categoryId,
            req.body.name,
        );

        if (unique === false) {
            errorsArray.push({
                msg: `Item "${req.body.name}" already exists in this category!`,
            });
        }

        if (errorsArray.length !== 0) {
            return res.status(400).render('updateItem', {
                categoryId,
                itemId,
                permission,
                item,
                errors: errorsArray,
            });
        }

        const { name } = matchedData(req);

        await updateItemName(itemId, name);

        res.redirect(`/category/${categoryId}`);
    },
];

export async function controllerGetDeleteItem(req, res) {
    const checkResults = await controllerItemActionChecks(req, res);

    if (checkResults === null) {
        return;
    }

    const { categoryId, itemId, item, permission } = checkResults;

    res.render('deleteItem', { categoryId, itemId, item, permission });
}

const controllerPostDeleteItem = [
    async (req, res, next) =>
        await controllerValidateItemPassword(req, res, next, 'deleteItem'),
    async (req, res) => {
        const { categoryId, itemId } = req.params;

        // Validating IDs
        const results = await getItemNameAndPermissions(itemId);
        const categoryName = await getCategoryName(categoryId);

        if (results === null || categoryName === null) {
            controllerMoveToError(req, res, null, '500');
            return;
        }

        const { item, permission } = results;

        const errorsArray = [...validationResult(req).array()];
        const unique = await controllerValidateItemUniqueness(
            categoryId,
            req.body.name,
        );

        if (unique === false) {
            errorsArray.push({
                msg: `Item "${req.body.name}" already exists in this category!`,
            });
        }

        if (errorsArray.length !== 0) {
            return res.status(400).render('deleteItem', {
                categoryId,
                itemId,
                permission,
                item,
                errors: errorsArray,
            });
        }

        const { name } = matchedData(req);

        await deleteItem(itemId, name);

        res.redirect(`/category/${categoryId}`);
    },
];

export {
    controllerPostCreateItem,
    controllerPostEditItem,
    controllerPostDeleteItem,
};
