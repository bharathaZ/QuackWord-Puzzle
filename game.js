const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const clueArea = document.getElementById('clueArea');
const clueText = document.getElementById('clueText');
const answerBoxes = document.getElementById('answerBoxes');

// Set canvas size
canvas.width = 600;
canvas.height = 600;

// Configuration
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const centerRadius = 80;
const circleRadius = 40;  // Radius of outer circles
const orbitRadius = 200;  // Distance from center to outer circles

// Clue configuration
const clues = [
    { clue: "A reality TV show about a family of hunters", answer: "DYNASTY" },
    { clue: "A privacy-oriented web browser", answer: "DUCK GO" },
    { clue: "An egg laying mammal from Australia", answer: "BILLED PLATYPUS" },
    { clue: "Archenemy of Martian Commander X-2", answer: "DODGERS" },
    { clue: "An endearing custom started by Allison Parliament", answer: "DUCK JEEP" },
    { clue: "An animated TV show featuring the voice of David Tennant", answer: "TALES" },
    { clue: "(Noun) Something easy to do", answer: "SOUP" },
    { clue: "A dance move popularized by Chuck Berry", answer: "WALK" }
];

// Create duck image with cache-busting
const duckImage = new Image();
duckImage.crossOrigin = "Anonymous"; // Enable CORS
duckImage.src = 'duck.png?' + new Date().getTime();  // Cache busting

// Debug image loading
duckImage.onerror = (err) => {
    console.error('Error loading duck image:', err);
    // Draw a fallback yellow circle if image fails to load
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.stroke();
};

// Calculate positions for outer circles
const outerCircles = [];
for (let i = 0; i < 8; i++) {
    // Start from -π/2 (top) and go clockwise
    const angle = (-Math.PI/2) + (i * Math.PI * 2) / 8;
    outerCircles.push({
        x: centerX + Math.cos(angle) * orbitRadius,
        y: centerY + Math.sin(angle) * orbitRadius,
        number: i + 1 // Adding number property
    });
}

// Track which clues have been solved
const solvedClues = new Set();

// Define the mapping of clue indices to final answer positions and the final answer itself
const finalAnswerMapping = {
    0: { position: 0, letterIndex: 1 },  // Clue 1: Take 2nd letter -> position 1
    1: { position: 1, letterIndex: 5 },  // Clue 2: Take 6th letter -> position 2
    2: { position: 2, letterIndex: 12 }, // Clue 3: Take 13th letter -> position 3
    3: { position: 3, letterIndex: 5 },  // Clue 4: Take 6th letter -> position 4
    4: { position: 4, letterIndex: 0 },  // Clue 5: Take 1st letter -> position 5
    5: { position: 5, letterIndex: 3 },  // Clue 6: Take 4th letter -> position 6
    6: { position: 6, letterIndex: 0 },  // Clue 7: Take 1st letter -> position 7
    7: { position: 7, letterIndex: 3 }   // Clue 8: Take 4th letter -> position 8
};

function showClue(clueIndex) {
    if (clueIndex < 0 || clueIndex >= clues.length) return;
    
    const clue = clues[clueIndex];
    activeCircleIndex = clueIndex;
    clueDisplayed = true;
    
    // Display the clue text
    document.getElementById('clueText').textContent = clue.clue;
    document.getElementById('clueContainer').style.display = 'block';
    
    // Create answer boxes
    const answerBoxesContainer = document.getElementById('answerBoxes');
    answerBoxesContainer.innerHTML = '';
    answerBoxesContainer.style.display = 'flex';
    answerBoxesContainer.style.flexWrap = 'wrap';
    answerBoxesContainer.style.alignItems = 'center';
    answerBoxesContainer.style.gap = '5px';
    answerBoxesContainer.style.marginTop = '10px';
    
    // Split answer into words and filter out empty strings
    const words = clue.answer.split(' ').filter(word => word.length > 0);
    
    // Get the special letter position for this clue
    const specialPosition = finalAnswerMapping[clueIndex].letterIndex;
    let currentLetterIndex = 0;
    
    // Create answer boxes for each word
    words.forEach((word, wordIndex) => {
        // Create a container for this word's boxes
        const wordContainer = document.createElement('div');
        wordContainer.style.display = 'flex';
        wordContainer.style.gap = '5px';
        wordContainer.style.alignItems = 'center';
        
        // Create boxes for each letter in the word
        for (let i = 0; i < word.length; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.style.width = '30px';
            input.style.height = '30px';
            input.style.border = '2px solid #333';
            input.style.borderRadius = '5px';
            input.style.textAlign = 'center';
            input.style.fontSize = '20px';
            input.style.textTransform = 'uppercase';
            input.style.margin = '0 2px';
            input.className = 'answer-box';
            input.dataset.index = currentLetterIndex;
            
            // Highlight the special letter position with just a red border
            if (currentLetterIndex === specialPosition) {
                input.style.borderColor = '#FF0000';
                input.style.borderWidth = '3px';
            }
            
            // Add event listeners
            input.addEventListener('input', handleInput);
            input.addEventListener('keydown', handleKeydown);
            
            wordContainer.appendChild(input);
            currentLetterIndex++;
        }
        
        answerBoxesContainer.appendChild(wordContainer);
        
        // Add word separator dots if not the last word
        if (wordIndex < words.length - 1) {
            const dots = document.createElement('div');
            dots.textContent = '•';
            dots.style.margin = '0 5px';
            dots.style.color = '#666';
            dots.style.fontSize = '20px';
            answerBoxesContainer.appendChild(dots);
        }
    });
    
    // Focus the first input box
    const firstInput = document.querySelector('.answer-box');
    if (firstInput) {
        firstInput.focus();
    }
    
    drawGame();
}

