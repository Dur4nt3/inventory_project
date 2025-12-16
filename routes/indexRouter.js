import { Router, urlencoded } from 'express';
import { controllerGetHome, controllerGetCreateCategory, controllerPostCreateCategory } from '../controllers/indexController.js';

const indexRouter = Router();

indexRouter.use(urlencoded({ extended: true }));

indexRouter.get('/', (req, res) => controllerGetHome(req, res));

indexRouter.get('/createCategory', (req, res) => controllerGetCreateCategory(req, res));

indexRouter.post('/createCategory', controllerPostCreateCategory);

export default indexRouter;