/**
 * Voyager - Core Game Engine
 * Agent A (Lead Game Developer)
 */

(function() {
    // --- Constants & Config ---
    const BASE_SPEED = 2.5;
    const BOOST_MULTIPLIER = 2.0;
    const BRAKE_MULTIPLIER = 0.5;
    const SHIP_SIZE = 20;
    const STAR_RADIUS = 5;
    const CONNECTION_RADIUS = 15;
    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 600;

    // States
    const STATES = {
        START: 'START',
        PLAYING: 'PLAYING',
        FAIL: 'FAIL',
        WIN: 'WIN'
    };

    // Constellation Data (Zodiac)
    const CONSTELLATIONS = [
        { name: 'ARIES', stars: [{x: 100, y: 100}, {x: 250, y: 150}, {x: 400, y: 300}, {x: 500, y: 500}] },
        { name: 'TAURUS', stars: [{x: 600, y: 100}, {x: 500, y: 200}, {x: 400, y: 150}, {x: 300, y: 300}, {x: 200, y: 400}] },
        { name: 'GEMINI', stars: [{x: 100, y: 500}, {x: 200, y: 400}, {x: 300, y: 400}, {x: 400, y: 500}, {x: 500, y: 400}, {x: 600, y: 400}] },
        { name: 'CANCER', stars: [{x: 400, y: 100}, {x: 400, y: 250}, {x: 300, y: 400}, {x: 500, y: 400}] },
        { name: 'LEO', stars: [{x: 700, y: 300}, {x: 600, y: 200}, {x: 500, y: 200}, {x: 400, y: 300}, {x: 400, y: 450}, {x: 550, y: 500}] },
        { name: 'VIRGO', stars: [{x: 100, y: 200}, {x: 250, y: 250}, {x: 400, y: 200}, {x: 400, y: 400}, {x: 550, y: 450}, {x: 700, y: 400}] },
        { name: 'LIBRA', stars: [{x: 300, y: 200}, {x: 500, y: 200}, {x: 600, y: 400}, {x: 400, y: 500}, {x: 200, y: 400}] },
        { name: 'SCORPIO', stars: [{x: 700, y: 100}, {x: 600, y: 200}, {x: 500, y: 300}, {x: 400, y: 400}, {x: 300, y: 500}, {x: 200, y: 450}, {x: 150, y: 350}] },
        { name: 'SAGITTARIUS', stars: [{x: 200, y: 200}, {x: 300, y: 150}, {x: 400, y: 200}, {x: 500, y: 250}, {x: 450, y: 400}, {x: 350, y: 450}, {x: 250, y: 400}] },
        { name: 'CAPRICORN', stars: [{x: 100, y: 300}, {x: 300, y: 100}, {x: 600, y: 200}, {x: 700, y: 400}, {x: 400, y: 500}] },
        { name: 'AQUARIUS', stars: [{x: 200, y: 100}, {x: 400, y: 150}, {x: 600, y: 100}, {x: 700, y: 300}, {x: 500, y: 400}, {x: 300, y: 500}, {x: 100, y: 400}] },
        { name: 'PISCES', stars: [{x: 100, y: 100}, {x: 200, y: 300}, {x: 400, y: 400}, {x: 600, y: 300}, {x: 700, y: 100}, {x: 500, y: 500}, {x: 300, y: 550}] }
    ];

    // --- State Variables ---
    let currentState = STATES.START;
    let currentLevel = 0;
    let score = 0;
    let timeLeft = 60;
    let timerInterval = null;
    let animationId = null;

    const ship = {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        vx: 0,
        vy: 0,
        angle: 0
    };

    const keys = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        Shift: false,
        z: false,
        d: false
    };

    const connectedStars = [];
    
    // --- DOM Elements ---
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const startScreen = document.getElementById('start-screen');
    const failScreen = document.getElementById('fail-screen');
    const winScreen = document.getElementById('win-screen');
    const uiContainer = document.getElementById('ui-container');
    const hud = document.getElementById('hud');
    const timerVal = document.getElementById('timer-value');
    const levelNameVal = document.getElementById('level-name-value');
    const starsVal = document.getElementById('stars-value');

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // --- Global Bridge ---
    window.Voyager = window.Voyager || {};
    
    window.Voyager.resetGame = () => {
        resetGameState();
        changeState(STATES.START);
    };

    // Store the engine's stop logic but don't overwrite if leaderboard.js has its own showLeaderboard
    const originalShowLeaderboard = window.Voyager.showLeaderboard;
    window.Voyager.showLeaderboard = (finalScore) => {
        cancelAnimationFrame(animationId);
        clearInterval(timerInterval);
        console.log("Game Ended. Score:", finalScore);
        
        // If leaderboard.js provided a function, call it to show the UI
        if (typeof originalShowLeaderboard === 'function') {
            originalShowLeaderboard(finalScore);
        } else {
            // Fallback: if leaderboard.js didn't load, at least log it
            document.getElementById('leaderboard-screen').classList.remove('hidden');
            document.getElementById('leaderboard-screen').style.display = 'flex';
        }
    };

    // --- Input Handling ---
    window.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
        
        // State Transitions via Enter
        if (e.key === 'Enter') {
            if (currentState === STATES.START) {
                changeState(STATES.PLAYING);
            } else if (currentState === STATES.FAIL) {
                resetGameState();
                changeState(STATES.PLAYING);
            } else if (currentState === STATES.WIN) {
                // Handoff to leaderboard
                window.Voyager.showLeaderboard(score);
                winScreen.classList.add('hidden');
            }
        }

        // Dev Shortcut: Shift + D
        if (e.shiftKey && e.key === 'D') {
            winGame();
        }
    });

    window.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
    });

    // --- Logic ---
    function resetGameState() {
        currentLevel = 0;
        score = 0;
        timeLeft = 60;
        ship.x = CANVAS_WIDTH / 2;
        ship.y = CANVAS_HEIGHT / 2;
        ship.vx = 0;
        ship.vy = 0;
        ship.angle = 0;
        connectedStars.length = 0;
    }

    function changeState(newState) {
        currentState = newState;
        
        // Hide all overlays
        startScreen.classList.add('hidden');
        failScreen.classList.add('hidden');
        winScreen.classList.add('hidden');
        const lbScreen = document.getElementById('leaderboard-screen');
        if (lbScreen) lbScreen.classList.add('hidden');
        if (hud) hud.classList.add('hidden');

        if (newState === STATES.START) {
            startScreen.classList.remove('hidden');
        } else if (newState === STATES.PLAYING) {
            if (hud) hud.classList.remove('hidden');
            startLevel();
            gameLoop();
        } else if (newState === STATES.FAIL) {
            failScreen.classList.remove('hidden');
        } else if (newState === STATES.WIN) {
            winScreen.classList.remove('hidden');
            score = Math.floor(timeLeft * 100) + (currentLevel * 500);
        }
    }

    function startLevel() {
        connectedStars.length = 0;
        // Decrease time limit as levels progress
        timeLeft = Math.max(10, 60 - currentLevel * 4);
        
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (currentState === STATES.PLAYING) {
                timeLeft--;
                if (timeLeft <= 0) {
                    changeState(STATES.FAIL);
                }
            }
        }, 1000);
    }

    function update() {
        if (currentState !== STATES.PLAYING) return;

        // 8-Way Movement
        let dx = 0;
        let dy = 0;

        if (keys.ArrowUp) dy -= 1;
        if (keys.ArrowDown) dy += 1;
        if (keys.ArrowLeft) dx -= 1;
        if (keys.ArrowRight) dx += 1;

        // Normalize vector for diagonal movement
        if (dx !== 0 || dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;

            // Update angle to face movement
            ship.angle = Math.atan2(dy, dx);
        }

        // Apply speed multipliers
        let currentSpeed = BASE_SPEED;
        if (keys.Shift) currentSpeed *= BOOST_MULTIPLIER;
        if (keys.z) currentSpeed *= BRAKE_MULTIPLIER;

        ship.vx = dx * currentSpeed;
        ship.vy = dy * currentSpeed;

        // Update Position
        ship.x += ship.vx;
        ship.y += ship.vy;

        // Boundary Check
        if (ship.x < 0) ship.x = 0;
        if (ship.x > CANVAS_WIDTH) ship.x = CANVAS_WIDTH;
        if (ship.y < 0) ship.y = 0;
        if (ship.y > CANVAS_HEIGHT) ship.y = CANVAS_HEIGHT;

        // Trace Logic
        const currentConstellation = CONSTELLATIONS[currentLevel];
        const nextStarIndex = connectedStars.length;
        
        if (nextStarIndex < currentConstellation.stars.length) {
            const targetStar = currentConstellation.stars[nextStarIndex];
            const dist = Math.sqrt((ship.x - targetStar.x) ** 2 + (ship.y - targetStar.y) ** 2);
            
            if (dist < CONNECTION_RADIUS) {
                connectedStars.push(targetStar);
                
                // Level Complete?
                if (connectedStars.length === currentConstellation.stars.length) {
                    currentLevel++;
                    if (currentLevel >= CONSTELLATIONS.length) {
                        changeState(STATES.WIN);
                    } else {
                        startLevel();
                    }
                }
            }
        }

        // Update HUD
        if (timerVal) timerVal.innerText = timeLeft;
        if (levelNameVal) levelNameVal.innerText = CONSTELLATIONS[currentLevel].name;
        if (starsVal) starsVal.innerText = `${connectedStars.length}/${CONSTELLATIONS[currentLevel].stars.length}`;
    }

    function draw() {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw Background Stars (Static)
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        for (let i = 0; i < 50; i++) {
            ctx.beginPath();
            ctx.arc((i * 137) % CANVAS_WIDTH, (i * 271) % CANVAS_HEIGHT, 1, 0, Math.PI * 2);
            ctx.fill();
        }

        const currentConstellation = CONSTELLATIONS[currentLevel];
        if (!currentConstellation) return;

        // Draw Constellation Guide Lines (Dotted)
        ctx.strokeStyle = "rgba(0, 255, 255, 0.4)";
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        currentConstellation.stars.forEach((star, i) => {
            if (i === 0) ctx.moveTo(star.x, star.y);
            else ctx.lineTo(star.x, star.y);
        });
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw Connected Lines (Solid Neon)
        if (connectedStars.length > 1) {
            ctx.strokeStyle = "#00ffff";
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#00ffff";
            ctx.beginPath();
            connectedStars.forEach((star, i) => {
                if (i === 0) ctx.moveTo(star.x, star.y);
                else ctx.lineTo(star.x, star.y);
            });
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Draw Stars
        currentConstellation.stars.forEach((star, i) => {
            const isConnected = i < connectedStars.length;
            ctx.fillStyle = isConnected ? "#00ffff" : "rgba(0, 255, 255, 0.3)";
            ctx.beginPath();
            ctx.arc(star.x, star.y, STAR_RADIUS, 0, Math.PI * 2);
            ctx.fill();
            
            // Highlight the NEXT star to connect
            if (i === connectedStars.length && currentState === STATES.PLAYING) {
                const pulse = Math.sin(Date.now() / 200) * 5 + 10;
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(star.x, star.y, pulse, 0, Math.PI * 2);
                ctx.stroke();
            }

            if (isConnected) {
                ctx.shadowBlur = 15;
                ctx.shadowColor = "#00ffff";
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        });

        // Draw Ship
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.angle);
        
        ctx.fillStyle = "#ff00bb";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ff00bb";
        
        // Simple triangle ship
        ctx.beginPath();
        ctx.moveTo(SHIP_SIZE, 0);
        ctx.lineTo(-SHIP_SIZE / 2, -SHIP_SIZE / 2);
        ctx.lineTo(-SHIP_SIZE / 2, SHIP_SIZE / 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }

    function gameLoop() {
        update();
        draw();
        animationId = requestAnimationFrame(gameLoop);
    }

    function winGame() {
        score = Math.floor(timeLeft * 100) + (currentLevel * 500);
        changeState(STATES.WIN);
    }

    // Buttons removed as we use Enter key per index.html design

})();
