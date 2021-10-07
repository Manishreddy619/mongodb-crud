import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const authorSchema = new Schema(
	{
		name: { type: String, required: true },
		surName: { type: String, required: true },
		email: { type: String, required: true },
		avatar: { type: String, required: true },
		dateOfbirth: { type: String, required: true },
	},

	{
		timestamps: true,
	},
);

export default model('Author', authorSchema);
