import createHttpError from 'http-errors';
import atob from 'atob';
import autherModel from '../services/authors/schema.js';
export const userBasicMiddleware = async (req, res, next) => {
	if (!req.headers.authorization) {
		createHttpError(401, 'check your credentials once');
	} else {
		const decodecred = atob(req.headers.authorization.split(' ')[1]);
		console.log(decodecred);
		const [email, password] = decodecred.split(':');
		console.log('EMAIL ', email);
		console.log('PASSWORD ', password);

		const user = await autherModel.checkCredentials(email, password);
		if (user) {
			// 4. If the credentials were ok we can proceed to what is next (another middleware, route handler)
			req.user = user; // we are attaching to the request the user document
			next();
		} else {
			// credentials problems --> user was null
			next(createHttpError(401, 'Credentials are not correct!'));
		}
	}
};
