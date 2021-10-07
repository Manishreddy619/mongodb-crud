import express from 'express';

import q2m from 'query-to-mongo';
import createHttpError from 'http-errors';
import BlogModel from './schema.js';
import CommentModel from '../comments/schema.js';
const blogsRouter = express.Router();

blogsRouter.post('/', async (req, res, next) => {
	try {
		const newBlog = new BlogModel(req.body); // here happens validation of the req.body, if it is not ok Mongoose will throw a "ValidationError"
		const { _id } = await newBlog.save(); // this is where the interaction with the db/collection happens

		res.status(201).send({ _id });
	} catch (error) {
		next(error);
	}
});

blogsRouter.get('/', async (req, res, next) => {
	try {
		const mongoQuery = q2m(req.query);
		console.log(mongoQuery);
		const total = await BlogModel.countDocuments(mongoQuery.criteria);
		const blogs = await BlogModel.find(
			mongoQuery.criteria,
			mongoQuery.options.fields,
		)
			.limit(mongoQuery.options.limit || 10)
			.skip(mongoQuery.options.skip)
			.sort(mongoQuery.options.sort)
			.populate({ path: 'authors' });
		res.send({
			links: mongoQuery.links('/blogs', total),
			total,
			pageTotal: Math.ceil(total / mongoQuery.options.limit),
			blogs,
		});
	} catch (error) {
		next(error);
	}
});

blogsRouter.get('/:blogId', async (req, res, next) => {
	try {
		const blogId = req.params.blogId;

		const blog = await BlogModel.findById(blogId); // similar to findOne, but findOne expects to receive a query as parameter

		if (blog) {
			res.send(blog);
		} else {
			next(createHttpError(404, `blog with id ${blogId} not found!`));
		}
	} catch (error) {
		next(error);
	}
});

blogsRouter.put('/:blogId', async (req, res, next) => {
	try {
		const blogId = req.params.blogId;
		const modifiedblog = await BlogModel.findByIdAndUpdate(blogId, req.body, {
			new: true, // returns the modified blog
		});

		if (modifiedblog) {
			res.send(modifiedblog);
		} else {
			next(createHttpError(404, `blog with id ${blogId} not found!`));
		}
	} catch (error) {
		next(error);
	}
});

blogsRouter.delete('/:blogId', async (req, res, next) => {
	try {
		const blogId = req.params.blogId;

		const deletedblog = await BlogModel.findByIdAndDelete(blogId);

		if (deletedblog) {
			res.status(204).send();
		} else {
			next(createHttpError(404, `blog with id ${blogId} not found!`));
		}
	} catch (error) {
		next(error);
	}
});
blogsRouter.post('/:blogId/comments', async (req, res, next) => {
	try {
		const Isblog = await BlogModel.findById(req.params.blogId);
		if (Isblog) {
			const updatedBlog = new CommentModel(req.body);
			const commentBlog = await updatedBlog.save(); // this is where the interaction with the db/collection happens
			console.log(commentBlog);
			const blogToInsert = {
				...commentBlog.toObject(),
				commentedOn: new Date(),
			};
			const updateBlog = await BlogModel.findByIdAndUpdate(
				req.params.blogId,
				{ $push: { comments: blogToInsert } },
				{ new: true },
			);
			res.status(201).send(updateBlog);
		} else {
			next(
				createHttpError(404, `blog with id ${req.params.blogId} not found!`),
			);
		}
	} catch (error) {
		next(error);
	}
});
blogsRouter.get('/:blogId/comments', async (req, res, next) => {
	try {
		const blog = await BlogModel.findById(req.params.blogId);
		if (blog) {
			res.send(blog.comments);
		} else {
			next(
				createHttpError(404, `blog with id ${req.params.blogId} not found!`),
			);
		}
	} catch (error) {
		next(error);
	}
});
blogsRouter.get('/:blogId/comments/:commentId', async (req, res, next) => {
	try {
		const blog = await BlogModel.findById(req.params.blogId);
		if (blog) {
			const particularComment = blog.comments.find(
				(blog) => blog._id.toString() === req.params.commentId,
			);
			if (particularComment) {
				res.send(particularComment);
			} else {
				next(
					createHttpError(
						404,
						`Book with id ${req.params.commentId} not found in comment section`,
					),
				);
			}
		} else {
			next(
				createHttpError(
					404,
					`Book with id ${req.params.blogId} not found in comment section`,
				),
			);
		}
	} catch (error) {
		next(error);
	}
});
blogsRouter.put('/:blogId/comments/:commentId', async (req, res, next) => {
	try {
		const blog = await BlogModel.findById(req.params.blogId); // blog is a MONGOOSE DOCUMENT not a normal plain JS object

		if (blog) {
			const index = blog.comments.findIndex(
				(p) => p._id.toString() === req.params.commentId,
			);

			if (index !== -1) {
				blog.comments[index] = {
					...blog.comments[index].toObject(),
					...req.body,
				};
				console.log(blog.comments[index]);
				await blog.save();
				res.send(blog);
			} else {
				next(
					createHttpError(
						404,
						`Book with id ${req.params.commentId} not found in purchase history!`,
					),
				);
			}
		} else {
			next(
				createHttpError(404, `blog with id ${req.params.blogId} not found!`),
			);
		}
	} catch (error) {
		next(error);
	}
});
blogsRouter.delete('/:blogId/comments/:commentId', async (req, res, next) => {
	try {
		const blog = await BlogModel.findByIdAndUpdate(
			req.params.blogId, // WHO we want to modify
			{ $pull: { comments: { _id: req.params.commentId } } }, // HOW we want to modify that blog (remove a specified item from the purchaseHistory array)
			{ new: true }, // options
		);
		if (blog) {
			res.send(blog);
		} else {
			next(
				createHttpError(404, `blog with id ${req.params.blogId} not found!`),
			);
		}
	} catch (error) {
		next(error);
	}
});

export default blogsRouter;
