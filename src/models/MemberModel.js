import mongoose from 'mongoose';

/** MODEL: Beskriver strukturen og databasevalideringen.
 * Ingen HTTP-objekter (req/res), ingen routing og ingen forretningsprocesser her.
 * Én flad collection: ingen relationer, referencer eller indlejrede dokumenter.
 */
const memberSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    position: { type: String, required: true, trim: true, maxlength: 100 },
    party: { type: String, required: true, trim: true, maxlength: 70 }
}, { timestamps: true, versionKey: false });

// Gør JSON mere forståelig: id i stedet for _id, undlad intern __v.
memberSchema.set('toJSON', {
    transform: (_, data) => {
        data.id = String(data._id);
        delete data._id;
        return data;
    }
});
export const Member = mongoose.model('Member', memberSchema);