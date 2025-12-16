import { body } from "express-validator";

// Moves the user to an error page
// if a query that was expected to return results
// returned none
export function controllerMoveToError(req, res, results, error) {
    if (results === null) {
        res.status(Number(error)).render(error);
        return null;
    }

    return results;
}

const validateCategory = [
    body('name')
        .isLength({ min: 1, max: 30 })
        .withMessage('Category name must be between 1 and 30 characters.'),
];

const validateItem = [
    body('name')
        .isLength({ min: 1, max: 30 })
        .withMessage('Item name must be between 1 and 30 characters.'),
];

export { validateCategory, validateItem };


