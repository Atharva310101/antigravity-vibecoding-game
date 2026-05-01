/**
 * Voyager - Leaderboard & Persistence Layer
 * Agent B: Full-Stack/Cloud Architect
 */

(function() {
    // Global state bridge
    window.Voyager = window.Voyager || {};

    let db;
    let auth;
    let currentScore = 0;

    // Initialize Firebase components
    const initFirebase = async () => {
        try {
            // Using reserved URL auto-initialization via firebase.app()
            const app = firebase.app();
            db = app.firestore();
            auth = app.auth();

            // Anonymous authentication for leaderboard tracking
            await auth.signInAnonymously();
            console.log("Voyager: Firebase Persistence Layer Ready.");
        } catch (error) {
            console.error("Voyager: Firebase initialization error:", error);
        }
    };

    // Wait for the window to load to ensure Firebase scripts are ready
    window.addEventListener('load', initFirebase);

    /**
     * Show the leaderboard overlay and fetch scores
     * @param {number} score - The score achieved in the current run
     */
    window.Voyager.showLeaderboard = async (score) => {
        currentScore = score;
        const screen = document.getElementById('leaderboard-screen');
        if (!screen) return;

        // Reveal the screen
        screen.classList.remove('hidden');
        screen.style.display = 'flex';

        // Update current score display
        const scoreDisplay = document.getElementById('current-score-value');
        if (scoreDisplay) scoreDisplay.textContent = score;

        // Clear and show loading state for the list
        const scoreList = document.getElementById('score-list');
        if (scoreList) scoreList.innerHTML = '<li>LOADING...</li>';

        // Fetch top 10 scores
        await fetchTopScores();

        // Focus the initials input if it exists
        const initialsInput = document.getElementById('initials-input');
        if (initialsInput) {
            initialsInput.value = '';
            initialsInput.focus();
        }
    };

    /**
     * Fetch top 10 scores from Firestore
     */
    const fetchTopScores = async () => {
        if (!db) return;

        try {
            const snapshot = await db.collection('scores')
                .orderBy('score', 'desc')
                .limit(10)
                .get();

            const scoreList = document.getElementById('score-list');
            if (!scoreList) return;

            scoreList.innerHTML = '';

            if (snapshot.empty) {
                scoreList.innerHTML = '<li>NO RECORDS YET</li>';
                return;
            }

            snapshot.forEach(doc => {
                const data = doc.data();
                const li = document.createElement('li');
                li.innerHTML = `<span>${data.name}</span> <span>${data.score}</span>`;
                scoreList.appendChild(li);
            });
        } catch (error) {
            console.error("Error fetching scores:", error);
            const scoreList = document.getElementById('score-list');
            if (scoreList) scoreList.innerHTML = '<li>ERROR LOADING SCORES</li>';
        }
    };

    /**
     * Save a new score to Firestore
     * @param {string} name - 3-letter initials
     * @param {number} score - The score
     */
    const saveScore = async (name, score) => {
        if (!db || !auth.currentUser) return;

        try {
            await db.collection('scores').add({
                name: name.toUpperCase(),
                score: parseInt(score, 10),
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                uid: auth.currentUser.uid
            });
            
            // Refresh the list
            await fetchTopScores();
            
            // Hide input area after submission
            const inputArea = document.getElementById('initials-submission');
            if (inputArea) inputArea.style.display = 'none';
            
            const restartMsg = document.getElementById('restart-message');
            if (restartMsg) restartMsg.classList.remove('hidden');
        } catch (error) {
            console.error("Error saving score:", error);
            alert("FAILED TO SAVE SCORE. TRY AGAIN.");
        }
    };

    // Handle Input and Submission
    window.addEventListener('keydown', (e) => {
        const screen = document.getElementById('leaderboard-screen');
        if (!screen || screen.style.display === 'none' || screen.classList.contains('hidden')) return;

        // Restart logic: Enter to reset game (only if not typing initials)
        if (e.key === 'Enter') {
            const initialsInput = document.getElementById('initials-input');
            const restartMsg = document.getElementById('restart-message');
            
            // If initials are being shown and input is focused
            if (initialsInput && document.activeElement === initialsInput) {
                const val = initialsInput.value.trim().toUpperCase();
                if (val.length === 3) {
                    saveScore(val, currentScore);
                }
                return;
            }

            // If we are showing the restart message, trigger reset
            if (restartMsg && !restartMsg.classList.contains('hidden')) {
                window.Voyager.resetGame();
                screen.classList.add('hidden');
                screen.style.display = 'none';
            }
        }
    });

    // Enforce 3-letter limit and uppercase on input
    document.addEventListener('input', (e) => {
        if (e.target.id === 'initials-input') {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 3);
        }
    });

})();
