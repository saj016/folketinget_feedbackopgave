import { memberRepository } from '../repositories/memberRepository.js';
import { AppError } from '../utils/AppError.js';

/** SERVICE: Forretningsregler og koordinering.
 * Ingen req/res, ingen Express og ingen direkte Mongoose-queries.
 * Her kan de studerende eksempelvis tilføje en regel om favoritstatus.
 */
export const memberService = {
    list(name) { return memberRepository.findAll(name); },
    async get(id) {
        const member = await memberRepository.findById(id);
        if (!member) throw new AppError('Medlemmet blev ikke fundet', 404);
        return member;
    },
    create(data) { return memberRepository.create(data); },
    async update(id, data) {
        const member = await memberRepository.update(id, data);
        if (!member) throw new AppError('Medlemmet blev ikke fundet', 404);
        return member;
    },
    async remove(id) {
        const member = await memberRepository.remove(id);
        if (!member) throw new AppError('Medlemmet blev ikke fundet', 404);
    }
};
