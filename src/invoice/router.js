import { Router } from 'express';
import { controller } from './controller.js';

export const router = Router();
router.get('/:id', controller.show);
