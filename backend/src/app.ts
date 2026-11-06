import cors from 'cors';
import express from 'express';

import apiRouter from './routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use(apiRouter);

export default app;
