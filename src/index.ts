import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import collectionRoutes from './routes/collections';
import donationRoutes from './routes/donations';
import forumRoutes from './routes/forum'
import literatureRoutes from './routes/literature'
import voteRoutes from './routes/vote'


dotenv.config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/auth', authRoutes);

app.use('/collections', collectionRoutes);
app.use('/donations', donationRoutes);
app.use('/forum', forumRoutes)
app.use('/literature', literatureRoutes)
app.use('/voting', voteRoutes)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