function hideClue() {
    activeCircleIndex = -1;
    clueDisplayed = false;
    document.getElementById('clueContainer').style.display = 'none';
    document.getElementById('answerBoxes').innerHTML = '';
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
    drawGame();
}

function updateFinalAnswer(clueIndex, answer) {
    const mapping = finalAnswerMapping[clueIndex];
    if (mapping) {
        // Remove spaces from answer before getting the character
        const cleanAnswer = answer.replace(/\s+/g, '').toUpperCase();
        // Get the specified letter from the answer
        const letter = cleanAnswer.charAt(mapping.letterIndex);
        console.log(`Clue ${clueIndex + 1}: Taking letter ${mapping.letterIndex + 1} ("${letter}") from "${cleanAnswer}" and placing in position ${mapping.position + 1}`);
        const finalAnswerBox = document.querySelector(`.final-answer-box[data-index="${mapping.position}"]`);
        if (finalAnswerBox) {
            finalAnswerBox.textContent = letter;
        }
        
        // Check if all clues are solved
        if (solvedClues.size === 8) {
            setTimeout(() => {
                document.getElementById('congratsContainer').style.display = 'block';
            }, 1000);
        }
    }
}

function checkAnswer() {
    const clue = clues[activeCircleIndex];
    const answer = clue.answer.replace(/\s+/g, '').toUpperCase();
    const inputs = Array.from(document.getElementsByClassName('answer-box'));
    const userAnswer = inputs.map(input => input.value.toUpperCase()).join('');
    
    if (userAnswer === answer) {
        inputs.forEach(input => {
            input.classList.add('correct');
            input.disabled = true;
        });
        document.getElementById('successMessage').style.display = 'block';
        document.getElementById('errorMessage').style.display = 'none';
        
        // Mark the clue as solved
        solvedClues.add(activeCircleIndex);
        
        // Update the final answer
        updateFinalAnswer(activeCircleIndex, answer);
        
        // Keep the highlighting for a moment before hiding
        setTimeout(() => {
            hideClue();
        }, 2000);
    } else {
        inputs.forEach(input => {
            input.classList.add('incorrect');
        });
        document.getElementById('errorMessage').style.display = 'block';
        document.getElementById('successMessage').style.display = 'none';
        
        // Clear the incorrect class and input values after a short delay
        setTimeout(() => {
            inputs.forEach(input => {
                input.classList.remove('incorrect');
                input.value = ''; // Clear the input value
            });
            document.getElementById('errorMessage').style.display = 'none';
            // Focus the first input box after clearing
            if (inputs.length > 0) {
                inputs[0].focus();
            }
        }, 1000);
    }
}

// Add click event listener to canvas
canvas.addEventListener('click', handleCanvasClick);

function isPointInCircle(x, y, circleX, circleY, radius) {
    const dx = x - circleX;
    const dy = y - circleY;
    return dx * dx + dy * dy <= radius * radius;
}

function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check if a circle was clicked
    for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI / 4) - Math.PI / 2;
        const circleX = centerX + Math.cos(angle) * orbitRadius;
        const circleY = centerY + Math.sin(angle) * orbitRadius;
        
        const distance = Math.sqrt(
            Math.pow(x - circleX, 2) + 
            Math.pow(y - circleY, 2)
        );
        
        if (distance <= circleRadius) {
            showClue(i);
            return;
        }
    }
    
    // If click is outside any circle and a clue is displayed, hide it
    if (clueDisplayed) {
        hideClue();
    }
}

