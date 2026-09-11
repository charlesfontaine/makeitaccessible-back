import express from 'express';
import './models/connection';
// import passport from './config/passport';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';

import { router as usersRouter } from './routes/users';
import { router as auditRouter } from './routes/audit';
import { router as testRouter } from './routes/test';
import { router as authRouter } from './routes/auth';
import { router as siteRouter } from './routes/site';


const app = express();
// app.use(passport.initialize());

app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/users', usersRouter);
app.use('/audit', auditRouter);
app.use('/test', testRouter);
app.use('/auth', authRouter);
app.use('/sites', siteRouter);

export default app;
