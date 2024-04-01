import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, { cors: 'http://localhost:5173/' })
const allUsers = {}
const allRooms = []

io.on('connection', (socket) => {
	allUsers[socket.id] = { socket, online: true }

	socket.on('request_to_play', (data) => {
		const currentUser = allUsers[socket.id]
		currentUser.playerName = data.playerName

		let opponentPlayer
		for (const key in allUsers) {
			const user = allUsers[key]
			if (user.online && !user.playing && socket.id !== key) {
				opponentPlayer = user
				break
			}
		}

		if (opponentPlayer) {
			allRooms.push({ player1: opponentPlayer, player2: currentUser })
			currentUser.socket.emit('OpponentFound', {
				opponentName: opponentPlayer.playerName,
				playingAs: 'circle',
			})
			opponentPlayer.socket.emit('OpponentFound', {
				opponentName: currentUser.playerName,
				playingAs: 'cross',
			})

			currentUser.socket.on('playerMoveFromClient', (data) => {
				opponentPlayer.socket.emit('playerMoveFromServer', { ...data })
			})
			opponentPlayer.socket.on('playerMoveFromClient', (data) => {
				currentUser.socket.emit('playerMoveFromServer', { ...data })
			})
		} else {
			currentUser.socket.emit('OpponentNotFound')
		}
	})

	socket.on('disconnect', () => {
		const currentUser = allUsers[socket.id]
		currentUser.online = false
		currentUser.playing = false

		for (const room of allRooms) {
			const { player1, player2 } = room
			if (player1.socket.id === socket.id) {
				player2.socket.emit('opponentLeftMatch')
				break
			}
			if (player2.socket.id === socket.id) {
				player1.socket.emit('opponentLeftMatch')
				break
			}
		}
	})
})

httpServer.listen(3001)
