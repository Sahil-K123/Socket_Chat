// adding message detection activity


import express from "express"
import { Server } from "socket.io"
import path from "path"
import { fileURLToPath } from "url";

const PORT = process.env.PORT || 3500;

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename); 

const app = express();


//using middleware.
app.use(express.static(path.join(__dirname, "public")));

const expressServer = app.listen(PORT, () => {
    console.log(`Server listining on the ${PORT}`);
})

const io = new Server( expressServer, {

    // cross origin resources service
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : ["https://localhost:5500","http://127.0.0.1:5500"]
    }

  }  
)


io.on('connection', socket => {
    console.log(`User ${socket.id} connected`);

    // upon connection - only to the user
    socket.emit('message', "Welcome to Chat App!")

    // upon connection - to all others
    socket.broadcast.emit('message', `User ${socket.id.substring(0,5)} connected`)


    socket.on('message', data => {
        console.log(data);
        io.emit('message', `${socket.id.substring(0,5)}: ${data}`);
    })

    // when user disconnects - to all other
    socket.on('disconnect', () => {
        socket.broadcast.emit('message', `User ${socket.id.substring(0,5)} disconnected`)
    })


    socket.on('activity', (name) => {
        socket.broadcast.emit('activity', name);
    })


})

// httpServer.listen(3500, () => console.log('listening on port 3500'))
// httpServer.listen(PORT, () => console.log(`listening to the port: ${PORT}`));













// import { createServer } from "http"
// import { Server } from "socket.io"

// const httpServer = createServer()

// const io = new Server(httpServer, {
//     cors: {
//         origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5500", "http://127.0.0.1:5500"]
//     }
// })

// io.on('connection', socket => {
//     console.log(`User ${socket.id} connected`)

//     socket.on('message', data => {
//         console.log(data)
//         io.emit('message', `${socket.id.substring(0, 5)}: ${data}`)
//     })
// })






// const ws = require('ws');
// const server = new ws.Server({ port: '3000' })

// server.on('connection', socket => {
//     socket.on('message', message => {
//         const b = Buffer.from(message);
//         // console.log(message);
//         console.log(b.toString());
//         socket.send(`${message}`);
//     })
// })