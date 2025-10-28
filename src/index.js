require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// ------------------------------
// 🚀 Khởi tạo ứng dụng Express
// ------------------------------
const app = express();
// ------------------------------
// ⚙️ Middleware
// ------------------------------
app.use(cors());
app.use(bodyParser.json());

// ------------------------------
// 🧭 Import routes
// ------------------------------
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const examRoutes = require('./routes/examRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const classRoutes = require('./routes/classRoutes');
const subjectRoutes = require("./routes/subjectRoutes");



// ------------------------------
// 🛣️ Sử dụng routes
// ------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use("/api/subjects", subjectRoutes);

// ------------------------------
// 🗄️ Kiểm tra kết nối Database (tùy chọn)
// ------------------------------
const db = require('./config/database');
db.raw('SELECT 1')
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.error('❌ Database connection failed:', err));

// ------------------------------
// 🌐 Khởi động Server
// ------------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));