import express, { Request, Response, Router } from 'express';
import cros from 'cors';

import userRouter from './routers/user-router';
import clientRouter from './routers/client-router';
import adminRouter from './routers/admin-router';
import { v2 as cloudinary } from 'cloudinary';
// set some confing
const PORT = process.env.PORT || 4500;
const app = express();




// cloudinary configuration

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// use
app.use(cros());
app.use(express.json());
app.use('/api/uploads', express.static('src/uploads'));
//user routes

app.use('/api/my/user', userRouter);
app.use('/api/my/client', clientRouter);
app.use('/api/my/admin', adminRouter);

// health check

app.get('/api/health', async (req: Request, res: Response) => {
  res.send('health is good ');
});

app.listen(PORT, () => {
  console.log(`✨ Server listening on http://localhost:${PORT} `);
});
