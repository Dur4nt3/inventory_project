import { validationResult, matchedData } from 'express-validator';

import {
    getCategoryItems,
    getCategoryNameAndPermissions,
    validateCategoryPermissions,
    updateCategoryName,
    deleteCategory,
} from '../db/queries/categoryQueries.js';

import { controllerValidateCategoryUniqueness } from './indexController.js';

import { controllerMoveToError, validateCategory } from './utilities.js';

import { createHash } from 'crypto';

// Get the properties required for views
// that allow the user to update/delete categories
// If the action is unsuccessful for any reason
// Move the user to an error page
async function controllerCategoryActionChecks(req, res) {
    const { categoryId } = req.params;
    const results = await getCategoryNameAndPermissions(categoryId);

    const status = controllerMoveToError(req, res, results, '404');
    if (status === null) {
        return null;
    }
    const { category, permission } = status;

    return { categoryId, category, permission };
}

export async function controllerGetCategoryItems(req, res) {
    const { categoryId } = req.params;

    const results = await getCategoryItems(categoryId);

    const status = controllerMoveToError(req, res, results, '404');
    if (status === null) {
        return;
    }
    const { items, categoryTitle } = status;

    res.render('category', { items, title: categoryTitle, categoryId });
}

export async function controllerGetEditCategory(req, res) {
    const checkResults = await controllerCategoryActionChecks(req, res);

    if (checkResults === null) {
        return;
    }

    const { categoryId, category, permission } = checkResults;

    res.render('updateCategory', { categoryId, category, permission });
}

const controllerValidateCategoryPassword = async (req, res, next, view) => {
    const { categoryId } = req.params;

    const results = await getCategoryNameAndPermissions(categoryId);
    const status = controllerMoveToError(req, res, results, '500');
    if (status === null) {
        return;
    }
    const { category, permission } = status;

    if (permission === 'Guest') {
        next();
        return;
    }

    let { password } = req.body;
    password = createHash('sha256').update(password).digest('hex');
    const valid = await validateCategoryPermissions(categoryId, password);

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
            categoryId,
            category,
            permission,
        });
    }

    next();
};

const controllerPostEditCategory = [
    async (req, res, next) =>
        await controllerValidateCategoryPassword(
            req,
            res,
            next,
            'updateCategory',
        ),
    validateCategory,
    async (req, res) => {
        const { categoryId } = req.params;
        const errorsArray = [...validationResult(req).array()];
        const unique = await controllerValidateCategoryUniqueness(
            req.body.name,
        );

        if (!unique) {
            errorsArray.push({
                msg: `Category "${req.body.name}" already exists!`,
            });
        }

        if (errorsArray.length !== 0) {
            const results = await getCategoryNameAndPermissions(categoryId);
            const status = controllerMoveToError(req, res, results, '500');
            if (status === null) {
                return;
            }
            const { category, permission } = status;

            return res.status(400).render('updateCategory', {
                errors: errorsArray,
                categoryId,
                category,
                permission,
            });
        }

        const { name } = matchedData(req);

        await updateCategoryName(name, categoryId);
        res.redirect('/');
    },
];

export async function controllerGetDeleteCategory(req, res) {
    const checkResults = await controllerCategoryActionChecks(req, res);

    if (checkResults === null) {
        return;
    }

    const { categoryId, category, permission } = checkResults;

    res.render('deleteCategory', { categoryId, category, permission });
}

const controllerPostDeleteCategory = [
    async (req, res, next) =>
        await controllerValidateCategoryPassword(
            req,
            res,
            next,
            'deleteCategory',
        ),
    async (req, res) => {
        const { categoryId } = req.params;
        const errorsArray = [];
        const unique = await controllerValidateCategoryUniqueness(
            req.body.name,
        );

        if (!unique) {
            errorsArray.push({
                msg: `Category "${req.body.name}" already exists!`,
            });
        }

        if (errorsArray.length !== 0) {
            const results = await getCategoryNameAndPermissions(categoryId);
            const status = controllerMoveToError(req, res, results, '500');
            if (status === null) {
                return;
            }
            const { category, permission } = status;

            return res.status(400).render('deleteCategory', {
                errors: errorsArray,
                categoryId,
                category,
                permission,
            });
        }

        await deleteCategory(categoryId);
        res.redirect('/');
    },
];

export { controllerPostEditCategory, controllerPostDeleteCategory };
