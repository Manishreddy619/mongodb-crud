import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const blogSchema = new Schema(
	{
		category: { type: String, required: true },
		title: { type: String, required: true },
		cover: { type: String, required: true },
		readTime: {
			value: { type: Number, required: true },
			unit: { type: String, required: true },
		},
		author: {
			name: { type: String, required: true },
			avatar: { type: String, required: true },
		},
		content: { type: String },
	},
	{
		timestamps: true,
	},
);

export default model('Blog', blogSchema); // bounded to the "users" collection, if the collection is not there it is automatically created
