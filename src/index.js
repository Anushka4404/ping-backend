import dotenv from 'dotenv';
dotenv.config(); // ✅ Move this to the first line

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
//import path from 'path';

import groqRoutes from './routes/groqRoutes.js';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { app, server } from './lib/socket.js';
import { connectDB } from './lib/db.js';

const PORT = process.env.PORT || 5000; // ✅ Add default port fallback
//const __dirname = path.resolve();
const allowedOrigins = [
  'http://localhost:5173',
  'https://ping-frontend6.onrender.com',
];

app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    //origin: 'http://localhost:5173', // Adjust this if your frontend is running elsewhere
     origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    //origin: "https://ping-frontend6.onrender.com",
    credentials: true,
  })
);


// ✅ Load routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groq', groqRoutes); // Your Groq routes for summarization, translation, and reply suggestion

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "CORS error" });
  }

  res.status(500).json({ error: "Something went wrong!" });
});

// ✅ Serve frontend in production
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../frontend/dist')));
//   app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../frontend', 'dist', 'index.html'));
//   });
// }

// ✅ Start server
server.listen(PORT, () => {
  console.log('Server is running on PORT:', PORT);
  connectDB();
});