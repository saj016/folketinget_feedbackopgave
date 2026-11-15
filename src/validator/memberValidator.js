import Joi from 'joi';

/** VALIDERINGSREGLER for HTTP-input (før service og database).
 * Mongooses schema validerer også, men beskytter et andet lag.
 */
const fields = {
    name: Joi.string()
        .trim()
        .min(1)
        .max(100)
        .pattern(/^[\p{L} -]+$/u) //\p{L} allows Unicode letters (including æ, ø, å), and space and "-" are also allowed
        .messages({
            'string.pattern.base': 'Navn må kun indeholde bogstaver, mellemrum og bindestreger'
        }),
    position: Joi.string().trim().min(1).max(100),
    party: Joi.string().trim().min(1).max(70)
};

export const createMemberSchema = Joi.object({
    ...fields,
    name: fields.name.required(),
    position: fields.position.required(),
    party: fields.party.required(),
}).unknown(false); //.unknown(false) rejects extra fields not listed in the schema
export const updateMemberSchema = Joi.object(fields).min(1).unknown(false);
//min(1) ensures that each string field is not empty, does not require any specific field to be present, but if a field is present, it must not be empty.
