import {
    getAllCategories,
    getMatchingCategories,
    insertCategory,
} from '../db/queries/indexQueries.js';
import { validationResult, matchedData } from 'express-validator';

import { validateCategory } from './utilities.js';

export async function controllerGetHome(req, res) {
    const categories = await getAllCategories();
    res.render('index', { categories });
}

export async function controllerGetCreateCategory(req, res) {
    res.render('createCategory');
}

export async function controllerValidateCategoryUniqueness(name) {
    const matches = await getMatchingCategories(name);
    return matches.length === 0;
}

const controllerPostCreateCategory = [
    validateCategory,
    async (req, res) => {
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
            return res.status(400).render('createCategory', {
                errors: errorsArray,
            });
        }

        const { name } = matchedData(req);
        
        await insertCategory(name);

        res.redirect('/');
    },
];

export { controllerPostCreateCategory };
