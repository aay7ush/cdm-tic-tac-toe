import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import Swal from 'sweetalert2'
import Square from './Square'

const renderFrom = [
	[null, null, null],
	[null, null, null],
	[null, null, null],
]

const App = () => {
	const [gameState, setGameState] = useState(renderFrom)
	const [currentPlayer, setCurrentPlayer] = useState('circle')
	const [finishedState, setFinishedState] = useState(false)
	const [finishedArrayState, setFinishedArrayState] = useState([])
	const [playOnline, setPlayOnline] = useState(false)
	const [socket, setSocket] = useState(null)
	const [playerName, setPlayerName] = useState('')
	const [opponentName, setOpponentName] = useState(null)
	const [playingAs, setPlayingAs] = useState(null)

	const checkWinner = () => {
		const winningCombinations = [
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
			[0, 3, 6],
			[1, 4, 7],
			[2, 5, 8],
			[0, 4, 8],
			[2, 4, 6],
		]

		for (const [a, b, c] of winningCombinations) {
			const [first, second, third] = [
				gameState[Math.floor(a / 3)][a % 3],
				gameState[Math.floor(b / 3)][b % 3],
				gameState[Math.floor(c / 3)][c % 3],
			]
			if (first && first === second && first === third) {
				setFinishedArrayState([a, b, c])
				return first
			}
		}

		const isDraw = gameState.flat().every((cell) => cell !== null)
		if (isDraw) return 'draw'

		return null
	}

	useEffect(() => {
		const winner = checkWinner()
		if (winner) {
			setFinishedState(winner)
		}
	}, [gameState])

	const takePlayerName = async () => {
		const result = await Swal.fire({
			title: 'Enter your name',
			input: 'text',
			showCancelButton: true,
			inputValidator: (value) => {
				if (!value) {
					return 'You need to write something!'
				}
			},
		})

		return result
	}

	const playOnlineClick = async () => {
		const result = await takePlayerName()

		if (!result.isConfirmed) {
			return
		}

		const username = result.value
		setPlayerName(username)

		const newSocket = io('http://localhost:3001', {
			autoConnect: true,
		})

		newSocket?.emit('request_to_play', {
			playerName: username,
		})

		setSocket(newSocket)
	}

	socket?.on('connect', () => {
		setPlayOnline(true)
	})

	socket?.on('OpponentNotFound', () => {
		setOpponentName(false)
	})

	socket?.on('OpponentFound', (data) => {
		setPlayingAs(data.playingAs)
		setOpponentName(data.opponentName)
	})

	socket?.on('opponentLeftMatch', () => {
		setFinishedState('opponentLeftMatch')
	})

	socket?.on('playerMoveFromServer', (data) => {
		setGameState((prevState) => {
			const newState = [...prevState]
			const { id, sign } = data.state
			const rowIndex = Math.floor(id / 3)
			const colIndex = id % 3
			newState[rowIndex][colIndex] = sign
			return newState
		})
		setCurrentPlayer(data.state.sign === 'circle' ? 'cross' : 'circle')
	})

	if (!playOnline) {
		return (
			<div className="h-screen grid place-content-center">
				<button
					onClick={playOnlineClick}
					className="text-5xl font-bold text-white p-4 bg-gradient-to-r from-fuchsia-500 to-purple-500 rounded-md"
				>
					Play Online
				</button>
			</div>
		)
	}

	if (playOnline && !opponentName) {
		return (
			<div className="h-screen grid place-content-center">
				<p className="text-5xl font-bold">Waiting for opponent...</p>
			</div>
		)
	}

	return (
		<section className="h-screen grid place-content-center space-y-5 font-medium text-center">
			<div className="flex justify-between items-center">
				<p
					className={`player-name ${
						currentPlayer === playingAs ? 'bg-sky-500' : 'bg-zinc-800'
					}`}
				>
					{playerName}
				</p>
				<p
					className={`player-name ${
						currentPlayer !== playingAs ? 'bg-sky-500' : 'bg-zinc-800'
					}`}
				>
					{opponentName}
				</p>
			</div>
			<div className="grid grid-cols-3 gap-2">
				{renderFrom.map((arr, rowIndex) =>
					arr.map((cell, colIndex) => (
						<Square
							key={rowIndex * 3 + colIndex}
							id={rowIndex * 3 + colIndex}
							setGameState={setGameState}
							currentPlayer={currentPlayer}
							setCurrentPlayer={setCurrentPlayer}
							finishedState={finishedState}
							finishedArrayState={finishedArrayState}
							socket={socket}
							playingAs={playingAs}
							currentElement={cell}
						/>
					))
				)}
			</div>
			{finishedState &&
				finishedState !== 'opponentLeftMatch' &&
				finishedState !== 'draw' && (
					<h3 className="text-3xl">{finishedState} won the game!</h3>
				)}
			{finishedState &&
				finishedState !== 'opponentLeftMatch' &&
				finishedState === 'draw' && <h3 className="text-3xl">It's a Draw!</h3>}
			{!finishedState && opponentName && (
				<h3 className="text-3xl">You're playing against {opponentName}</h3>
			)}
			{finishedState && finishedState === 'opponentLeftMatch' && (
				<h3 className="text-3xl">You won the match, Opponent has left</h3>
			)}
		</section>
	)
}
export default App
