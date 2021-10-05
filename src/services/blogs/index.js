import express from 'express';

import createHttpError from 'http-errors';
import BlogModel from './schema.js';
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
		const blogs = await BlogModel.find();

		res.send(blogs);
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

export default blogsRouter;
