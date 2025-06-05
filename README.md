# Duck Rotation Puzzle Game

A web-based puzzle game featuring a circular layout of clues centered around a rubber duck. Players solve clues to reveal a final two-word answer.

## Running Locally

1. Make sure you have Python installed on your computer
2. Clone or download this repository
3. Open a terminal/command prompt and navigate to the project directory
4. Run the following command to start a local web server:

```bash
# If you're using Python 3
python3 -m http.server 8000

# If you're using Python 2
python -m SimpleHTTPServer 8000
```

5. Open your web browser and go to: `http://localhost:8000`

## Sharing with Others

There are several ways to share this game:

### Option 1: GitHub Pages (Recommended)
1. Create a GitHub repository
2. Upload all the files to the repository
3. Go to repository Settings > Pages
4. Enable GitHub Pages and select your main branch
5. Your game will be available at: `https://[your-username].github.io/[repository-name]`

### Option 2: Any Web Hosting Service
You can host these files on any web hosting service that supports static websites, such as:
- Netlify
- Vercel
- Firebase Hosting
- Amazon S3

## Files Included
- `index.html` - The main game page
- `game.js` - Game logic and functionality
- `duck.png` - Duck image asset
- `README.md` - This documentation file

## Game Features
- Circular layout with 8 clues
- Interactive clue selection and answer validation
- Special letter highlighting
- Final answer display
- Congratulatory message upon completion 