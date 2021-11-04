import express from 'express';
import mongoose from 'mongoose';
import listEndpoints from 'express-list-endpoints';
import cors from 'cors';
import passport from 'passport';
import googlestrategy from './auth/oauth.js';
import blogsRouter from './services/blogs/index.js';
import authorsRouter from './services/authors/index.js';

import {
	unauthorizedHandler,
	notFoundHandler,
	badRequestHandler,
	genericErrorHandler,
} from './services/errorHandlers.js';

const server = express();

const port = process.env.PORT || 3001;

// ************************* MIDDLEWARES ********************************
passport.use('google', googlestrategy);

server.use(cors());
server.use(express.json());
server.use(passport.initialize());
// ************************* ROUTES ************************************

server.use('/blogs', blogsRouter);
server.use('/authors', authorsRouter);
// ************************** ERROR HANDLERS ***************************
server.use(unauthorizedHandler);
server.use(notFoundHandler);
server.use(badRequestHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_CONNECTION);

mongoose.connection.on('connected', () => {
	console.log('Successfully connected to Mongo!');
	server.listen(port, () => {
		console.table(listEndpoints(server));
		console.log(`Server running on port ${port}`);
	});
});

mongoose.connection.on('error', (err) => {
	console.log(err);
});
