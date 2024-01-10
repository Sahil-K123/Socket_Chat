import { createServer } from "http"
import { Server } from "socket.io"


const httpServer = createServer();
const PORT = 3500;

const io = new Server( httpServer, {

    // cross origin resources service
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : ["https://localhost:5500","http://127.0.0.1:5500"]
    }
}  )


io.on('connection', socket => {
    console.log(`User ${socket.id} connected`);

    socket.on('message', data => {
        console.log(data)
        io.emit('message', `${socket.id.substring(0,5)}: ${data}`)
    })
})

// httpServer.listen(3500, () => console.log('listening on port 3500'))
httpServer.listen(PORT, () => console.log(`listening to the port: ${PORT}`));













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