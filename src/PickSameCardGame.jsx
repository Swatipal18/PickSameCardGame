import React, { useState, useEffect } from 'react';

export default function PickSameCardGame() {
    // Game states
    const [gameState, setGameState] = useState('player1Entry');
    const [player1, setPlayer1] = useState('');
    const [player2, setPlayer2] = useState('');
    const [currentPlayer, setCurrentPlayer] = useState('');
    const [cards, setCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedCards, setMatchedCards] = useState([]);
    const [scores, setScores] = useState({ player1: 0, player2: 0 });
    const [winner, setWinner] = useState(null);
    const [tempName, setTempName] = useState('');

    // Initialize cards
    useEffect(() => {
        if (gameState === 'game') {
            const cardTypes = ['🍎', '🍌', '🍇', '🍓', '🍒', '🍍', '🥭', '🍊', '🥝', '🥧'];
            const initialCards = [...cardTypes, ...cardTypes].map((type, index) => ({
                id: index,
                type,
                flipped: false,
                matched: false
            }));

            // Shuffle cards
            for (let i = initialCards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [initialCards[i], initialCards[j]] = [initialCards[j], initialCards[i]];
            }

            setCards(initialCards);
        }
    }, [gameState]);

    // Handle card click
    const handleCardClick = (id) => {
        if (flippedCards.length === 2 ||
            cards.find(card => card.id === id).flipped ||
            matchedCards.includes(id)) {
            return;
        }

        // Flip the card
        setCards(prevCards =>
            prevCards.map(card =>
                card.id === id ? { ...card, flipped: true } : card
            )
        );

        // Add to flipped cards
        setFlippedCards(prev => [...prev, id]);

        // If two cards are flipped, check for match
        if (flippedCards.length === 1) {
            setTimeout(() => {
                const firstCard = cards.find(card => card.id === flippedCards[0]);
                const secondCard = cards.find(card => card.id === id);

                if (firstCard.type === secondCard.type) {
                    // Match found
                    setMatchedCards(prev => [...prev, flippedCards[0], id]);
                    setScores(prev => ({
                        ...prev,
                        [currentPlayer]: prev[currentPlayer] + 1
                    }));
                } else {
                    // No match, next player's turn
                    setCurrentPlayer(currentPlayer === 'player1' ? 'player2' : 'player1');
                }

                // Reset flipped cards
                setFlippedCards([]);

                // Reset flipped state for non-matched cards
                setCards(prevCards =>
                    prevCards.map(card =>
                        matchedCards.includes(card.id) || (card.id === flippedCards[0] && card.type === secondCard.type) || (card.id === id && card.type === firstCard.type)
                            ? card
                            : { ...card, flipped: false }
                    )
                );

                // Check if game is over
                if (matchedCards.length + 2 === cards.length && firstCard.type === secondCard.type) {
                    // All cards matched, game over
                    setTimeout(() => {
                        const finalScores = {
                            player1: scores.player1 + (firstCard.type === secondCard.type && currentPlayer === 'player1' ? 1 : 0),
                            player2: scores.player2 + (firstCard.type === secondCard.type && currentPlayer === 'player2' ? 1 : 0)
                        };

                        let gameWinner;
                        if (finalScores.player1 > finalScores.player2) {
                            gameWinner = player1;
                        } else if (finalScores.player2 > finalScores.player1) {
                            gameWinner = player2;
                        } else {
                            gameWinner = 'Tie';
                        }

                        setWinner(gameWinner);
                        setGameState('gameOver');
                    }, 1000);
                }
            }, 1000);
        }
    };

    // Handle player name entry
    const handlePlayerSubmit = (playerNum) => {
        if (tempName.trim()) {
            if (playerNum === 1) {
                setPlayer1(tempName);
                sessionStorage.setItem('player1', tempName);
                setGameState('player2Entry');
            } else {
                setPlayer2(tempName);
                sessionStorage.setItem('player2', tempName);
                setGameState('playerSelection');
            }
            setTempName('');
        }
    };

    // Handle first player selection
    const handleFirstPlayerSelect = (player) => {
        setCurrentPlayer(player);
        setGameState('game');
    };

    // Reset game
    const resetGame = () => {
        setGameState('player1Entry');
        setPlayer1('');
        setPlayer2('');
        setCurrentPlayer('');
        setCards([]);
        setFlippedCards([]);
        setMatchedCards([]);
        setScores({ player1: 0, player2: 0 });
        setWinner(null);
        sessionStorage.removeItem('player1');
        sessionStorage.removeItem('player2');
    };

    // Render different game states
    const renderGameState = () => {
        switch (gameState) {
            case 'player1Entry':
                return (
                    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
                        <h2 className="text-2xl font-bold mb-4 text-center text-indigo-700">Welcome to Memory Game!</h2>
                        <div>
                            <label className="block mb-2 font-medium text-gray-700">Enter Player 1 Name:</label>
                            <input
                                type="text"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handlePlayerSubmit(1)}
                                className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                placeholder="Enter name"
                            />
                            <button
                                onClick={() => handlePlayerSubmit(1)}
                                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors"
                                disabled={!tempName.trim()}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                );

            case 'player2Entry':
                return (
                    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
                        <h2 className="text-2xl font-bold mb-4 text-center text-indigo-700">Welcome {player1}!</h2>
                        <div>
                            <label className="block mb-2 font-medium text-gray-700">Enter Player 2 Name:</label>
                            <input
                                type="text"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handlePlayerSubmit(2)}
                                className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                placeholder="Enter name"
                            />
                            <button
                                onClick={() => handlePlayerSubmit(2)}
                                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors"
                                disabled={!tempName.trim()}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                );

            case 'playerSelection':
                return (
                    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
                        <h2 className="text-2xl font-bold mb-4 text-center text-indigo-700">Who plays first?</h2>
                        <div className="space-y-3">
                            <button
                                onClick={() => handleFirstPlayerSelect('player1')}
                                className="w-full bg-blue-500 text-white py-3 rounded-lg text-lg font-medium hover:bg-blue-600 transition-colors"
                            >
                                {player1}
                            </button>
                            <button
                                onClick={() => handleFirstPlayerSelect('player2')}
                                className="w-full bg-green-500 text-white py-3 rounded-lg text-lg font-medium hover:bg-green-600 transition-colors"
                            >
                                {player2}
                            </button>
                        </div>
                    </div>
                );

            case 'game':
                return (
                    <div className="game-container max-w-xl mx-auto">
                        <div className="flex justify-between items-center mb-4 p-3 bg-gray-100 rounded-lg shadow">
                            <div className={`p-2 rounded-md ${currentPlayer === 'player1' ? 'bg-blue-200 font-bold' : ''}`}>
                                {player1}: {scores.player1}
                            </div>
                            <div className="text-lg font-medium text-indigo-800">
                                Turn: {currentPlayer === 'player1' ? player1 : player2}
                            </div>
                            <div className={`p-2 rounded-md ${currentPlayer === 'player2' ? 'bg-green-200 font-bold' : ''}`}>
                                {player2}: {scores.player2}
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                            {cards.map(card => (
                                <div
                                    key={card.id}
                                    className={`relative h-24 cursor-pointer transition-transform duration-300 ${card.flipped || matchedCards.includes(card.id) ? 'transform rotate-y-180' : ''}`}
                                    onClick={() => handleCardClick(card.id)}
                                >
                                    <div className="w-full h-full relative">
                                        <div className={`absolute w-full h-full flex items-center justify-center bg-indigo-600 text-white rounded-lg transition-opacity duration-300 ${card.flipped || matchedCards.includes(card.id) ? 'opacity-0' : 'opacity-100'}`}>
                                            ?
                                        </div>
                                        <div className={`absolute w-full h-full flex items-center justify-center bg-white text-4xl rounded-lg border-2 transition-opacity duration-300 ${matchedCards.includes(card.id) ? 'border-green-500' : 'border-gray-300'} ${card.flipped || matchedCards.includes(card.id) ? 'opacity-100' : 'opacity-0'}`}>
                                            {card.type}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'gameOver':
                return (
                    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-4 text-indigo-700">Game Over!</h2>
                        {winner === 'Tie' ? (
                            <p className="text-xl mb-6">It's a tie!</p>
                        ) : (
                            <p className="text-xl mb-6">Winner: <span className="font-bold text-indigo-600">{winner}</span>!</p>
                        )}

                        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                            <p className="text-lg">{player1}: {scores.player1} points</p>
                            <p className="text-lg">{player2}: {scores.player2} points</p>
                        </div>

                        <button
                            onClick={resetGame}
                            className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Play Again
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-blue-100 py-8 px-4">
            <h1 className="text-4xl font-bold text-center mb-8 text-indigo-800">Memory Card Game</h1>
            {renderGameState()}
        </div>
    );
}