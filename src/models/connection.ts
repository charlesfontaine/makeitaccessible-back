import mongoose from 'mongoose';
import config from '../config/config'

mongoose.connect(config.connectionString, { connectTimeoutMS: 2000 })
  .then(() => console.log('Database connected'))
  .catch(error => console.error(error));
