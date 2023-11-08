const express = require('express');
const Jimp = require('jimp');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 8002;

app.use(express.static('public'));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/resize', upload.array('images'), async (req, res) => {
    try {
        const resizedImages = [];

        for (const imageBuffer of req.files) {
            const image = await Jimp.read(imageBuffer.buffer);

            // 이미지를 가운데 정렬
            const maxSide = Math.max(image.getWidth(), image.getHeight());
            image.contain(1000, 1000, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);

            // 이미지 크기를 1000x1000으로 변경
            image.resize(1000, 1000);

            // 원본 이미지 파일 이름 가져오기
            const originalname = imageBuffer.originalname;

            // 리사이징된 이미지를 파일로 저장 (원본 파일 이름 그대로)
            const filename = originalname;

            await image.writeAsync(filename);

            resizedImages.push({ originalname, filename });
        }

        res.json({ message: '이미지 리사이징 및 저장 완료', resizedImages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '이미지 처리 중 오류가 발생했습니다.' });
    }
});

app.listen(port, () => {
    console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
