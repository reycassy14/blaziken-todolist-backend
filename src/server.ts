import express from 'express';
import cors from 'cors';
import 'dotenv/config'
import morgan from 'morgan'

import routes from './routes'


const PORT = process.env.PORT || 3000;

const server = express();

server.use(cors());
server.use(morgan('dev'));
server.use(express.json())
server.use(express.urlencoded({extended: true}))

server.use('/api', routes);

server.listen(PORT, ()=>{
    console.log(`TODO API is Running!! at PORT: ${PORT}`)
})

export default server