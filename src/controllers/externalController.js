import { odaService } from '../services/odaService.js';
// Separat controller viser, at eksterne integrationer også passer gennem lagene.
export async function searchMembers(_req, res) {
    res.json(await odaService.searchOdaMembers());
}
