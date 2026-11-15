//create the express application and register middleware and routes
import express from 'express';
import { memberRouter } from './routes/memberRoutes.js';
import {searchMembers} from './controllers/externalController.js';
import { notFound } from './middleware/NotFound.js';
import { errorHandler } from './middleware/errorHandler.js';


/** APP: Samler alle komponenter. Start ikke serveren i denne fil.
 * Muliggør at teste API'et med Supertest uden en åben port.
 */
export const app = express(); //TODO - hvorfor export?
app.use(express.json({ limit: '20kb'}));
app.use(express.static('public'));
app.use('/api/members', memberRouter);
app.use('/api/external/members', searchMembers);

app.use('/api', notFound); //not found som første fejl
app.use(errorHandler); //håndtér fejl, hvis ikke det er 404