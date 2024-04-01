const Square = ({
	setGameState,
	socket,
	playingAs,
	currentElement,
	finishedArrayState,
	finishedState,
	id,
	currentPlayer,
	setCurrentPlayer,
}) => {
	const clickOnSquare = () => {
		if (playingAs !== currentPlayer || finishedState) {
			return
		}

		const myCurrentPlayer = currentPlayer

		socket.emit('playerMoveFromClient', {
			state: { id, sign: myCurrentPlayer },
		})

		setCurrentPlayer(currentPlayer === 'circle' ? 'cross' : 'circle')
		setGameState((prevState) => {
			const newState = [...prevState]
			const rowIndex = Math.floor(id / 3)
			const colIndex = id % 3
			newState[rowIndex][colIndex] = myCurrentPlayer
			return newState
		})
	}

	const squareClassName = `size-32 rounded-md ${
		currentPlayer !== playingAs ? 'cursor-not-allowed' : 'cursor-pointer'
	} ${
		finishedArrayState.includes(id)
			? `bg-${finishedState === playingAs ? 'sky' : 'red'}-500`
			: 'bg-zinc-800'
	}`

	return (
		<div onClick={clickOnSquare} className={squareClassName}>
			{currentElement === 'circle' && <img src="/circle.svg" alt="circle" />}
			{currentElement === 'cross' && <img src="/cross.svg" alt="cross" />}
		</div>
	)
}

export default Square
