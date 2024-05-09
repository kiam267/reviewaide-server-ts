import express, { Request, Response, Router } from 'express';
import cros from 'cors';

import userRouter from './routers/user-router';
import clientRouter from './routers/client-router';

// set some confing
const PORT = process.env.PORT || 4500;
const app = express();

// use
app.use(cros());
app.use(express.json());
app.use('/api/uploads', express.static('src/uploads'));
//user routes

app.use('/api/my/user', userRouter);
app.use('/api/my/client', clientRouter);

// health check

app.get('/api/health', async (req: Request, res: Response) => {
  res.send('health is good ');
});

app.listen(PORT, () => {
  console.log(`✨ Server listening on http://localhost:${PORT} `);
});
