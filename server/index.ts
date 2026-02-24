import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/user.js';
import chatRoutes from './routes/chat.js';
import cafeRoutes from './routes/cafe.js';
import weatherRoutes from './routes/weather.js';
import reviewRoutes from './routes/review.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

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

// 프로덕션: Vite 빌드 결과물 서빙
const distPath = path.resolve(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n☕ MoodBrew API 서버가 시작되었습니다!`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`   헬스 체크: http://localhost:${PORT}/api/health\n`);
});
