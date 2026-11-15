import { memberService } from '../services/memberService.js';

/** CONTROLLER: Oversætter HTTP request til servicekald og HTTP response.
 * Ingen forretningsregler og ingen direkte databaseadgang.
 * Express 5 sender fejl fra async funktioner til errorHandler automatisk.
 */
export const memberController = {
    async list(req, res) {
        const members = await memberService.list(req.query.name);
        res.json(members);
    },
    async get(req, res) {
        res.json(await memberService.get(req.params.id));
    },
    async create(req, res) {
        const created = await memberService.create(req.body);
        res.status(201).location(`/api/members/${created.id}`).json(created);
    },
    async update(req, res) {
        res.json(await memberService.update(req.params.id, req.body));
    },
    async remove(req, res) {
        await memberService.remove(req.params.id);
        res.status(204).send(); // 204 no body response
    }
};