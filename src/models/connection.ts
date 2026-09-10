import mongoose from 'mongoose';

const connectionString = process.env.CONNECTION_STRING;

if (!connectionString)
  throw new Error('CONNECTION_STRING is missing');

mongoose.connect(connectionString, { connectTimeoutMS: 2000 })
  .then(() => console.log('Database connected'))
  .catch(error => console.error(error));
