const mongoose = require('mongoose');
const dns = require('dns');

// Override DNS to use Google's servers — fixes SRV TCP lookup failures
// caused by home routers that don't support DNS over TCP.
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
