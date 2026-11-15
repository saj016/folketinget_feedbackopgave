import { AppError } from '../utils/AppError.js';
import { parseStringPromise } from 'xml2js';

/** EKSTERN SERVICE: Integrerer med oda (Folketingets åbne data) — adskilt fra lokal MongoDB.
 * https://oda.ft.dk/
 * Responses gemmes ikke i databasen
 */
export const odaService = {
    async searchOdaMembers() {
        let response;
        try {
            response = await fetch('https://oda.ft.dk/api/Akt%C3%B8r?$inlinecount=allpages&$filter=substringof(%27%3Cstatus%3E1%3C/status%3E%27,biografi)%20eq%20true', {
                headers: { 'User-Agent': 'FolketingFeedbackopgave' }, //label to identify my client
                signal: AbortSignal.timeout(5000)
            });
        } catch (err) {
            if (err.name === 'TimeoutError' || err.name === 'AbortError') {
                throw new AppError('oda svarede ikke i tide', 504);
            }
            throw new AppError('oda er ikke tilgængeligt', 502);
        }
        if (!response.ok) throw new AppError('Fejl hos oda', 502);
        let data;
        try { data = await response.json(); } catch { throw new AppError('Ugyldigt JSON-svar fra oda', 502); }
        if (!Array.isArray(data.value)) {
            throw new AppError('Uventet dataformat fra oda', 502);
        }

        return Promise.all(data.value.map(async member => {
            const details = await extractXmlInfo(member.biografi);

            return {
                externalId: member.id,
                name: member.navn,
                profession: details.profession,
                party: details.party,
                pictureMiRes: details.pictureMiRes,
                partyShortname: details.partyShortname
            };
        }));
        /*
        return data.value.map(member => ({
            externalId: member.id,
            name: member.navn,
            biography: member.biografi
        }));*/
    }
};

async function extractXmlInfo(biography) {
    if (typeof biography !== 'string' || !biography.trim()) {
        throw new AppError('Et medlem har ingen gyldig biografi fra oda', 502);
    }

    let parsed;
    try {
        parsed = await parseStringPromise(biography, {
            explicitArray: false,
            trim: true
        });
    } catch {
        throw new AppError('Ugyldig XML i biografi fra oda', 502);
    }

    // <member> is the XML root so using parsed.member to access its children
    const member = parsed.member;
    if (!member) {
        throw new AppError('Forventede ikke <member> i oda-biografien', 502);
    }

    return {
        profession: member.profession ?? null,
        party: member.party ?? null,
        pictureMiRes: member.pictureMiRes ?? null,
        partyShortname: member.partyShortname ?? null
    };
}


/*async function extractXmlInfoFromJson(json) {
    try {
        // Validate that biografi exists and is a string
        if (!json.biografi || typeof json.biografi !== 'string') {
            throw new Error('Invalid XML payload in JSON');
        }

        // Parse XML string into JS object
        const parsedXml = await parseStringPromise(json.biografi, {
            explicitArray: false, // Avoid wrapping values in arrays
            trim: true            // Remove whitespace
        });
        //wanted info: member.profession, member.party, member.pictureMiRes
        // Extract desired info
        const person = parsedXml.person;
        const profession = person.member.profession;
        const party = person.member.party;
        const picture = person.member.pictureMiRes;

        return {
            profession: profession,
            party: party,
            picture: picture
        }
    } catch (err) {
        console.error('Error parsing XML:', err.message);
        return null;
    }
}*/
