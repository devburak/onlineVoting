const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectToDatabase = require('./db');
const memberRoutes = require('./routes/members');
const userRoutes = require('./routes/users');
const logRoutes = require('./routes/log');
const voterRoutes = require('./routes/voter');
const voteRoutes = require('./routes/vote');
const electionRoutes = require('./routes/election');
const testRoutes = require('./routes/test')
const app = express();
app.use(express.json());
// CORS OK
app.use(cors());
connectToDatabase();

app.get('/', (req, res) => {
    res.send('Hello word');
});

app.use('/members', memberRoutes);
app.use('/users', userRoutes );
app.use('/logs', logRoutes );
app.use('/voters' ,voterRoutes);
app.use('/election',electionRoutes);
app.use('/vote' ,voteRoutes);
app.use('/test',testRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server http://127.0.0.1:${port} portunda çalışıyor.`);
});