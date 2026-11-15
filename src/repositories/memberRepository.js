import { Member } from '../models/memberModel.js';

/** REPOSITORY: Det eneste lag, der bruger Mongoose-metoder.
 * En controller må aldrig kalde member.find() direkte.
 * Repository ved intet om HTTP-statuskoder.
 */
export const memberRepository = {
    findAll(name) {
        const filter = name ? { name: { $regex: escapeRegex(name), $options: 'i' } } : {};
        return Member.find(filter).sort({ name: 1 });
    },
    findById(id) { return Member.findById(id); },
    create(data) { return Member.create(data); },
    update(id, data) { return Member.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true }); },
    remove(id) { return Member.findByIdAndDelete(id).lean(); }
};

// Søgetekst må ikke fungere som et regulært udtryk fra klienten.
function escapeRegex(text) { return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
