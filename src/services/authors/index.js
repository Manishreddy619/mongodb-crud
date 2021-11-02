import express from 'express';
import q2m from 'query-to-mongo';
import bcrypt from 'bcrypt';
import AuthorModel from './schema.js';
import { userBasicMiddleware } from '../../auth/basicuser.js';
import { adminOnlyMiddleware } from '../../auth/admin.js';
const authorsRouter = express.Router();

authorsRouter.get(
	'/',
	userBasicMiddleware,
	adminOnlyMiddleware,
	async (req, res, next) => {
		try {
			const mongoQuery = q2m(req.query);
			const total = await AuthorModel.countDocuments(mongoQuery.criteria);
			const authors = await AuthorModel.find(
				mongoQuery.criteria,
				mongoQuery.options.fields,
			)
				.limit(mongoQuery.options.limit || 10)
				.skip(mongoQuery.options.skip)
				.sort(mongoQuery.options.sort); // no matter how I write them but Mongo will always apply SORT then SKIP then LIMIT in this order
			res.send({
				links: mongoQuery.links('/authors', total),
				total,
				pageTotal: Math.ceil(total / mongoQuery.options.limit),
				authors,
			});
		} catch (error) {
			next(error);
		}
	},
);

authorsRouter.post(
	'/',
	userBasicMiddleware,

	async (req, res, next) => {
		try {
			const newAuthor = new AuthorModel(req.body);
			const { _id } = await newAuthor.save();
			res.send({ _id });
		} catch (error) {
			next(error);
		}
	},
);
authorsRouter.get('/:authorId', userBasicMiddleware, async (req, res, next) => {
	try {
		const authorId = req.params.authorId;

		const author = await AuthorModel.findById(authorId); // similar to findOne, but findOne expects to receive a query as parameter

		if (author) {
			res.send(author);
		} else {
			next(createHttpError(404, `author with id ${authorId} not found!`));
		}
	} catch (error) {
		next(error);
	}
});

authorsRouter.put('/:authorId', userBasicMiddleware, async (req, res, next) => {
	try {
		const authorId = req.params.authorId;
		const modifiedAuthor = await AuthorModel.findByIdAndUpdate(
			authorId,
			req.body,
			{
				new: true, // returns the modified author
			},
		);

		if (modifiedAuthor) {
			res.send(modifiedAuthor);
		} else {
			next(createHttpError(404, `author with id ${authorId} not found!`));
		}
	} catch (error) {
		next(error);
	}
});

authorsRouter.delete(
	'/:authorId',
	userBasicMiddleware,
	async (req, res, next) => {
		try {
			const authorId = req.params.authorId;

			const deleteAuthor = await AuthorModel.findByIdAndDelete(authorId);

			if (deleteAuthor) {
				res.status(204).send();
			} else {
				next(createHttpError(404, `author with id ${authorId} not found!`));
			}
		} catch (error) {
			next(error);
		}
	},
);
export default authorsRouter;
