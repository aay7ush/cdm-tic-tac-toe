import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, { cors: 'http://localhost:1337/' })
const allUsers = {}
const allRooms = []

io.on('connection', (socket) => {
	socket.on('request_to_play', (data) => {})

	socket.on('disconnect', () => {})
})

httpServer.listen(1338)
