require('dotenv').config();
const express = require("express");
const cors = require("cors");
const helmet = require('helmet');
const morgan = require('morgan');
const dataBaseconfig = require('./config/database');

const errorHandler = require('./middleware/errorHandler');
const findEmailRoute = require("./routes/findEmailRoute");
const authRoute = require("./routes/authRoute");


const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

app.use("/api/v1/findEmail", findEmailRoute);
app.use("/api/v1/auth", authRoute);

app.use(errorHandler);


app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Server Running"
    });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
     try {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/v1/docs`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
        // const { err } = await dataBaseconfig();
        // startCronJob();
        // if (err) throw new Error(err)
    } catch (ex) {
        console.log('Database Connection Error:', ex);
    }
  
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing server...');
//   await database.disconnect();
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});