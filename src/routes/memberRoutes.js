import { Router } from 'express';
import { memberController as mc} from '../controllers/memberController.js';
import { validateBody, validateId } from '../middleware/validateMember.js';
import { createMemberSchema, updateMemberSchema } from "../validator/memberValidator.js";

/** ROUTE: URI + HTTP-metode + middleware + controller. Ingen logik her. */
export const memberRouter = Router();
memberRouter.get('/', mc.list); //get all ministre
memberRouter.get('/:id', validateId, mc.get); //get én minister
memberRouter.post('/', validateBody(createMemberSchema), mc.create); //opret minister
memberRouter.patch('/:id', validateId, validateBody(updateMemberSchema), mc.update); //opdatér minister, lavet som patch og ikke put
memberRouter.delete('/:id', validateId, mc.remove); //delete minister
