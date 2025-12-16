import { Router, urlencoded } from 'express';
import {
    controllerGetCategoryItems,
    controllerGetEditCategory,
    controllerPostEditCategory,
    controllerGetDeleteCategory,
    controllerPostDeleteCategory,
} from '../controllers/categoryController.js';

import {
    controllerGetCreateItem,
    controllerPostCreateItem,
    controllerGetEditItem,
    controllerPostEditItem,
    controllerGetDeleteItem,
    controllerPostDeleteItem,
} from '../controllers/itemController.js';

const categoryRouter = Router();

categoryRouter.use(urlencoded({ extended: true }));

// #####################################
// Category-Related Action

categoryRouter.get('/:categoryId', (req, res) =>
    controllerGetCategoryItems(req, res),
);

categoryRouter.get('/:categoryId/edit', (req, res) =>
    controllerGetEditCategory(req, res),
);
categoryRouter.post('/:categoryId/edit', controllerPostEditCategory);

categoryRouter.get('/:categoryId/delete', (req, res) =>
    controllerGetDeleteCategory(req, res),
);

categoryRouter.post('/:categoryId/delete', controllerPostDeleteCategory);

// Category-Related Action
// #####################################

// #####################################
// Item-Related Action

categoryRouter.get('/:categoryId/createItem', (req, res) =>
    controllerGetCreateItem(req, res),
);
categoryRouter.post('/:categoryId/createItem', controllerPostCreateItem);

categoryRouter.get('/:categoryId/editItem/:itemId', (req, res) =>
    controllerGetEditItem(req, res),
);
categoryRouter.post('/:categoryId/editItem/:itemId', controllerPostEditItem);

categoryRouter.get('/:categoryId/deleteItem/:itemId', (req, res) =>
    controllerGetDeleteItem(req, res),
);
categoryRouter.post(
    '/:categoryId/deleteItem/:itemId',
    controllerPostDeleteItem,
);

// Item-Related Action
// #####################################

export default categoryRouter;
