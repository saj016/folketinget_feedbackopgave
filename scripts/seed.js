import 'dotenv/config';
import mongoose from 'mongoose';
import { readFile } from 'node:fs/promises';
import { connectDatabase } from '../src/config/database.js';
import { Member } from '../src/models/memberModel.js';

// Seed er bevidst separat fra API'et. Den sletter aldrig eksisterende data.
try {
    await connectDatabase(process.env.MONGODB_URI);
    const members = JSON.parse(await readFile(new URL('../data/members.json', import.meta.url), 'utf8'));
    let added = 0;
    for (const member of members) {
        const exists = await Member.exists({ name: member.name });
        if (!exists) { await Member.create(member); added++; }
    }
    console.log(`${added} nye medlemmer indsat`);
} catch (err) {
    console.error('Seed fejlede:', err.message);
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}
