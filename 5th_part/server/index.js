// adding message detection activity


import express from "express"
import { Server } from "socket.io"
import path from "path"
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename); 

const PORT = process.env.PORT || 3500;
const ADMIN = "Admin"

const app = express();


//using middleware.
app.use(express.static(path.join(__dirname, "public")));

const expressServer = app.listen(PORT, () => {
    console.log(`Server listining on the ${PORT}`);
})

const UsersState = {
    users: [],
    setUsers : function(newUsersArray){
        this.users = newUsersArray
    }
}

const io = new Server( expressServer, {

    // cross origin resources service
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : ["https://localhost:5500","http://127.0.0.1:5500"]
    }

  }  
)


io.on('connection', socket => {
    console.log(`User ${socket.id} connected`);

    // upon connection - only to the user(on the immediate connection)
    socket.emit('message', buildMsg(ADMIN,"Welcome to Chat App!"))

    
    socket.on('enterRoom', ({name, room}) => {
        // leave a prev room 
        const prevRoom = getUser(socket.id)?.room
        
        if(prevRoom){
            socket.leave(prevRoom)
            io.to(prevRoom).emit('message', buildMsg(ADMIN, `${name} has left the room`))
        }

        const user = activateUser(socket.id, name, room)

        // cannot update prev roomnnuserd list until after the state update in activate user
        if(prevRoom){
            io.to(prevRoom).emit('userList', {
                users: getUsersInRoom(prevRoom)
            }
            )
        }

        // join room
        socket.join(user.room)

        // to user who joined
        socket.emit('message', buildMsg(ADMIN, `You have joined the ${user.room} chat room`))

        // 
        socket.broadcast.to(user.room).emit('message', buildMsg(ADMIN, `${user.name} has joined the room`))

        // update user list for room
        io.to(user.room).emit('userList', {
            users: getUsersInRoom(user.room)
        });

        // update room list for everyone
        io.emit('roomList', {
            rooms: getAllActiveRooms()
        });



    })

    // when user disconnects - to all others
    
    socket.on('disconnect', () => {
        const user = getUser(socket.id)
        userLeavesApp(socket.id)

        if(user){
            io.to(user.room).emit('message', buildMsg(ADMIN, `${user.name} has left the room`))

            io.to(user.room).emit('userList',{
                users: getUsersInRoom(user.room)
            })

            io.emit('roomList', {
                rooms: getAllActiveRooms()
            })

        }

        console.log(`User ${socket.id} disconnected`)

        // socket.broadcast.emit('message', `User ${socket.id.substring(0,5)} disconnected`)
    })
    
    // upon connection - to all others
    // socket.broadcast.emit('message', `User ${socket.id.substring(0,5)} connected`)

    // listening for a message event
    socket.on('message', ({name, text}) => {
        const room = getUser(socket.id)?.room
        if(room){
            io.to(room).emit('message', buildMsg(name,text))
        }
    })

    // listen for activity
    socket.on('activity', (name) => {
        const room = getUser(socket.id)?.room
        if(room){
            socket.broadcast.to(room).emit('activity', name)
        } 
    })


})

function buildMsg(name, text){
    return {
        name,
        text,
        time: new Intl.DateTimeFormat('default',{
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        }).format(new Date())
    }
}

// user functions
function activateUser(id, name, room){
    const user = { id, name, room }
    UsersState.setUsers([
        ...UsersState.users.filter(user => user.id !== id),
        user
    ])
    return user
}

function userLeavesApp(id) {
    UsersState.setUsers(
        UsersState.users.filter(user => user.id !== id)
    )
}

function getUser(id){
    return UsersState.users.find(user => user.id === id)
}


function getUsersInRoom(room){
    return UsersState.users.filter(user => user.room === room)
}


function getAllActiveRooms(){
    return Array.from(new Set(UsersState.users.map(user => user.room)))
}

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