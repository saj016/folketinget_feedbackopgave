const axios = require("axios");
const { parseStringPromise } = require('xml2js');

exports.fetchAllMembers = async () => {
    const res = await axios.get("https://oda.ft.dk/api/Akt%C3%B8r?$inlinecount=allpages&$filter=substringof(%27%3Cstatus%3E1%3C/status%3E%27,biografi)%20eq%20true");

    let members = res.data.value;
    for (let i = 0; i < members.length; i++) {
        members[i] = await extractInfoFromJson(members[i]);
    }
}


async function extractInfoFromJson(json) {
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

        // Extract desired info
        const person = parsedXml.person;
        const title = person.title;
        const profession = person.profession;
        const party = person.party;
        const phone = person.ministerPhone;
        const email = person.emails.email;



        console.log(title);
        console.log(profession);
        console.log(party);
        console.log(phone);
        console.log(email);
        return {
            title: title,
            profession: profession,
            party: party,
            phone: phone,
            email: email
        }
    } catch (err) {
        console.error('Error parsing XML:', err.message);
        return null;
    }
}