let activeCircleIndex = -1;  // Track which circle is currently active
let clueDisplayed = false;

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connecting lines first (so they appear behind the circles)
    for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI / 4) - Math.PI / 2;
        const endX = centerX + Math.cos(angle) * orbitRadius;
        const endY = centerY + Math.sin(angle) * orbitRadius;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(endX, endY);
        
        // Highlight the active line
        if (i === activeCircleIndex) {
            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 3;
        } else {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
        }
        ctx.stroke();
    }

    // Draw center circle with duck
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
    ctx.clip();
    
    if (duckImage && duckImage.complete && duckImage.naturalWidth !== 0) {
        const scale = Math.min(centerRadius * 2 / duckImage.naturalWidth, centerRadius * 2 / duckImage.naturalHeight);
        const duckWidth = duckImage.naturalWidth * scale;
        const duckHeight = duckImage.naturalHeight * scale;
        
        try {
            ctx.drawImage(
                duckImage,
                centerX - duckWidth/2,
                centerY - duckHeight/2,
                duckWidth,
                duckHeight
            );
        } catch (error) {
            console.error('Error drawing duck:', error);
        }
    }
    
    ctx.restore();
    
    // Draw center circle border
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw outer circles
    for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI / 4) - Math.PI / 2;
        const x = centerX + Math.cos(angle) * orbitRadius;
        const y = centerY + Math.sin(angle) * orbitRadius;

        ctx.beginPath();
        ctx.arc(x, y, circleRadius, 0, Math.PI * 2);
        
        // Fill color based on state
        if (solvedClues.has(i)) {
            ctx.fillStyle = '#FFF9C4';  // Light yellow for solved clues
        } else {
            ctx.fillStyle = '#fff';
        }
        ctx.fill();
        
        // Highlight active circle with stroke only
        if (i === activeCircleIndex) {
            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 3;
        } else {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
        }
        ctx.stroke();

        // Draw numbers
        ctx.fillStyle = '#333';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i + 1, x, y);
    }
}

// Wait for duck image to load then start drawing
duckImage.onload = () => {
    drawGame();
};

// Initial draw
drawGame();

// Add continuous redraw to ensure image appears
let attempts = 0;
const maxAttempts = 10;
const checkImage = setInterval(() => {
    if (duckImage.complete && duckImage.naturalWidth !== 0) {
        drawGame();
        clearInterval(checkImage);
    } else if (attempts >= maxAttempts) {
        clearInterval(checkImage);
        console.error('Failed to load duck image after multiple attempts');
    }
    attempts++;
}, 500);

function handleInput(e) {
    const input = e.target;
    input.value = input.value.toUpperCase();
    
    if (input.value) {
        // Find all inputs and check if we should validate
        const allInputs = Array.from(document.getElementsByClassName('answer-box'));
        const filledInputs = allInputs.filter(input => input.value);
        
        // Move to next input
        const nextInput = findNextInput(input);
        if (nextInput) {
            nextInput.focus();
        }
        
        // Check answer if all inputs are filled
        if (filledInputs.length === allInputs.length) {
            checkAnswer();
        }
    }
}

function handleKeydown(e) {
    if (e.key === 'Backspace' && !e.target.value) {
        const prevInput = findPrevInput(e.target);
        if (prevInput) {
            prevInput.focus();
            e.preventDefault();
        }
    }
}

function findNextInput(currentInput) {
    const allInputs = Array.from(document.getElementsByClassName('answer-box'));
    const currentIndex = allInputs.indexOf(currentInput);
    if (currentIndex !== -1 && currentIndex < allInputs.length - 1) {
        return allInputs[currentIndex + 1];
    }
    return null;
}

function findPrevInput(currentInput) {
    const allInputs = Array.from(document.getElementsByClassName('answer-box'));
    const currentIndex = allInputs.indexOf(currentInput);
    if (currentIndex > 0) {
        return allInputs[currentIndex - 1];
    }
    return null;
}

document.head.insertAdjacentHTML('beforeend', `
    <style>
        #answerBoxes {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 5px;
            margin-top: 10px;
        }

        .word-container {
            display: flex;
            gap: 5px;
            align-items: center;
        }

        .answer-box {
            width: 30px;
            height: 30px;
            border: 2px solid #333;
            border-radius: 5px;
            text-align: center;
            font-size: 20px;
            text-transform: uppercase;
            margin: 0 2px;
            padding: 0;
            box-sizing: border-box;
        }

        .word-separator {
            margin: 0 5px;
            color: #666;
            font-size: 20px;
        }

        .answer-box.correct {
            background-color: #90EE90;
            border-color: #008000 !important;
        }

        .answer-box.incorrect {
            background-color: #FFB6C1;
            border-color: #FF0000 !important;
        }

        .special-letter {
            background-color: #FFE4B5;
            border-color: #FFA500;
            position: relative;
        }

        .special-letter::after {
            content: '★';
            position: absolute;
            top: -15px;
            right: -5px;
            font-size: 12px;
            color: #FFA500;
        }

        #clueContainer {
            margin-top: 20px;
            text-align: center;
        }

        #clueText {
            font-size: 18px;
            margin-bottom: 10px;
        }
    </style>
`); 