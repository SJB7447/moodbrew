import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user.js';
import chatRoutes from './routes/chat.js';
import cafeRoutes from './routes/cafe.js';
import weatherRoutes from './routes/weather.js';
import reviewRoutes from './routes/review.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 라우터 마운트
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/cafe', cafeRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/review', reviewRoutes);

// 헬스 체크
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'MoodBrew API', version: '1.0.0' });
});

app.listen(PORT, () => {
    console.log(`\n☕ MoodBrew API 서버가 시작되었습니다!`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`   헬스 체크: http://localhost:${PORT}/api/health\n`);
});
