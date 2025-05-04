// Custom Cursor Animation
gsap.set('.follower', {
    xPercent: -50,
    yPercent: -50,
    opacity: 1
});

let mouseMoveTimeout;
let isHoveringInteractiveElement = false;
let starredQuestions = new Array(150).fill(false);

// Add these variables at the top with other global variables
let studentName = '';
let stopwatchInterval = null;
let stopwatchTime = 0;
let timerInterval = null;
let timerTime = 0;
let isStopwatchRunning = false;
let isTimerRunning = false;
let lastStopwatchClick = 0;
let lastTimerClick = 0;

// Custom Quiz Variables
let customQuestions = [];
let isCustomQuiz = false;

// Modal Elements
const modal = document.getElementById('file-upload-modal');
const closeModal = document.querySelector('.close-modal');
const customizedQuizBtn = document.getElementById('customized-quiz-btn');
const quizFileInput = document.getElementById('quiz-file');
const processFileBtn = document.getElementById('process-file-btn');

// Function to detect idle time and expand cursor
function expandCursor() {
    if (isHoveringInteractiveElement) {
        animateFollower('in');
    }
}

// Detect mouse movement and stop idle detection after movement
window.addEventListener("mousemove", (e) => {
    // Reset timeout whenever mouse moves
    clearTimeout(mouseMoveTimeout);

    gsap.to('.follower', {
        duration: 1.5,
        overwrite: "auto",
        x: e.clientX,
        y: e.clientY,
        stagger: 0.15,
        ease: 'power3.out',
    });

    let TL = gsap.timeline({
        defaults: { duration: 0.5, ease: "none" }
    });

    TL.to('.follower', {
        scale: 1,
        overwrite: "auto",
        stagger: { amount: 0.15, from: "start", ease: "none" }
    });
    TL.to(
        '.follower',
        {
            overwrite: "auto",
            stagger: { amount: 0.15, from: "end", ease: "none" }
        },
        "<+=2.5"
    );

    // Start the timer to trigger expansion if no movement
    mouseMoveTimeout = setTimeout(expandCursor, 1000); // 1 second idle time
});

// Follower animation setup
var follower = document.querySelector('.follower');
var followerText = document.querySelector('.follower__content');

let followerAnim = gsap.timeline({ paused: true, overwrite: true });
let followerLeave = gsap.timeline({ paused: true, overwrite: true });

// Animation to expand the follower cursor
followerAnim.to(follower, {
    width: '100px', // Expand size when hovering
    height: '100px', // Expand size when hovering
    backgroundColor: 'transparent', // Keep transparent
    border: '2px solid rgba(255, 255, 255, 0.8)', // Border visible
    duration: 0.15,
    ease: "power2.out",
    scale: 1,
}, 0);
followerAnim.to(follower, {
    scale: 1,
    duration: 0.1,
    ease: "power2.out",
}, ">");
followerAnim.to('.follower__inner', {
    backgroundColor: 'transparent', // Inner part stays transparent
    width: '100px', // Expand size when hovering
    height: '100px', // Expand size when hovering
    opacity: 1,
    duration: 0.15,
    ease: "power2.out",
    border: '2px solid rgba(255, 255, 255, 0.8)', // Border remains visible
    scale: 1,
}, 0.1);
followerAnim.to('.follower__inner', {
    scale: 1,
    duration: 0.1,
    ease: "power2.out",
}, ">");
followerAnim.to('.follower__content', {
    height: "0",
});

// Animation to shrink the follower cursor back to default size
followerLeave.to('.follower__content', {
    height: "0",
    duration: 0.1
});
followerLeave.to(follower, {
    width: '8px', // Shrink back to small size
    height: '8px', // Shrink back to small size
    backgroundColor: 'transparent', // Keep transparent
    border: '2px solid rgba(255, 255, 255, 0.8)', // Border remains visible
    duration: 0.1,
    ease: "power2.out",
    scale: 1,
});
followerLeave.to(follower, {
    scale: 1,
    duration: 0.05,
    ease: "power2.out",
}, ">");
followerLeave.to('.follower__inner', {
    backgroundColor: 'transparent', // Keep inner transparent
    width: '8px', // Shrink to smaller size
    height: '8px', // Shrink to smaller size
    opacity: 0,
    duration: 0.1,
    ease: "power2.out",
    border: '2px solid rgba(255, 255, 255, 0.8)', // Border remains visible
    scale: 1,
});
followerLeave.to('.follower__inner', {
    scale: 1,
    duration: 0.05,
    ease: "power2.out",
}, ">");
followerLeave.to(followerText, { height: '0' });

function animateFollower(direction = 'in') {
    // Ensure we only play one animation at a time, stop any other animation if it's already running
    if (direction == 'in') {
        followerAnim.restart(); // Restart the animation to avoid stacking or skipping
    } else {
        followerLeave.restart(); // Restart the shrink animation
    }
}

// Add hover effects to interactive elements
document.querySelectorAll('.option-btn, .btn, .preview-btn, .mark-btn, .control-btn, .theme-btn').forEach(item => {
    item.addEventListener('mouseenter', event => {
        isHoveringInteractiveElement = true; // Mouse is over an interactive element
        var text = item.dataset.followerText || "Click";
        followerText.innerHTML = text;
        animateFollower('in');
    });

    item.addEventListener('mouseleave', event => {
        isHoveringInteractiveElement = false; // Mouse leaves the interactive element
        animateFollower('out');
    });
});

const questions = Array.from({ length: 150 }, (_, i) => ({
    question: `Question ${i + 1}`,
    options: [
        ` Option A for Question ${i + 1}`,
        ` Option B for Question ${i + 1}`,
        ` Option C for Question ${i + 1}`,
        ` Option D for Question ${i + 1}`,
        ` Option E for Question ${i + 1}`
    ]
}));

let currentQuestionIndex = 0;
let userAnswers = new Array(questions.length).fill(null);
let originalAnswers = new Array(questions.length).fill(null);
let correctedAnswers = new Array(questions.length).fill(null);
let score = 0;
let isSubmitted = false;
let totalQuestions = 150;

const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const nextButton = document.getElementById('next-button');
const submitButton = document.getElementById('submit-quiz');
const backButton = document.getElementById('back-button');
const reviewContainer = document.getElementById('review-container');
const questionPreview = document.getElementById('question-preview');

// Menu functionality
const menuToggle = document.getElementById('menu-toggle');
const menuPanel = document.getElementById('menu-panel');
const closeMenu = document.getElementById('close-menu');
const mainContainer = document.querySelector('.container');

// Function to open menu
function openMenu() {
    menuPanel.classList.add('open');
    mainContainer.style.filter = 'blur(3px)';
    mainContainer.style.pointerEvents = 'none';
    const quizContainer = document.querySelector('.quiz-container');
    if (quizContainer) {
        quizContainer.style.marginLeft = '320px';
    }
}

// Function to close menu
function closeMenuPanel() {
    menuPanel.classList.remove('open');
    mainContainer.style.filter = '';
    mainContainer.style.pointerEvents = '';
    const quizContainer = document.querySelector('.quiz-container');
    if (quizContainer) {
        quizContainer.style.marginLeft = '20px';
    }
}

// Toggle menu on menu icon click
menuToggle.addEventListener('click', function(e) {
    e.stopPropagation(); // Prevent event from bubbling
    if (menuPanel.classList.contains('open')) {
        closeMenuPanel();
    } else {
        openMenu();
    }
});

// Close menu when clicking close button
closeMenu.addEventListener('click', closeMenuPanel);

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!menuPanel.contains(e.target) && !menuToggle.contains(e.target) && menuPanel.classList.contains('open')) {
        closeMenuPanel();
    }
});

// Handle responsive behavior
function handleResize() {
    const quizContainer = document.querySelector('.quiz-container');
    if (quizContainer) {
        if (window.innerWidth <= 768) {
            quizContainer.style.marginLeft = '0';
        } else if (menuPanel.classList.contains('open')) {
            quizContainer.style.marginLeft = '320px';
        }
    }
}

window.addEventListener('resize', handleResize);

// Add toggle button functionality
function createToggleButton() {
    // Remove any existing toggle button first
    const existingToggleBtn = document.querySelector('.toggle-review-btn');
    if (existingToggleBtn) {
        existingToggleBtn.remove();
    }

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-review-btn';
    toggleBtn.onclick = toggleReviewPanel;
    
    // Set initial text
    toggleBtn.innerHTML = `
        <i class="fas fa-clipboard-list toggle-icon"></i>
        <span class="toggle-label">Show Review</span>
    `;
    
    document.body.appendChild(toggleBtn);
    return toggleBtn;
}

// Update startQuiz function to create toggle button
function startQuiz() {
    // Get student name if provided
    studentName = document.getElementById('student-name').value.trim();
    
    // Show menu toggle button
    menuToggle.style.display = 'flex';
    
    // Hide setup panel and show quiz interface
    document.querySelector('.quiz-setup-container').style.display = 'none';
    document.querySelector('.quiz-container').style.display = 'flex';
    document.querySelector('.sidebar').style.display = 'block';
    
    // Create control panel if it doesn't exist
    if (!document.querySelector('.control-panel')) {
        const controlPanel = document.createElement('div');
        controlPanel.className = 'control-panel';
        controlPanel.innerHTML = `
            <div class="control-row">
                <div class="progress-row">
                    <span id="progress-percentage">0%</span>
                </div>
            </div>
            <div class="control-row">
                <button id="stopwatch-toggle" class="control-btn">
                    <i class="fas fa-stopwatch"></i> Stopwatch: 00:00:00
                </button>
            </div>
            <div class="control-row">
                <button id="timer-toggle" class="control-btn">
                    <i class="fas fa-hourglass-start"></i> Timer: --:--:--
                </button>
            </div>
            <div class="control-row">
                <button id="set-timer" class="control-btn">
                    <i class="fas fa-clock"></i> Set Timer
                </button>
            </div>
            <div class="control-row">
                <button id="save-button" class="control-btn">
                    <i class="fas fa-save"></i> Save
                </button>
                <button id="reset-button" class="control-btn">
                    <i class="fas fa-undo"></i> Reset
                </button>
            </div>
            <div class="control-row theme-row">
                <button id="theme-toggle" class="theme-btn">
                    <i class="fas fa-moon"></i> Dark Mode
                </button>
            </div>
            <div class="control-row">
                <button id="cursor-toggle" class="cursor-toggle-btn">
                    <i class="fas fa-mouse-pointer"></i> Cursor On
                </button>
            </div>
            <div class="control-row submit-row">
                <button id="submit-quiz" class="control-btn">
                    <i class="fas fa-paper-plane"></i> Submit Quiz
                </button>
            </div>
            <div class="control-row paper-checked-row" style="display: none;">
                <button id="paper-checked-button" class="control-btn">
                    <i class="fas fa-check-double"></i> Paper Checked
                </button>
            </div>
            <div class="control-row dashboard-row" style="display: none;">
                <button id="dashboard-button" class="control-btn" disabled>
                    <i class="fas fa-chart-bar"></i> Dashboard
                </button>
            </div>
            <div class="control-row new-feature-row">
                <button id="new-feature-btn" class="control-btn">
                    <i class="fas fa-key"></i> Create Answer Key
                </button>
            </div>
        `;
        document.body.appendChild(controlPanel);
    }
    
    // Initialize quiz state
    currentQuestionIndex = 0;
    userAnswers = new Array(totalQuestions).fill(null);
    score = 0;
    isSubmitted = false;
    
    // Clear any previous selections
    document.getElementById('selected-options-list').innerHTML = '';
    
    // Make sure download button is visible
    document.getElementById("new-download-btn").style.display = "block";
    
    // Show submit button in menu and make sure it's visible
    const submitButton = document.getElementById('submit-quiz');
    submitButton.style.display = 'block';
    document.querySelector('.submit-row').style.display = 'flex';
    
    // Show new feature button for regular quiz
    document.querySelector('.new-feature-row').style.display = 'flex';
    
    // Create progress bar if it doesn't exist
    createProgressBar();
    
    generateQuestionPreview();
    showQuestion();
    updateProgressBar();
    
    // Create toggle button
    createToggleButton();
}

function generateQuestionPreview() {
    questionPreview.innerHTML = '';

    // Only generate preview for selected number of questions
    const qCount = isCustomQuiz ? customQuestions.length : totalQuestions;
    for (let index = 0; index < qCount; index++) {
        const btn = document.createElement('button');
        btn.innerText = index + 1;
        btn.classList.add('preview-btn');
        btn.setAttribute('data-index', index);
        btn.addEventListener('click', () => {
            currentQuestionIndex = index;
            // Add jumping animation class to question container only
            const questionContainer = document.getElementById('question-container');
            questionContainer.classList.add('jumping');
            
            // Update the question in background without showing container
            if (isSubmitted) {
                // Update the question content without showing the container
            showQuestion();
            } else {
                showQuestion();
            }
            
            // Remove animation class after animation completes
            setTimeout(() => {
                questionContainer.classList.remove('jumping');
            }, 300);

            // Auto-scroll to the corresponding review box if in review mode
            if (isSubmitted) {
                const reviewBox = document.querySelector(`.review-box[data-review-index="${index}"]`);
                if (reviewBox) {
                    reviewBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Remove any existing highlight classes
                    reviewBox.classList.remove('highlight', 'highlight-marked');
                    
                    // Check if the question is marked as right or wrong
                    if (reviewBox.classList.contains('right-selected') || reviewBox.classList.contains('wrong-selected')) {
                        // Add marked highlight effect
                        reviewBox.classList.add('highlight-marked');
                        setTimeout(() => {
                            reviewBox.classList.remove('highlight-marked');
                        }, 1000);
                    } else {
                        // Add regular highlight effect
                        reviewBox.classList.add('highlight');
                        setTimeout(() => {
                            reviewBox.classList.remove('highlight');
                        }, 1000);
                    }
                }
            }
        });
        questionPreview.appendChild(btn);

        // Add golden ring if starred
        if (starredQuestions[index]) {
            btn.classList.add('sidebar-starred');
        }
    }

    updateQuestionPreview();
}

function clearAnswer(questionIndex) {
    // Clear the answer
    userAnswers[questionIndex] = null;
    
    // Remove selected class from all options
    const options = document.querySelectorAll('.option-btn');
    options.forEach(opt => opt.classList.remove('selected'));
    
    // Reset the next button color to blue
    const nextButton = document.getElementById('next-button');
    nextButton.style.backgroundColor = 'var(--button-bg)';
    
    // Update the preview button to show as visited (yellow)
    const previewBtn = document.querySelector(`.preview-btn[data-index='${questionIndex}']`);
    if (previewBtn) {
        previewBtn.classList.remove('attempted');
        previewBtn.classList.add('visited');
    }
    
    // Update progress bar
    updateProgressBar();
    
    // Update the selected options list
    updateSelectedOptionsList();
}

function showQuestion() {
    const currentQuestion = isCustomQuiz ? customQuestions[currentQuestionIndex] : questions[currentQuestionIndex];
    
    // Hide new feature panels if they're visible
    const newFeaturePanels = document.getElementById('new-feature-panels');
    if (newFeaturePanels) {
        newFeaturePanels.style.display = 'none';
    }
    
    // Only modify quiz container display if not in review mode
    if (!isSubmitted) {
    document.querySelector('.quiz-container').style.display = 'flex';
    }
    
    questionElement.innerHTML = '';

    // Create header row container
    const headerRow = document.createElement('div');
    headerRow.className = 'question-header-row';

    // Left: Quiz App title
    const quizTitle = document.createElement('div');
    quizTitle.className = 'quiz-app-header-title';
    quizTitle.innerText = 'Quiz App';

    // Right: star and clear response buttons
    const rightHeader = document.createElement('div');
    rightHeader.className = 'question-header-actions';

    // Star button
    const starToggle = document.createElement('button');
    starToggle.className = 'star-toggle';
    starToggle.innerHTML = '<i class="fas fa-star"></i>';
    if (starredQuestions[currentQuestionIndex]) {
        starToggle.classList.add('active');
    }
    starToggle.onclick = () => {
        starredQuestions[currentQuestionIndex] = !starredQuestions[currentQuestionIndex];
        starToggle.classList.toggle('active');
        localStorage.setItem('starredQuestions', JSON.stringify(starredQuestions));
        updateSelectedOptionsList();
        // Sidebar golden ring for starred questions
        const previewBtn = document.querySelector(`.preview-btn[data-index='${currentQuestionIndex}']`);
        if (previewBtn) {
            if (starredQuestions[currentQuestionIndex]) {
                previewBtn.classList.add('sidebar-starred');
            } else {
                previewBtn.classList.remove('sidebar-starred');
            }
        }
    };

    // Clear response button
    const clearBtn = document.createElement('button');
    clearBtn.innerHTML = 'Clear Response';
    clearBtn.className = 'question-clear-btn';
    clearBtn.onclick = () => clearAnswer(currentQuestionIndex);

    // Add star and clear to right header
    rightHeader.appendChild(starToggle);
    rightHeader.appendChild(clearBtn);

    // Assemble header row
    headerRow.appendChild(quizTitle);
    headerRow.appendChild(rightHeader);

    // Question text row with correct prefix
    const questionTextRow = document.createElement('div');
    questionTextRow.className = 'question-title';
    if (isCustomQuiz) {
        questionTextRow.innerText = `Q${currentQuestionIndex + 1}. ${currentQuestion.question}`;
    } else {
        questionTextRow.innerText = `Question ${currentQuestionIndex + 1}`;
    }

    // Add to question element
    questionElement.appendChild(headerRow);
    questionElement.appendChild(questionTextRow);

    optionsElement.innerHTML = '';

    currentQuestion.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.innerText = `${String.fromCharCode(65 + index)}) ${option}`;
        button.classList.add('option-btn');

        // Only add .selected if this is the selected answer
        if (userAnswers[currentQuestionIndex] === option) {
            button.classList.add('selected');
        }

        button.addEventListener('click', () => selectOption(button, option));

        if (isSubmitted) {
            button.disabled = true;
            button.style.opacity = "0.6";
            const clearBtn = questionElement.querySelector('.question-clear-btn');
            if (clearBtn) {
                clearBtn.style.display = 'none';
            }
        }

        optionsElement.appendChild(button);
    });

    // Back button styling
    backButton.style.display = 'block';
    backButton.disabled = currentQuestionIndex === 0;
    if (currentQuestionIndex === 0) {
        backButton.style.backgroundColor = "#f0f0f0"; // Light grey
        backButton.style.cursor = "not-allowed";
        backButton.textContent = "Back";
    } else {
        backButton.style.backgroundColor = "var(--button-bg)"; // Blue color
        backButton.style.cursor = "";
        backButton.textContent = "Back";
        backButton.classList.add('hover-effect');
    }

    // Next button styling
    nextButton.style.display = 'block';
    nextButton.disabled = false;
	nextButton.style.cursor = "pointer";
    
    // Set next button color based on whether an option is selected
    if (userAnswers[currentQuestionIndex]) {
        nextButton.style.backgroundColor = 'var(--success-color)';
    } else {
        nextButton.style.backgroundColor = 'var(--button-bg)';
    }
    
    nextButton.textContent = "Next";
    nextButton.classList.add('hover-effect');

    // Last question handling
    const qCount = isCustomQuiz ? customQuestions.length : totalQuestions;
    if (currentQuestionIndex === qCount - 1) {
        nextButton.disabled = true;
        nextButton.style.backgroundColor = "#f0f0f0"; // Light grey
        nextButton.style.cursor = "not-allowed";
        nextButton.textContent = "Next";
    }

    // Auto-scroll sidebar to show current question number
    const currentPreviewBtn = document.querySelector(`.preview-btn[data-index="${currentQuestionIndex}"]`);
    if (currentPreviewBtn) {
        const sidebar = document.querySelector('.sidebar');
        const sidebarRect = sidebar.getBoundingClientRect();
        const btnRect = currentPreviewBtn.getBoundingClientRect();
        
        // Check if the button is outside the visible sidebar area
        if (btnRect.bottom > sidebarRect.bottom || btnRect.top < sidebarRect.top) {
            // Calculate the scroll position to center the button
            const scrollTop = currentPreviewBtn.offsetTop - (sidebarRect.height / 2) + (currentPreviewBtn.offsetHeight / 2);
            sidebar.scrollTo({
                top: scrollTop,
                behavior: 'smooth'
            });
        }
    }

    updateQuestionPreview();
    markQuestionAsVisited(currentQuestionIndex);  // ✅ Call function to mark as visited
    updateQuestionProgress();
}

function markQuestionAsVisited(index) {
    let questionCircle = document.querySelector(`.preview-btn[data-index='${index}']`);
    if (questionCircle) {
        if (isSubmitted) {
            // After submission, only change grey (unanswered) buttons to yellow
            if (!questionCircle.classList.contains("attempted")) {
                questionCircle.classList.remove("frozen-default");
                questionCircle.classList.add("visited");
            }
        } else {
            questionCircle.classList.add("visited");
        }
    }
}

function markQuestionAsAttempted(index) {
    let questionCircle = document.querySelector(`.preview-btn[data-index='${index}"]`);
    if (questionCircle) {
        if (isSubmitted) {
            // After submission, don't change any colors
            return;
        }
        questionCircle.classList.remove("visited");
        questionCircle.classList.add("attempted");
    }
}

function updateQuestionPreview() {
    const previewButtons = document.querySelectorAll('.preview-btn');

    userAnswers.forEach((answer, index) => {
        if (answer) {
            previewButtons[index].classList.add('attempted');
        } else {
            previewButtons[index].classList.remove('attempted');
        }
    });
}

function updateProgressBar() {
    const qCount = isCustomQuiz ? customQuestions.length : totalQuestions;
    const answeredCount = userAnswers.slice(0, qCount).filter(answer => answer !== null).length;
    const progress = Math.round((answeredCount / qCount) * 100);
    document.getElementById('progress-percentage').textContent = `${progress}%`;
}

// Save progress to localStorage
document.getElementById('save-button').addEventListener('click', function() {
    const saveButton = this;
    
    // Change button appearance with animation
    saveButton.style.backgroundColor = '#4CAF50';
    saveButton.style.color = 'white';
    saveButton.innerHTML = 'Saved!';
    saveButton.classList.add('done-animation');
    
    // Save progress
    const visitedQuestions = Array.from(document.querySelectorAll('.preview-btn.visited'))
        .map(btn => parseInt(btn.getAttribute('data-index')));
    
    localStorage.setItem('quizProgress', JSON.stringify({
        answers: userAnswers,
        currentIndex: currentQuestionIndex,
        visitedQuestions: visitedQuestions
    }));
    
    // Revert button after 1 second
    setTimeout(() => {
        saveButton.style.backgroundColor = '';
        saveButton.style.color = '';
        saveButton.innerHTML = 'Save';
        saveButton.classList.remove('done-animation');
    }, 1000);
});

// Load saved progress if available
function loadProgress() {
    const savedProgress = localStorage.getItem('quizProgress');
    const savedStarred = localStorage.getItem('starredQuestions');
    
    if (savedProgress) {
        const { answers, currentIndex, visitedQuestions } = JSON.parse(savedProgress);
        userAnswers = [...answers];
        currentQuestionIndex = currentIndex;
        
        if (visitedQuestions) {
            visitedQuestions.forEach(index => {
                markQuestionAsVisited(index);
            });
        }
        
        updateQuestionPreview();
        updateSelectedOptionsList();
        updateProgressBar();
        showQuestion();
    }
    
    // Load starred questions
    if (savedStarred) {
        starredQuestions = JSON.parse(savedStarred);
    }
}

function selectOption(button, option) {
    // Remove selected class from all options
    const options = document.querySelectorAll('.option-btn');
    options.forEach(opt => opt.classList.remove('selected'));
    
    // Add selected class to clicked option
    button.classList.add('selected');
    
    // Store the answer in both arrays
    userAnswers[currentQuestionIndex] = option;
    originalAnswers[currentQuestionIndex] = option;
    
    // Set next button to green when an option is selected
    const nextButton = document.getElementById('next-button');
    nextButton.style.backgroundColor = 'var(--success-color)';
    
    // Immediately update the sidebar button to green
    const previewBtn = document.querySelector(`.preview-btn[data-index="${currentQuestionIndex}"]`);
    if (previewBtn) {
        previewBtn.classList.remove('visited');
        previewBtn.classList.add('attempted');
    }
    
    // Update progress bar
    updateProgressBar();
    
    // Update the selected options list
    updateSelectedOptionsList();
}

function updateSelectedOptionsList() {
    const list = document.getElementById('selected-options-list');
    list.innerHTML = '';
    
    // Loop through all questions
    const qCount = isCustomQuiz ? customQuestions.length : totalQuestions;
    for (let index = 0; index < qCount; index++) {
        const answer = userAnswers[index];
        const isStarred = starredQuestions[index];
        if (answer || isStarred) {
            const item = document.createElement('div');
            item.className = 'selected-option-item';
            let optionText = '';
            if (answer) {
                const currentQ = isCustomQuiz ? customQuestions[index] : questions[index];
                const optIdx = currentQ.options.findIndex(opt => opt === answer);
                if (isCustomQuiz) {
                    if (optIdx !== -1) {
                        optionText = `${String.fromCharCode(65 + optIdx)}) ${answer}`;
                    } else {
                        optionText = answer;
                    }
                } else {
                    if (optIdx !== -1) {
                        optionText = ` ${String.fromCharCode(65 + optIdx)}`;
                    } else {
                        optionText = '';
                    }
                }
            } else {
                optionText = ' No option selected';
            }
            if (isCustomQuiz) {
                item.innerHTML = `<strong>Q${index + 1}:</strong>${optionText}${isStarred ? ' <i class=\"fas fa-star\" style=\"color: #ffd700;\"></i>' : ''}`;
            } else {
                item.innerHTML = `<strong>Q${index + 1}:</strong>${optionText}${isStarred ? ' <i class=\"fas fa-star\" style=\"color: #ffd700;\"></i>' : ''}`;
            }
            list.appendChild(item);
        }
    }
    const newDownloadBtn = document.getElementById("new-download-btn");
    newDownloadBtn.style.display = "block";
}

function downloadSelectedOptions() {
    const selectedOptions = [];
    const qCount = isCustomQuiz ? customQuestions.length : totalQuestions;
    for (let index = 0; index < qCount; index++) {
        const answer = userAnswers[index];
        const isStarred = starredQuestions[index];
        let optionText = '';
        if (answer) {
            const currentQ = isCustomQuiz ? customQuestions[index] : questions[index];
            const optIdx = currentQ.options.findIndex(opt => opt === answer);
            if (optIdx !== -1) {
                optionText = String.fromCharCode(65 + optIdx);
            }
        } else {
            optionText = 'Not answered';
        }
        selectedOptions.push(`Question ${index + 1}: ${optionText}${isStarred ? ' (Doubt)' : ''}`);
    }

    if (selectedOptions.length === 0) {
        showCustomAlert("No options selected or questions starred.");
        return;
    }

    const content = selectedOptions.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "selected_options.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

nextButton.addEventListener('click', () => {
    if (currentQuestionIndex < (isCustomQuiz ? customQuestions.length : totalQuestions) - 1) {
                currentQuestionIndex++;
                markQuestionAsVisited(currentQuestionIndex);
                updateProgressBar();
                showQuestion();
        }
});

backButton.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        markQuestionAsVisited(currentQuestionIndex);
        updateProgressBar();
        showQuestion();
    }
});

// Update submit button event listener
document.getElementById('submit-quiz').addEventListener("click", () => {
    showCustomConfirm("Are you sure you want to submit the quiz?", (confirmed) => {
        if (confirmed) {
        isSubmitted = true;
        document.body.classList.add('submitted');

        document.getElementById('submit-quiz').style.display = 'none';
        document.querySelector('.submit-row').style.display = 'none';
        
        const paperCheckedRow = document.querySelector('.paper-checked-row');
        if (paperCheckedRow) {
            paperCheckedRow.style.removeProperty('display');
            paperCheckedRow.style.display = 'flex';
            const paperCheckedButton = document.getElementById('paper-checked-button');
            if (paperCheckedButton) {
                paperCheckedButton.style.display = 'block';
            }
        }
        
        menuPanel.classList.remove('open');
        mainContainer.style.filter = '';
        mainContainer.style.pointerEvents = '';
        
        const quizContainer = document.querySelector('.quiz-container');
        quizContainer.style.transition = 'all 0.3s ease-out';
        quizContainer.style.marginLeft = '20px';
        quizContainer.style.width = 'calc(100% - 40px)';
        
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'toggle-review-btn';
        toggleBtn.innerHTML = `
            <i class="fas fa-arrow-left toggle-icon"></i>
            <span class="toggle-label">Back to Quiz</span>
        `;
        
        toggleBtn.onclick = () => {
            const reviewContainer = document.getElementById('review-container');
            const quizContainer = document.querySelector('.quiz-container');
            
            if (reviewContainer.style.display === 'block') {
                reviewContainer.style.display = 'none';
                quizContainer.style.display = 'flex';
                toggleBtn.innerHTML = `
                    <i class="fas fa-clipboard-list toggle-icon"></i>
                    <span class="toggle-label">Show Review</span>
                `;
            } else {
                reviewContainer.style.display = 'block';
                quizContainer.style.display = 'none';
                toggleBtn.innerHTML = `
                    <i class="fas fa-arrow-left toggle-icon"></i>
                    <span class="toggle-label">Back to Quiz</span>
                `;
            }
        };
        document.body.appendChild(toggleBtn);
        
        showQuestion();
        
        if (isStopwatchRunning) toggleStopwatch();
        if (isTimerRunning) toggleTimer();
        
        const controlPanel = document.querySelector('.control-panel');
        controlPanel.querySelectorAll('.control-row').forEach(row => {
            if (!row.querySelector('.theme-btn') && 
                !row.querySelector('#home-page-button') &&
                !row.querySelector('#dashboard-button') &&
                !row.classList.contains('paper-checked-row')) {
                row.style.transition = 'opacity 0.3s ease-out';
                row.style.opacity = '0';
                setTimeout(() => {
                    if (!row.classList.contains('paper-checked-row')) {
                    row.style.display = 'none';
                    }
                }, 300);
            }
        });
        
        const homeButton = document.getElementById('home-page-button');
        homeButton.style.display = 'block';
        homeButton.classList.remove('interactive');
        
        const selectedOptionsPanel = document.querySelector('.selected-options-panel');
        selectedOptionsPanel.style.transition = 'opacity 0.3s ease-out';
        selectedOptionsPanel.style.opacity = '0';
        setTimeout(() => {
            selectedOptionsPanel.style.display = 'none';
        }, 300);
        
        const reviewContainer = document.getElementById('review-container');
        reviewContainer.style.opacity = '0';
        reviewContainer.style.transition = 'opacity 0.4s ease-in';
        
        setTimeout(() => {
            displayReview();
            quizContainer.style.display = 'none';
            reviewContainer.style.display = 'block';
            reviewContainer.style.opacity = '1';
        }, 300);
    }
    });
});

// Ensure the "Download Results" button only triggers one download
function initializeDownloadResultsButton() {
    const menuDownloadButton = document.getElementById('menu-download-button');
    if (menuDownloadButton) {
        menuDownloadButton.style.display = 'none'; // Initially hidden

        // Remove any existing event listeners to prevent duplicates
        const newButton = menuDownloadButton;
        newButton.replaceWith(newButton.cloneNode(true));

        newButton.addEventListener('click', function (e) {
            e.preventDefault();
            if (!newButton.dataset.clicked) { // Ensure only one download per click
                newButton.dataset.clicked = true;
                downloadAnswers();
                setTimeout(() => delete newButton.dataset.clicked, 1000); // Reset after 1 second
            }
        });
    }
}

// Use event delegation to ensure the button remains functional
// even if dynamically replaced or re-rendered
document.body.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'menu-download-button') {
        e.preventDefault();
        downloadAnswers();
    }
});

// Update the "Paper Checked" button logic to avoid replacing the button
document.getElementById('paper-checked-button').addEventListener('click', function () {
    showCustomConfirm("Are you sure you have checked the paper properly?", (confirmed) => {
        if (confirmed) {
            this.style.display = 'none';
            const menuDownloadButton = document.getElementById('menu-download-button');
            if (menuDownloadButton) {
                menuDownloadButton.style.display = 'flex'; // Show the button
            }
        }
    });

    // Make review panel non-interactive
    setTimeout(() => {
        document.querySelectorAll('.review-box').forEach(box => {
            box.querySelectorAll('button, .option-circle').forEach(el => {
                el.disabled = true;
                el.style.pointerEvents = 'none';
                el.style.opacity = '0.6';
                el.style.cursor = 'not-allowed';
            });
        });
    }, 500); // Wait for review panel to appear
});

// Ensure the "Download Results" button is initialized on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeDownloadResultsButton();
});

document.getElementById('home-page-button').addEventListener('click', function() {
    if (this.classList.contains('interactive')) {
        showCustomConfirm("Are you sure you want to go back to the home page? All progress will be lost.", (confirmed) => {
            if (confirmed) {
                window.location.href = 'index.html';
            }
        });
    }
});

// Replace alert in timer function
function toggleTimer() {
    const display = document.getElementById('timer-display');
    const button = document.getElementById('timer-toggle');
    
    const now = Date.now();
    if (now - lastTimerClick < 300) {
        if (isTimerRunning) {
            isTimerRunning = false;
            button.style.backgroundColor = '';
            clearInterval(timerInterval);
        }
        timerTime = 0;
        display.textContent = '--:--:--';
        
        button.style.transition = 'background-color 0.15s';
        button.style.backgroundColor = '#e74c3c';
        setTimeout(() => {
            button.style.backgroundColor = '';
        }, 150);
                } else {
        if (!isTimerRunning && timerTime > 0) {
            isTimerRunning = true;
            button.style.backgroundColor = '#4CAF50';
            timerInterval = setInterval(() => {
                if (timerTime > 0) {
                    timerTime--;
                    display.textContent = formatTime(timerTime);
                    if (timerTime === 0) {
                        clearInterval(timerInterval);
                        showCustomAlert('Time is up!', () => {
                            document.getElementById('submit-quiz').click();
                        });
                    }
                }
            }, 1000);
        } else if (isTimerRunning) {
            isTimerRunning = false;
            button.style.backgroundColor = '';
            clearInterval(timerInterval);
                }
    }
    lastTimerClick = now;
            }

// Replace alert in processFileBtn click handler
processFileBtn.addEventListener('click', async () => {
    const file = quizFileInput.files[0];
    if (!file) {
        showCustomAlert('Please select a file first!');
        return;
    }

    try {
        const questions = await parseQuizFile(file);
        if (!questions || questions.length === 0) {
            showCustomAlert('No valid questions found in the file.\nPlease make sure your file follows the correct format and try again.');
            return;
        }
        customQuestions = questions;
        isCustomQuiz = true;
        modal.style.display = 'none';
        startCustomQuiz();
    } catch (error) {
        showCustomAlert('Error processing file: ' + error.message);
    }
});

// Replace alert in downloadSelectedOptions function
function downloadSelectedOptions() {
    const selectedOptions = [];
    const qCount = isCustomQuiz ? customQuestions.length : totalQuestions;
    for (let index = 0; index < qCount; index++) {
        const answer = userAnswers[index];
        const isStarred = starredQuestions[index];
        let optionText = '';
        if (answer) {
            const currentQ = isCustomQuiz ? customQuestions[index] : questions[index];
            const optIdx = currentQ.options.findIndex(opt => opt === answer);
            if (optIdx !== -1) {
                optionText = String.fromCharCode(65 + optIdx);
            }
        } else {
            optionText = 'Not answered';
        }
        selectedOptions.push(`Question ${index + 1}: ${optionText}${isStarred ? ' (Doubt)' : ''}`);
    }

    if (selectedOptions.length === 0) {
        showCustomAlert("No options selected or questions starred.");
        return;
    }

    const content = selectedOptions.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "selected_options.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

// Add Home button functionality
document.getElementById('home-page-button').addEventListener('click', function() {
    if (this.classList.contains('interactive')) {
        showCustomConfirm("Are you sure you want to go back to the home page? All progress will be lost.", (confirmed) => {
            if (confirmed) {
                window.location.href = 'index.html';
        }
        });
    }
});

function displayReview() {
    const reviewContainer = document.getElementById('review-container');
    reviewContainer.innerHTML = '<h2 class="review-header">Your Selected Answers:</h2>';
    
    // Create or update toggle button
    let toggleBtn = document.querySelector('.toggle-review-btn');
    if (!toggleBtn) {
        toggleBtn = document.createElement('button');
        toggleBtn.className = 'toggle-review-btn';
        toggleBtn.onclick = toggleReviewPanel;
        document.body.appendChild(toggleBtn);
    }
    
    toggleBtn.innerHTML = `
        <i class="fas fa-arrow-left toggle-icon"></i>
        <span class="toggle-label">Back to Quiz</span>
    `;

    // Add the correct answers panel
    const correctAnswersPanel = document.createElement('div');
    correctAnswersPanel.className = 'correct-answers-panel';
    correctAnswersPanel.innerHTML = `
        <h3>Correct Answers</h3>
        <div id="correct-answers-list"></div>
    `;
    reviewContainer.appendChild(correctAnswersPanel);
    
    // Add upload answer key button container
    const uploadContainer = document.createElement('div');
    uploadContainer.className = 'upload-answer-key-container';
    
    // Create the new button for answer key upload
    const uploadAnswerKeyBtn = document.createElement('button');
    uploadAnswerKeyBtn.className = 'upload-answer-key-btn control-btn';
    uploadAnswerKeyBtn.style.display = isSubmitted ? 'block' : 'none';
    uploadAnswerKeyBtn.innerHTML = `
        <i class="fas fa-file-upload"></i>
        Upload Answer Key
    `;
    
    // Add click handler for the upload button
    uploadAnswerKeyBtn.addEventListener('click', () => {
        // Show answer key upload modal
        const modal = document.getElementById('answer-key-modal');
        if (modal) {
            modal.style.display = 'block';
            
            // Add event listeners for the modal
            const closeBtn = modal.querySelector('.close-modal');
            const processBtn = document.getElementById('process-answer-key-btn');
            const fileInput = document.getElementById('answer-key-file');
            
            // Close button handler
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
            // Click outside modal to close
            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
            
            // Process button handler
            processBtn.addEventListener('click', async () => {
                const file = fileInput.files[0];
                if (!file) {
                    alert('Please select a file first!');
                    return;
                }
                
                try {
                    const text = await file.text();
                    const answers = text.split('\n')
                        .map(line => line.trim())
                        .filter(line => line.match(/^Question \d+: [A-E]$/))
                        .map(line => {
                            const match = line.match(/^Question (\d+): ([A-E])$/);
                            return {
                                questionNumber: parseInt(match[1]),
                                answer: match[2]
                            };
                        });
                        
                    if (answers.length === 0) {
                        throw new Error('No valid answers found in the file. Please ensure each line follows the format "Question n: X" where n is the question number and X is A, B, C, D, or E');
                    }

                    // Update the correct answers panel
                    const correctAnswersList = document.getElementById('correct-answers-list');
                    correctAnswersList.innerHTML = '';
                    answers.forEach(({questionNumber, answer}) => {
                        const answerDiv = document.createElement('div');
                        answerDiv.textContent = `Question ${questionNumber}: ${answer}`;
                        correctAnswersList.appendChild(answerDiv);
                    });

                    // Reset score before checking
                    score = 0;
                    
                    // Get the actual number of questions from the answer key
                    const totalQuestionsInKey = answers.length;
                    
                    // Process the answers and automatically check them
                    answers.forEach(({questionNumber, answer}) => {
                        const index = questionNumber - 1;
                        if (index >= 0 && index < totalQuestionsInKey) {
                            // Find the corresponding review box
                            const reviewBox = document.querySelector(`.review-box[data-review-index="${index}"]`);
                            if (reviewBox) {
                                // Get the student's answer
                                const studentAnswer = userAnswers[index];
                                const rightButton = reviewBox.querySelector('.right-btn');
                                const wrongButton = reviewBox.querySelector('.wrong-btn');
                                const statusSpan = reviewBox.querySelector('[id^="status-"]');
                                
                                // Convert student's answer to letter (A, B, C, D, E)
                                let studentLetter = '';
                                if (studentAnswer) {
                                    const currentQ = isCustomQuiz ? customQuestions[index] : questions[index];
                                    const optIdx = currentQ.options.findIndex(opt => opt === studentAnswer);
                                    if (optIdx !== -1) {
                                        studentLetter = String.fromCharCode(65 + optIdx);
                                    }
                                }

                                // Store correct answer
                                correctedAnswers[index] = ` Option ${answer} for Question ${questionNumber}`;

                                // Automatically trigger right/wrong button based on comparison
                                if (!studentAnswer) {
                                    // Question is not answered - leave it as is
                                    if (statusSpan) statusSpan.innerText = 'Unchecked';
                                } else if (studentLetter === answer) {
                                    // Answer is correct
                                    rightButton.click();
                                    reviewBox.classList.remove('wrong-selected');
                                    reviewBox.classList.add('right-selected');
                                    if (statusSpan) statusSpan.innerText = 'Right';
                                } else {
                                    // Answer is wrong
                                    wrongButton.click();
                                    reviewBox.classList.remove('right-selected');
                                    reviewBox.classList.add('wrong-selected');
                                    if (statusSpan) statusSpan.innerText = 'Wrong';
                                    
                                    // For wrong answers, show the correct answer in green
                                    const optionCircles = reviewBox.querySelectorAll('.option-circle');
                                    optionCircles.forEach(circle => {
                                        if (circle.dataset.option === answer) {
                                            circle.classList.add('selected');
                                            circle.style.backgroundColor = '#4CAF50';
                                            circle.style.color = 'white';
                                            circle.style.border = '2px solid #4CAF50';
                                        }
                                        circle.style.pointerEvents = 'none';
                                    });
                                }
        }
    }
});

                    // Calculate score based on right buttons
                    score = document.querySelectorAll('.review-box.right-selected').length;

                    // Update score display
                    const scoreDisplay = document.getElementById('score');
                    if (scoreDisplay) {
                        scoreDisplay.innerText = score;
                    }
                    
                    modal.style.display = 'none';
                    alert(`Answer key processed successfully! Your score: ${score}/${totalQuestionsInKey}`);
                    
                } catch (error) {
                    alert('Error processing answer key: ' + error.message);
                }
            });
        }
    });
    
    uploadContainer.appendChild(uploadAnswerKeyBtn);
    reviewContainer.appendChild(uploadContainer);
    reviewContainer.style.display = 'block';

    score = 0; // Reset score before counting
    correctedAnswers = new Array(questions.length).fill(null); // Reset corrected answers array

    const qCount = isCustomQuiz ? customQuestions.length : questions.length;
    userAnswers.slice(0, qCount).forEach((answer, index) => {
        const reviewBox = document.createElement('div');
        reviewBox.classList.add('review-box');
        reviewBox.setAttribute('data-review-index', index);

        // Create header container
        const headerContainer = document.createElement('div');
        headerContainer.style.display = 'flex';
        headerContainer.style.alignItems = 'center';
        
        // Question text with star
        const questionReview = document.createElement('p');
        let selectedLetter = '';
        if (answer) {
            const currentQ = isCustomQuiz ? customQuestions[index] : questions[index];
            const optIdx = currentQ.options.findIndex(opt => opt === answer);
            if (optIdx !== -1) {
                selectedLetter = String.fromCharCode(65 + optIdx);
            }
        }
        if (isCustomQuiz) {
            // Custom: Qn: A) Option ...
            questionReview.innerHTML = `<strong>Q${index + 1}: ${selectedLetter ? selectedLetter + ') ' : ''}${answer || 'Not answered'}</strong>`;
        } else {
            // Standard: Qn: Option ...
            questionReview.innerHTML = `<strong>Q${index + 1}: ${answer || 'Not answered'}</strong>`;
        }
        
        // Add star icon (non-interactive)
        const starIcon = document.createElement('i');
        starIcon.className = `fas fa-star review-star${starredQuestions[index] ? ' active' : ''}`;
        
        headerContainer.appendChild(questionReview);
        headerContainer.appendChild(starIcon);
        reviewBox.appendChild(headerContainer);

        // Create mark buttons container
        const markButtons = document.createElement('div');
        markButtons.className = 'mark-buttons';

        const rightButton = document.createElement('button');
        rightButton.innerText = 'Right';
        rightButton.classList.add('mark-btn', 'right-btn');

        const wrongButton = document.createElement('button');
        wrongButton.innerText = 'Wrong';
        wrongButton.classList.add('mark-btn', 'wrong-btn');

        markButtons.appendChild(rightButton);
        markButtons.appendChild(wrongButton);

        // Create status container
        const statusContainer = document.createElement('div');
        statusContainer.className = 'status-container';

        const statusLabel = document.createElement('span');
        statusLabel.innerText = "Status: ";

        const statusSpan = document.createElement('span');
        statusSpan.id = `status-${index}`;
        statusSpan.innerText = "Unchecked";

        // Create option circles container
        const optionCircles = document.createElement('div');
        optionCircles.className = 'option-circles';

        // Create A-E option circles
        ['A', 'B', 'C', 'D', 'E'].forEach(option => {
            const circle = document.createElement('div');
            circle.textContent = option;
            circle.style.width = '30px';
            circle.style.height = '30px';
            circle.style.borderRadius = '50%';
            circle.style.border = '2px solid rgba(204, 204, 204, 0.4)';
            circle.style.display = 'flex';
            circle.style.justifyContent = 'center';
            circle.style.alignItems = 'center';
            circle.style.cursor = 'default';
            circle.style.userSelect = 'none';
            circle.style.transition = 'all 0.3s ease';
            circle.dataset.option = option;
            circle.classList.add('option-circle');
            
            // Set more faded initial state
            circle.style.pointerEvents = 'none';
            circle.style.opacity = '0.35';
            circle.style.backgroundColor = '#e2e8f0';
            circle.style.color = '#64748b';
            
            optionCircles.appendChild(circle);
        });

        // Create reset button
        const resetBtn = document.createElement('button');
        resetBtn.innerHTML = 'Reset Status';
        resetBtn.className = 'reset-answer-btn';
        resetBtn.disabled = true;
        resetBtn.style.opacity = '0.6';
        resetBtn.style.cursor = 'not-allowed';

        let selectedStatus = null;
        let selectedOption = null;

        rightButton.addEventListener('click', () => {
            if (selectedStatus === "Wrong") {
                score++;
            } else if (selectedStatus !== "Right") {
                score++;
            }

            selectedStatus = "Right";
            statusSpan.innerText = "Right";
            reviewBox.classList.remove("wrong-selected");
            reviewBox.classList.add("right-selected");

            rightButton.classList.add("selected-btn");
            wrongButton.classList.remove("selected-btn");

            // Disable all option circles but keep their current state
            optionCircles.querySelectorAll('.option-circle').forEach(circle => {
                circle.style.pointerEvents = 'none';
                circle.style.opacity = '1';
                if (!circle.classList.contains('selected')) {
                    circle.style.border = '2px solid #ccc';
                    circle.style.backgroundColor = 'white';
                    // circle.style.color = '#000000';
                }
                circle.style.cursor = 'default';
                circle.classList.add('option-circle-grey');
            });

            updateScore();
            resetBtn.disabled = false;
            resetBtn.style.opacity = '';
            resetBtn.style.cursor = '';
        });

        wrongButton.addEventListener('click', () => {
            if (selectedStatus === "Right") {
                score--;
            }

            selectedStatus = "Wrong";
            statusSpan.innerText = "Wrong";
            reviewBox.classList.remove("right-selected");
            reviewBox.classList.add("wrong-selected");

            wrongButton.classList.add("selected-btn");
            rightButton.classList.remove("selected-btn");

            // Reset all option circles to consistent state
            optionCircles.querySelectorAll('.option-circle').forEach(circle => {
                circle.classList.remove('selected');
                if (circle.dataset.option === selectedLetter.replace(')', '')) {
                    // Keep the previously selected option disabled and grayed out
                    circle.style.pointerEvents = 'none';
                    circle.style.opacity = '0.5';
                    circle.style.border = '2px solid #ccc';
                    circle.style.backgroundColor = 'white';
                    circle.style.color = '#b0b0b0';
                    circle.style.cursor = 'default';
                } else {
                    // Enable other options
                    circle.style.pointerEvents = 'auto';
                    circle.style.opacity = '1';
                    circle.style.border = '2px solid #ccc';
                    circle.style.backgroundColor = 'white';
                    circle.style.color = 'black';
                    circle.style.cursor = 'pointer';
                }
                circle.classList.remove('option-circle-grey');
            });

            updateScore();
            resetBtn.disabled = false;
            resetBtn.style.opacity = '';
            resetBtn.style.cursor = '';
        });

        resetBtn.addEventListener('click', () => {
            if (resetBtn.disabled) return;
            resetBtn.disabled = true;
            resetBtn.style.opacity = '0.6';
            resetBtn.style.cursor = 'not-allowed';
            if (selectedStatus === "Right") {
                score--;
                updateScore();
            }
            selectedStatus = null;
            selectedOption = null;
            correctedAnswers[index] = null;
            statusSpan.innerText = "Unchecked";
            reviewBox.classList.remove("right-selected", "wrong-selected");
            rightButton.classList.remove("selected-btn");
            wrongButton.classList.remove("selected-btn");
            
            // Reset to more faded initial state
            optionCircles.querySelectorAll('.option-circle').forEach(circle => {
                circle.style.pointerEvents = 'none';
                circle.style.opacity = '0.35';
                circle.style.border = '2px solid rgba(204, 204, 204, 0.4)';
                circle.style.backgroundColor = '#e2e8f0';
                circle.style.color = '#64748b';
                circle.style.cursor = 'default';
                circle.classList.remove('selected');
                circle.classList.remove('option-circle-grey');
            });
        });

        // Add event listeners for option circles
        optionCircles.querySelectorAll('.option-circle').forEach(circle => {
            circle.addEventListener('click', () => {
                if (circle.style.pointerEvents === 'auto') {
                    // Remove selection from all circles and reset their styles
                    optionCircles.querySelectorAll('.option-circle').forEach(c => {
                        c.classList.remove('selected');
                        c.style.border = '2px solid #ccc';
                        c.style.backgroundColor = 'white';
                        c.style.color = 'black';
                    });
                    
                    // Add selection to clicked circle
                    circle.classList.add('selected');
                    circle.style.border = '2px solid #4CAF50';
                    circle.style.backgroundColor = '#4CAF50';
                    circle.style.color = 'white';
                    
                    // Store the selected option and corrected answer immediately when circle is clicked
                    selectedOption = circle.dataset.option;
                    correctedAnswers[index] = ` Option ${selectedOption} for Question ${index + 1}`;
                    
                    // Add animation
                    circle.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        circle.style.transform = 'scale(1)';
                    }, 200);
                }
            });
        });

        // Assemble the review box
        reviewBox.appendChild(optionCircles);
        reviewBox.appendChild(markButtons);
        
        const statusLeft = document.createElement('div');
        statusLeft.appendChild(statusLabel);
        statusLeft.appendChild(statusSpan);
        
        statusContainer.appendChild(statusLeft);
        statusContainer.appendChild(resetBtn);
        
        reviewBox.appendChild(statusContainer);
        reviewContainer.appendChild(reviewBox);
    });

    const scoreDisplay = document.createElement('h3');
    scoreDisplay.innerHTML = `Your score: <span id="score">0</span>`;
    reviewContainer.appendChild(scoreDisplay);
}

function updateScore() {
    const scoreDisplay = document.getElementById('score');
    if (scoreDisplay) {
        scoreDisplay.innerText = score;
    }
}

function getQuestionStatus(index) {
    const statusSpan = document.getElementById(`status-${index}`);
    return statusSpan ? statusSpan.innerText : 'Unchecked';
}

function generateAnswerFile() {
    // Create CSV header
    let csvContent = "Question Number,Selected Options,Status,Corrected Answer,Query Status\n";

    // Add data for each question
    const qCount = isCustomQuiz ? customQuestions.length : totalQuestions;
    for (let i = 0; i < qCount; i++) {
        const questionNumber = i + 1;
        let selectedOptions = userAnswers[i] || 'Not Answered';

        // For custom quizzes, include the full option text
        if (isCustomQuiz && userAnswers[i]) {
            const currentQ = customQuestions[i];
            const optIdx = currentQ.options.findIndex(opt => opt === userAnswers[i]);
            if (optIdx !== -1) {
                selectedOptions = `${String.fromCharCode(65 + optIdx)}) ${userAnswers[i]}`;
            }
        }

        // Ensure 'Not Answered' is explicitly added for unanswered questions
        if (!userAnswers[i]) {
            selectedOptions = 'Not Answered';
        }

        // Determine the status (Right, Wrong, or Unchecked)
        let status = '';
        if (userAnswers[i]) {
            const correctAnswer = correctedAnswers[i];
            if (correctAnswer) {
                const currentQ = isCustomQuiz ? customQuestions[i] : questions[i];
                const optIdx = currentQ.options.findIndex(opt => opt === userAnswers[i]);
                const selectedLetter = String.fromCharCode(65 + optIdx);
                status = selectedLetter === correctAnswer ? 'Right' : 'Wrong';
            } else {
                status = 'Unchecked';
            }
        }

        const correctedAnswer = correctedAnswers[i] || '';
        const queryStatus = starredQuestions[i] ? 'Doubt' : '';

        csvContent += `${questionNumber},"${selectedOptions}","${status}","${correctedAnswer}","${queryStatus}"\n`;
    }

    // Add total score at the end for non-custom quizzes
    if (!isCustomQuiz) {
        const totalScore = document.getElementById('score')?.textContent || 0;
        csvContent += `\nTotal Score,${totalScore},,,"Out of ${qCount}"\n`;
    }

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "quiz_answers.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Reset progress function
function resetProgress() {
    const confirmed = confirm('Are you sure you want to reset all progress? This will take you back to the start of the exam.');
    if (!confirmed) return; // Exit if user cancels
    
    // Clear localStorage
    localStorage.removeItem('quizProgress');
    
    // Show a brief message before refreshing
    const resetButton = document.getElementById('reset-button');
    resetButton.style.backgroundColor = '#4CAF50'; // Green background
    resetButton.style.color = 'white'; // White text
    resetButton.innerHTML = 'Resetting...'; // Set button text
    
    // Add animation class
    resetButton.classList.add('done-animation');
    
    // Refresh the page after a short delay
    setTimeout(() => {
        window.location.reload();
    }, 500);
}

// Helper function to properly save progress
function saveProgress() {
    const saveButton = document.getElementById('save-button');
    
    // Change button appearance with animation
    saveButton.style.backgroundColor = '#4CAF50';
    saveButton.style.color = 'white';
    saveButton.innerHTML = 'Saved!';
    saveButton.classList.add('done-animation');
    
    // Save progress
    const visitedQuestions = Array.from(document.querySelectorAll('.preview-btn.visited'))
        .map(btn => parseInt(btn.getAttribute('data-index')));
    
    localStorage.setItem('quizProgress', JSON.stringify({
        answers: userAnswers,
        currentIndex: currentQuestionIndex,
        visitedQuestions: visitedQuestions
    }));
    
    // Revert button after 1 second
    setTimeout(() => {
        saveButton.style.backgroundColor = '';
        saveButton.style.color = '';
        saveButton.innerHTML = 'Save';
        saveButton.classList.remove('done-animation');
    }, 1000);
}

// Add event listener for save button
document.getElementById('save-button').addEventListener('click', saveProgress);

// Add event listener for reset button
document.getElementById('reset-button').addEventListener('click', resetProgress);

// Initialize download selected options button
// Removed as per user request

// Enhanced download button with animation
document.getElementById("new-download-btn").addEventListener("click", function() {
    // Add click animation class
    this.classList.add('click-animation');
    
    // Remove animation after it completes
    setTimeout(() => {
        this.classList.remove('click-animation');
    }, 300);
    
    // Trigger download
    downloadSelectedOptions();
});

// All reset functionality is now handled in resetProgress()

// Theme Toggle Functionality
document.getElementById('theme-toggle').addEventListener('click', function() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    
    if (isDark) {
        html.removeAttribute('data-theme');
        this.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
        localStorage.setItem('theme', 'light');
    } else {
        html.setAttribute('data-theme', 'dark');
        this.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        localStorage.setItem('theme', 'dark');
    }
});

// Load saved theme preference
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.getElementById('theme-toggle');
    
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    }
});

window.onload = () => {
    // Add quiz-title class to the main title
    const mainTitle = document.querySelector('h1');
    if (mainTitle) {
        mainTitle.classList.add('quiz-title');
    }
    
    // Hide quiz interface initially
    document.querySelector('.quiz-container').style.display = 'none';
    document.querySelector('.sidebar').style.display = 'none';
    
    // Create fullscreen toggle button
    const fullscreenToggle = document.createElement('button');
    fullscreenToggle.id = 'fullscreen-toggle';
    fullscreenToggle.className = 'menu-toggle';
    fullscreenToggle.innerHTML = '<i class="fas fa-expand"></i>';
    
    // Add fullscreen toggle functionality
    fullscreenToggle.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
            fullscreenToggle.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                fullscreenToggle.innerHTML = '<i class="fas fa-expand"></i>';
            }
        }
    });
    
    // Add fullscreen change event listener
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            fullscreenToggle.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            fullscreenToggle.innerHTML = '<i class="fas fa-expand"></i>';
        }
    });
    
    // Add the fullscreen toggle to the document
    document.body.appendChild(fullscreenToggle);
    
    // Remove any existing fullscreen buttons
    createControlPanel();
    
    // Show setup panel
    const setupContainer = document.querySelector('.quiz-setup-container');
    setupContainer.style.display = 'flex';
    
    // Clear existing content and create new setup structure
    setupContainer.innerHTML = `
        <div class="setup-box">
            <h3>Quiz Setup</h3>
            <div class="setup-controls">
                <div class="setup-row">
                    <label for="student-name">Student Name (Optional)</label>
                    <input type="text" id="student-name" class="setup-select" placeholder="Enter your name">
                </div>
                <div class="setup-row">
                    <label for="question-count">Number of Questions</label>
                    <select id="question-count" class="setup-select">
                        <option value="10">10 Questions</option>
                        <option value="25">25 Questions</option>
                        <option value="50">50 Questions</option>
                        <option value="100">100 Questions</option>
                        <option value="150" selected>150 Questions</option>
                    </select>
                </div>
                <div class="or-separator">or</div>
                <button id="customized-quiz-btn" class="setup-btn">
                    <i class="fas fa-file-upload"></i> Upload Custom Quiz
                </button>
                <button id="start-quiz-btn" class="setup-btn">
                    <i class="fas fa-play"></i> Start Quiz
                </button>
            </div>
        </div>
    `;
    
    // Setup start quiz button
    const startBtn = document.getElementById('start-quiz-btn');
    const questionCountInput = document.getElementById('question-count');
    
    // Initialize cursor toggle state from localStorage
    const cursorEnabled = localStorage.getItem('cursorEnabled') !== 'false';
    const follower = document.querySelector('.follower');
    follower.style.display = cursorEnabled ? 'flex' : 'none';
    
    // Setup cursor toggle button
    const cursorToggleBtn = document.getElementById('cursor-toggle');
    if (cursorToggleBtn) {
        cursorToggleBtn.classList.toggle('active', cursorEnabled);
        cursorToggleBtn.innerHTML = `<i class="fas ${cursorEnabled ? 'fa-mouse-pointer' : 'fa-times'}"></i> Cursor ${cursorEnabled ? 'On' : 'Off'}`;
        
        cursorToggleBtn.addEventListener('click', () => {
            const isEnabled = follower.style.display !== 'none';
            follower.style.display = isEnabled ? 'none' : 'flex';
            cursorToggleBtn.classList.toggle('active');
            cursorToggleBtn.classList.add('animate');
            
            // Update button text and icon
            cursorToggleBtn.innerHTML = `<i class="fas ${isEnabled ? 'fa-times' : 'fa-mouse-pointer'}"></i> Cursor ${isEnabled ? 'Off' : 'On'}`;
            
            // Save state to localStorage
            localStorage.setItem('cursorEnabled', !isEnabled);
            
            // Remove animation class after animation completes
            setTimeout(() => {
                cursorToggleBtn.classList.remove('animate');
            }, 300);
        });
    }
    
    if (startBtn && questionCountInput) {
        startBtn.addEventListener('click', () => {
            currentQuestionIndex = 0;
            userAnswers = new Array(150).fill(null);
            totalQuestions = parseInt(questionCountInput.value) || 150;
            startQuiz();
            const savedProgress = localStorage.getItem('quizProgress');
            if (savedProgress) {
                loadProgress();
            }
        });
    } else {
        console.error('Start button or question count input not found');
    }
    
    // Hide paper checked button initially
    const paperCheckedButton = document.getElementById('paper-checked-button');
    if (paperCheckedButton) {
        paperCheckedButton.style.display = 'none';
    }

    // Initialize custom quiz functionality
    const customizedQuizBtn = document.getElementById('customized-quiz-btn');
    const modal = document.getElementById('file-upload-modal');
    const closeModal = document.querySelector('.close-modal');
    const quizFileInput = document.getElementById('quiz-file');
    const processFileBtn = document.getElementById('process-file-btn');

    if (customizedQuizBtn && modal) {
        // Remove any existing listeners
        const newCustomizedQuizBtn = customizedQuizBtn.cloneNode(true);
        customizedQuizBtn.parentNode.replaceChild(newCustomizedQuizBtn, customizedQuizBtn);
        
        newCustomizedQuizBtn.addEventListener('click', () => {
            modal.style.display = 'block';
        });

        if (closeModal) {
            const newCloseModal = closeModal.cloneNode(true);
            closeModal.parentNode.replaceChild(newCloseModal, closeModal);
            
            newCloseModal.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        // Single event listener for clicking outside modal
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        }, { once: true });

        if (processFileBtn && quizFileInput) {
            // Remove any existing listeners
            const newProcessFileBtn = processFileBtn.cloneNode(true);
            processFileBtn.parentNode.replaceChild(newProcessFileBtn, processFileBtn);
            
            newProcessFileBtn.addEventListener('click', async () => {
                const file = quizFileInput.files[0];
                if (!file) {
                    showCustomAlert('Please select a file first!');
                    return;
                }

                try {
                    const questions = await parseQuizFile(file);
                    if (!questions || questions.length === 0) {
                        showCustomAlert('No valid questions found in the file.\nPlease make sure your file follows the correct format and try again.');
                        return;
                    }
                    customQuestions = questions;
                    isCustomQuiz = true;
                    modal.style.display = 'none';
                    startCustomQuiz();
                } catch (error) {
                    showCustomAlert('Error processing file: ' + error.message);
                }
            });
        }
    }

    // Add event listener for new feature button
    const newFeatureBtn = document.getElementById('new-feature-btn');
    if (newFeatureBtn) {
        // Update button text
        newFeatureBtn.innerHTML = '<i class="fas fa-key"></i> Create Answer Key';
        
        // Remove any existing listeners
        const newBtn = newFeatureBtn.cloneNode(true);
        newFeatureBtn.parentNode.replaceChild(newBtn, newFeatureBtn);
        newBtn.addEventListener('click', () => {
            initializeNewFeature();
        });
    }
};

// Add timer functions
function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function toggleStopwatch() {
    const display = document.getElementById('stopwatch-display');
    const button = document.getElementById('stopwatch-toggle');
    
    const now = Date.now();
    if (now - lastStopwatchClick < 300) { // Double click detected (300ms threshold)
        // Reset stopwatch
        if (isStopwatchRunning) {
            isStopwatchRunning = false;
            button.style.backgroundColor = '';
            clearInterval(stopwatchInterval);
        }
        stopwatchTime = 0;
        display.textContent = formatTime(stopwatchTime);
        
        // Add quick flash effect
        button.style.transition = 'background-color 0.15s';
        button.style.backgroundColor = '#e74c3c';
        setTimeout(() => {
            button.style.backgroundColor = '';
        }, 150);
    } else {
        // Normal single click behavior
        if (!isStopwatchRunning) {
            isStopwatchRunning = true;
            button.style.backgroundColor = '#4CAF50';
            stopwatchInterval = setInterval(() => {
                stopwatchTime++;
                display.textContent = formatTime(stopwatchTime);
            }, 1000);
        } else {
            isStopwatchRunning = false;
            button.style.backgroundColor = '';
            clearInterval(stopwatchInterval);
        }
    }
    lastStopwatchClick = now;
}

function toggleTimer() {
    const display = document.getElementById('timer-display');
    const button = document.getElementById('timer-toggle');
    
    const now = Date.now();
    if (now - lastTimerClick < 300) { // Double click detected (300ms threshold)
        // Reset timer
        if (isTimerRunning) {
            isTimerRunning = false;
            button.style.backgroundColor = '';
            clearInterval(timerInterval);
        }
        timerTime = 0;
        display.textContent = '--:--:--';
        
        // Add quick flash effect
        button.style.transition = 'background-color 0.15s';
        button.style.backgroundColor = '#e74c3c';
        setTimeout(() => {
            button.style.backgroundColor = '';
        }, 150);
    } else {
        // Normal single click behavior
        if (!isTimerRunning && timerTime > 0) {
            isTimerRunning = true;
            button.style.backgroundColor = '#4CAF50';
            timerInterval = setInterval(() => {
                if (timerTime > 0) {
                    timerTime--;
                    display.textContent = formatTime(timerTime);
                    if (timerTime === 0) {
                        clearInterval(timerInterval);
                        showCustomAlert('Time is up!', () => {
                        document.getElementById('submit-quiz').click();
                        });
                    }
                }
            }, 1000);
        } else if (isTimerRunning) {
            isTimerRunning = false;
            button.style.backgroundColor = '';
            clearInterval(timerInterval);
        }
    }
    lastTimerClick = now;
}

function setTimer() {
    const hours = parseInt(prompt('Enter hours (0-23):', '0')) || 0;
    const minutes = parseInt(prompt('Enter minutes (0-59):', '0')) || 0;
    const seconds = parseInt(prompt('Enter seconds (0-59):', '0')) || 0;
    
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60 && seconds >= 0 && seconds < 60) {
        timerTime = hours * 3600 + minutes * 60 + seconds;
        document.getElementById('timer-display').textContent = formatTime(timerTime);
    } else {
        alert('Invalid time format!');
    }
}

// Add event listeners for timer controls
document.getElementById('stopwatch-toggle').addEventListener('click', toggleStopwatch);
document.getElementById('timer-toggle').addEventListener('click', toggleTimer);
document.getElementById('set-timer').addEventListener('click', setTimer);

// Event Listeners for Custom Quiz
if (customizedQuizBtn) {
customizedQuizBtn.addEventListener('click', () => {
    modal.style.display = 'block';
});
}

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

processFileBtn.addEventListener('click', async () => {
    const file = quizFileInput.files[0];
    if (!file) {
        showCustomAlert('Please select a file first!');
        return;
    }

    try {
        const questions = await parseQuizFile(file);
        if (questions.length > 0) {
            customQuestions = questions;
            isCustomQuiz = true;
            modal.style.display = 'none';
            startCustomQuiz();
        } else {
            alert('No valid questions found in the file!');
        }
    } catch (error) {
        alert('Error processing file: ' + error.message);
    }
});

async function parseQuizFile(file) {
    const fileType = file.name.split('.').pop().toLowerCase();
    let text = '';

    switch (fileType) {
        case 'txt':
            text = await file.text();
            break;
        case 'docx':
        case 'doc':
            text = await parseDocx(file);
            break;
        case 'xlsx':
        case 'xls':
            text = await parseExcel(file);
            break;
        default:
            throw new Error('Unsupported file format');
    }

    return parseQuestionsFromText(text);
}

async function parseDocx(file) {
    // This is a placeholder - you'll need to implement actual DOCX parsing
    // You might want to use a library like mammoth.js
    throw new Error('DOCX parsing not implemented yet');
}

async function parseExcel(file) {
    // This is a placeholder - you'll need to implement actual Excel parsing
    // You might want to use a library like xlsx
    throw new Error('Excel parsing not implemented yet');
}

function parseQuestionsFromText(text) {
    const questions = [];
    const lines = text.split('\n');
    let currentQuestion = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.match(/^Q\d+\./)) {
            if (currentQuestion) {
                questions.push(currentQuestion);
            }
            currentQuestion = {
                question: line.replace(/^Q\d+\.\s*/, ''),
                options: []
            };
        } else if (line.match(/^[A-E]\)/)) {
            if (currentQuestion) {
                currentQuestion.options.push(line.replace(/^[A-E]\)\s*/, ''));
            }
        }
    }

    if (currentQuestion && currentQuestion.options.length > 0) {
        questions.push(currentQuestion);
    }

    return questions;
}

function startCustomQuiz() {
    // Hide setup panel and show quiz interface
    document.querySelector('.quiz-setup-container').style.display = 'none';
    document.querySelector('.quiz-container').style.display = 'flex';
    document.querySelector('.sidebar').style.display = 'block';
    
    // Initialize quiz state
    currentQuestionIndex = 0;
    userAnswers = new Array(customQuestions.length).fill(null);
    score = 0;
    isSubmitted = false;
    
    // Clear any previous selections
    document.getElementById('selected-options-list').innerHTML = '';
    
    // Make sure download button is visible
    document.getElementById("new-download-btn").style.display = "block";
    
    // Show submit button in menu
    document.getElementById('submit-quiz').style.display = 'block';
    document.querySelector('.submit-row').style.display = 'flex';
    
    // Hide new feature button for custom quiz
    document.querySelector('.new-feature-row').style.display = 'none';
    
    // Create progress bar if it doesn't exist
    createProgressBar();
    
    generateQuestionPreview();
    showQuestion();
    updateProgressBar();
}

function createProgressBar() {
    const quizContainer = document.querySelector('.quiz-container');
    
    // Remove existing progress bar if any
    const existingBar = quizContainer.querySelector('.quiz-progress-bar');
    if (existingBar) existingBar.remove();
    
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'quiz-progress-bar';
    quizContainer.appendChild(progressBar);
    
    updateQuestionProgress();
}

function updateQuestionProgress() {
    const progressBar = document.querySelector('.quiz-progress-bar');
    
    if (progressBar) {
        const qCount = isCustomQuiz ? customQuestions.length : totalQuestions;
        const progress = ((currentQuestionIndex + 1) / qCount) * 100;
        progressBar.style.width = `${progress}%`;
    }
}

// Add close button logic for review modal
window.addEventListener('DOMContentLoaded', function() {
    const closeReviewModal = document.querySelector('.close-review-modal');
    if (closeReviewModal) {
        closeReviewModal.onclick = function() {
            document.getElementById('review-modal').style.display = 'none';
        };
    }
});

// Add this function to show and enable the dashboard button
function enableDashboardButton() {
    const dashboardRow = document.querySelector('.dashboard-row');
    const dashboardButton = document.getElementById('dashboard-button');
    
    if (dashboardRow && dashboardButton) {
        dashboardRow.style.display = 'block';
        dashboardButton.disabled = false;
        dashboardButton.classList.add('active');
    }
}

// Function to update dashboard statistics
function updateDashboard() {
    // Update student name if provided
    const studentName = document.getElementById('student-name')?.value || 'Anonymous Student';
    document.getElementById('dashboard-student-name').textContent = studentName;

    // Calculate statistics
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    let doubts = 0;

    const reviewBoxes = document.querySelectorAll('.review-box');
    reviewBoxes.forEach(box => {
        if (box.classList.contains('right-selected')) {
            correct++;
        } else if (box.classList.contains('wrong-selected')) {
            incorrect++;
        } else if (box.classList.contains('doubt-selected')) {
            doubts++;
        } else {
            unanswered++;
        }
    });

    const total = reviewBoxes.length;
    const scorePercentage = (correct / total) * 100;

    // Update score circle
    document.getElementById('dashboard-score').textContent = correct;
    document.getElementById('dashboard-total').textContent = `/${total}`;
    
    // Animate score circle
    const circle = document.querySelector('.score-progress-circle');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    const offset = circumference - (scorePercentage / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    // Update statistics grid if it doesn't exist
    let statsGrid = document.querySelector('.stats-grid');
    if (!statsGrid) {
        statsGrid = document.createElement('div');
        statsGrid.className = 'stats-grid';
        document.querySelector('.dashboard-body').insertBefore(
            statsGrid,
            document.querySelector('.answers-list')
        );
    }

    // Update statistics grid content
    statsGrid.innerHTML = `
        <div class="stat-box correct">
            <i class="fas fa-check-circle"></i>
            <span class="stat-value">${correct}</span>
            <span class="stat-label">Correct</span>
        </div>
        <div class="stat-box incorrect">
            <i class="fas fa-times-circle"></i>
            <span class="stat-value">${incorrect}</span>
            <span class="stat-label">Incorrect</span>
        </div>
        <div class="stat-box unanswered">
            <i class="fas fa-minus-circle"></i>
            <span class="stat-value">${unanswered}</span>
            <span class="stat-label">Unanswered</span>
        </div>
        <div class="stat-box doubts">
            <i class="fas fa-question-circle"></i>
            <span class="stat-value">${doubts}</span>
            <span class="stat-label">Doubts</span>
        </div>
    `;

    // Create or update answers list
    let answersList = document.querySelector('.answers-list');
    if (!answersList) {
        answersList = document.createElement('div');
        answersList.className = 'answers-list';
        document.querySelector('.dashboard-body').appendChild(answersList);
    }

    // Clear existing answers
    answersList.innerHTML = '<h3>Answers Summary</h3>';

    // Add answer items
    reviewBoxes.forEach((box, index) => {
        const answerItem = document.createElement('div');
        answerItem.className = 'answer-item';
        
        if (box.classList.contains('right-selected')) {
            answerItem.classList.add('correct');
        } else if (box.classList.contains('wrong-selected')) {
            answerItem.classList.add('incorrect');
        } else if (box.classList.contains('doubt-selected')) {
            answerItem.classList.add('doubt');
        } else {
            answerItem.classList.add('unanswered');
        }
        
        answerItem.innerHTML = `
            <span class="question-number">Q${index + 1}</span>
            <span class="answer-value">${getSelectedAnswer(index) || '-'}</span>
        `;
        answersList.appendChild(answerItem);
    });
}

// Helper function to get selected answer for a question
function getSelectedAnswer(questionIndex) {
    const reviewBox = document.querySelectorAll('.review-box')[questionIndex];
    const selectedOption = reviewBox.querySelector('.option-circle.selected');
    return selectedOption ? selectedOption.textContent : '-';
}

// Add close functionality for dashboard modal
document.querySelector('.close-dashboard').addEventListener('click', function() {
    const dashboardModal = document.getElementById('dashboard-modal');
    dashboardModal.classList.remove('show');
    setTimeout(() => {
        dashboardModal.style.display = 'none';
    }, 300);
});

// Define dashboardButton and add click event listener
const dashboardButton = document.getElementById('dashboard-button');
// Add click event listener for dashboard button
dashboardButton.addEventListener('click', function() {
    if (!this.disabled) {
        // Close menu panel
        closeMenuPanel();
        
        // Show dashboard
        updateDashboard();
        const dashboardModal = document.getElementById('dashboard-modal');
        dashboardModal.style.display = 'flex';
        dashboardModal.style.justifyContent = 'center';
        dashboardModal.style.alignItems = 'center';
        setTimeout(() => {
            dashboardModal.classList.add('show');
        }, 10);
    }
});

function toggleReviewPanel() {
    const reviewContainer = document.getElementById('review-container');
    const quizContainer = document.querySelector('.quiz-container');
    const toggleBtn = document.querySelector('.toggle-review-btn');
    
    if (!toggleBtn) return;
    
    if (reviewContainer.style.display === 'none' || !reviewContainer.style.display) {
        // Switching to review panel
        reviewContainer.style.display = 'block';
        quizContainer.style.display = 'none';
        toggleBtn.innerHTML = `
            <i class="fas fa-arrow-left toggle-icon"></i>
            <span class="toggle-label">Back to Quiz</span>
        `;
    } else {
        // Switching to quiz panel
        reviewContainer.style.display = 'none';
        quizContainer.style.display = 'flex';
        toggleBtn.innerHTML = `
            <i class="fas fa-clipboard-list toggle-icon"></i>
            <span class="toggle-label">Show Review</span>
        `;
    }
}

// Function to initialize the new feature panels
function initializeNewFeature() {
    // Close menu panel first
    menuPanel.classList.remove('open');
    mainContainer.style.filter = '';
    mainContainer.style.pointerEvents = '';
    const quizContainer = document.querySelector('.quiz-container');
    if (quizContainer) {
        quizContainer.style.marginLeft = '20px';
    }

    // Hide the control panel
    const controlPanel = document.querySelector('.control-panel');
    if (controlPanel) {
        controlPanel.style.display = 'none';
    }

    const newFeaturePanels = document.getElementById('new-feature-panels');
    const questionsList = document.querySelector('.questions-list');
    const rightAnswersList = document.querySelector('.right-answers-list');
    const reviewContainer = document.getElementById('review-container');
    const selectedOptionsPanel = document.querySelector('.selected-options-panel');
    const sidebar = document.querySelector('.sidebar');
    
    // Hide other containers
    quizContainer.style.display = 'none';
    reviewContainer.style.display = 'none';
    selectedOptionsPanel.style.display = 'none';
    sidebar.style.display = 'none';
    // Hide the download button in answer creation mode (force with important)
    const newDownloadBtn = document.getElementById('new-download-btn');
    if (newDownloadBtn) {
        newDownloadBtn.style.display = 'none';
        newDownloadBtn.style.visibility = 'hidden';
        newDownloadBtn.style.position = 'absolute';
        newDownloadBtn.style.left = '-9999px';
    }

    // Show new feature panels
    newFeaturePanels.style.display = 'grid';

    // Show the menu bar Back to Quiz button
    const backToQuizMenuBtn = document.getElementById('back-to-quiz-menu-btn');
    if (backToQuizMenuBtn) backToQuizMenuBtn.style.display = 'block';

    // Clear existing content
    questionsList.innerHTML = '';
    rightAnswersList.innerHTML = '';
    
    // Get the selected number of questions
    const selectedQuestionCount = parseInt(document.getElementById('question-count').value);
    
    // Create questions with options
    const rightAnswers = new Array(selectedQuestionCount).fill('');
    
    // Add title
    const title = document.createElement('h2');
    title.className = 'questions-title';
    title.style.gridColumn = '1 / -1';
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';
    questionsList.appendChild(title);

    // Clear previous content
    questionsList.innerHTML = '';
    questionsList.appendChild(title);

    // Create a grid: each row has two question cards
    for (let i = 0; i < selectedQuestionCount; i += 2) {
        const row = document.createElement('div');
        row.className = 'question-row';
        row.style.display = 'grid';
        row.style.gridTemplateColumns = '1fr 1fr';
        row.style.gap = '10px';
        row.style.marginBottom = '8px';

        for (let j = 0; j < 2; j++) {
            const qIndex = i + j;
            if (qIndex >= selectedQuestionCount) break;
            const questionItem = document.createElement('div');
            questionItem.className = 'question-item';
            if (rightAnswers[qIndex]) questionItem.classList.add('locked');

            const questionHeader = document.createElement('div');
            questionHeader.className = 'question-header';
            // Use a circular badge for the question number
            const questionBadge = document.createElement('div');
            questionBadge.className = 'question-badge';
            questionBadge.textContent = `Q${qIndex + 1}`;
            questionHeader.appendChild(questionBadge);

            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'option-buttons';
            ['A', 'B', 'C', 'D', 'E'].forEach((option, optIndex) => {
                const button = document.createElement('button');
                button.className = 'option-btn-small';
                button.textContent = option;
                if (rightAnswers[qIndex] === option) button.classList.add('selected');
                button.addEventListener('click', function () {
                    // Toggle selection: deselect if already selected
                    if (this.classList.contains('selected')) {
                        this.classList.remove('selected');
                        questionItem.classList.remove('locked');
                        rightAnswers[qIndex] = '';
                        updateRightAnswersPanel(rightAnswers);
                        return;
                    }
                    questionItem.classList.add('locked');
                    optionsContainer.querySelectorAll('.option-btn-small').forEach(btn => {
                        btn.classList.remove('selected');
                    });
                    this.classList.add('selected');
                    rightAnswers[qIndex] = option;
                    updateRightAnswersPanel(rightAnswers);
                });
                optionsContainer.appendChild(button);
            });
            questionHeader.appendChild(optionsContainer);
            questionItem.appendChild(questionHeader);
            row.appendChild(questionItem);
        }
        questionsList.appendChild(row);
    }

    // Initialize the right answers panel with empty state
    updateRightAnswersPanel(rightAnswers);
}

// Add event listener for menu bar Back to Quiz button
const backToQuizMenuBtn = document.getElementById('back-to-quiz-menu-btn');
if (backToQuizMenuBtn) {
    backToQuizMenuBtn.addEventListener('click', function() {
        showCustomConfirm(
            "Warning: This action will erase all current progress. Are you sure you want to continue?",
            (confirmed) => {
                if (!confirmed) return;
                document.getElementById('new-feature-panels').style.display = 'none';
                document.querySelector('.quiz-container').style.display = 'flex';
                document.querySelector('.selected-options-panel').style.display = 'block';
                document.querySelector('.sidebar').style.display = 'block';
                const newDownloadBtn = document.getElementById('new-download-btn');
                if (newDownloadBtn) {
                    newDownloadBtn.style.display = 'block';
                    newDownloadBtn.style.visibility = 'visible';
                    newDownloadBtn.style.position = '';
                    newDownloadBtn.style.left = '';
                }
                backToQuizMenuBtn.style.display = 'none';
                const controlPanel = document.querySelector('.control-panel');
                if (controlPanel) controlPanel.style.display = 'block';
                menuPanel.classList.remove('open');
                mainContainer.style.filter = '';
                mainContainer.style.pointerEvents = '';
                const quizContainer = document.querySelector('.quiz-container');
                if (quizContainer) quizContainer.style.marginLeft = '20px';
                showQuestion();
            }
        );
    });
}

// Update the updateRightAnswersPanel function to ensure proper initialization
function updateRightAnswersPanel(answers) {
    const rightAnswersList = document.querySelector('.right-answers-list');
    rightAnswersList.innerHTML = '';
    answers.forEach((answer, index) => {
        if (answer) {
            const answerItem = document.createElement('div');
            answerItem.className = 'right-answer-item';
            answerItem.style.display = 'flex';
            answerItem.style.alignItems = 'center';
            answerItem.style.gap = '8px';
            answerItem.innerHTML = `
                <span class="selected-option-pill">Q${index + 1}: ${answer}</span>
            `;
            rightAnswersList.appendChild(answerItem);
        }
    });
    attachRightAnswersDownloadHandler();
}

// Update toggleFullscreen function
function toggleFullscreen() {
    const fullscreenBtn = document.querySelector('.fullscreen-btn');
    
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
        if (fullscreenBtn) {
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i> Exit Fullscreen';
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i> Fullscreen';
            }
        }
    }
}

// Update fullscreen change event listener
document.addEventListener('fullscreenchange', () => {
    const fullscreenBtn = document.querySelector('.fullscreen-btn');
    if (fullscreenBtn) {
        if (document.fullscreenElement) {
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i> Exit Fullscreen';
        } else {
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i> Fullscreen';
        }
    }
});

// Remove fullscreen button from control panel
function createControlPanel() {
    const controlPanel = document.querySelector('.control-panel');
    if (controlPanel) {
        // Remove any existing fullscreen row
        const fullscreenRow = controlPanel.querySelector('.fullscreen-row');
        if (fullscreenRow) {
            fullscreenRow.remove();
        }
        
        // Also remove any fullscreen button that might be in other rows
        const fullscreenBtn = controlPanel.querySelector('[class*="fullscreen"]');
        if (fullscreenBtn) {
            const parentRow = fullscreenBtn.closest('.control-row');
            if (parentRow) {
                parentRow.remove();
            }
        }
    }
}

// Call createControlPanel when starting quiz and after submission
document.addEventListener('DOMContentLoaded', () => {
    createControlPanel();
});

// Custom Modal Dialog Functions
function createCustomModal() {
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `
        <div class="custom-modal-content">
            <div class="custom-modal-message"></div>
            <div class="custom-modal-buttons"></div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function showCustomAlert(message, callback) {
    const modal = createCustomModal();
    const messageDiv = modal.querySelector('.custom-modal-message');
    const buttonsDiv = modal.querySelector('.custom-modal-buttons');
    
    messageDiv.textContent = message;
    
    const okButton = document.createElement('button');
    okButton.className = 'custom-modal-btn primary';
    okButton.textContent = 'OK';
    okButton.onclick = () => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            if (callback) callback(true);
        }, 300);
    };
    
    buttonsDiv.appendChild(okButton);
    
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('show'), 10);
}

function showCustomConfirm(message, callback) {
    const modal = createCustomModal();
    const messageDiv = modal.querySelector('.custom-modal-message');
    const buttonsDiv = modal.querySelector('.custom-modal-buttons');
    
    messageDiv.textContent = message;
    
    const confirmButton = document.createElement('button');
    confirmButton.className = 'custom-modal-btn primary';
    confirmButton.textContent = 'Yes';
    confirmButton.onclick = () => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            callback(true);
        }, 300);
    };
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'custom-modal-btn secondary';
    cancelButton.textContent = 'No';
    cancelButton.onclick = () => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            callback(false);
        }, 300);
    };
    
    buttonsDiv.appendChild(confirmButton);
    buttonsDiv.appendChild(cancelButton);
    
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('show'), 10);
}

// Add the updateRightAnswersPanel function
function updateRightAnswersPanel(answers) {
    const rightAnswersList = document.querySelector('.right-answers-list');
    rightAnswersList.innerHTML = '';
    answers.forEach((answer, index) => {
        if (answer) {
            const answerItem = document.createElement('div');
            answerItem.className = 'right-answer-item';
            answerItem.style.display = 'flex';
            answerItem.style.alignItems = 'center';
            answerItem.style.gap = '8px';
            answerItem.innerHTML = `
                <span class="selected-option-pill">Q${index + 1}: ${answer}</span>
            `;
            rightAnswersList.appendChild(answerItem);
        }
    });
    attachRightAnswersDownloadHandler();
}

// Update the downloadAnswerKey function
function downloadAnswerKey(answers) {
    let content = '';
    answers.forEach((answer, index) => {
        if (answer) {
            // Extract just the letter (A, B, C, D, E) from the answer
            const letterMatch = answer.match(/Option ([A-E])/);
            if (letterMatch) {
                content += `Question ${index + 1}: ${letterMatch[1]}\n`;
            }
        }
    });

    if (!content) {
        showCustomAlert('No answers selected yet!');
        return;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'answer_key.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Remove any previous event listeners for the right-answers-download-btn
function attachRightAnswersDownloadHandler() {
    const oldBtn = document.getElementById('right-answers-download-btn');
    if (!oldBtn) return;
    const newBtn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);

    newBtn.addEventListener('click', function (e) {
        console.log('Download button clicked!');
        const rightAnswersList = document.querySelectorAll('.right-answers-list .right-answer-item');
        let hasAnswer = false;
        rightAnswersList.forEach(item => {
            const answerText = item.querySelector('.answer-value')?.textContent.trim();
            if (answerText && answerText !== '') {
                hasAnswer = true;
            }
        });
        if (!hasAnswer) {
            e.preventDefault();
            console.log('No answers selected, showing custom alert!');
            showCustomAlert('No answer has been selected yet!');
            return;
        }
        let content = '';
        rightAnswersList.forEach((item, index) => {
            const questionNumber = index + 1;
            const answerText = item.querySelector('.answer-value')?.textContent.trim();
            if (answerText && answerText !== '') {
                content += `Question ${questionNumber}: ${answerText}\n`;
            }
        });
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'answer_key.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

function downloadAnswers() {
    const answers = [];
    const qCount = isCustomQuiz ? customQuestions.length : totalQuestions;

    // Add headers for the CSV file
    answers.push(['Question Number', 'Selected Options', 'Status', 'Corrected Answer', 'Query Status']);

    for (let index = 0; index < qCount; index++) {
        const questionNumber = index + 1;
        let selectedAnswer = userAnswers[index];
        let formattedSelectedAnswer = '';
        let correctedAnswer = '';
        if (isCustomQuiz) {
            // For custom quiz: full option in selected options
            if (!selectedAnswer) {
                formattedSelectedAnswer = 'Not Answered';
            } else {
                const currentQ = customQuestions[index];
                const optIdx = currentQ.options.findIndex(opt => opt === selectedAnswer);
                if (optIdx !== -1) {
                    formattedSelectedAnswer = `${String.fromCharCode(65 + optIdx)}) ${currentQ.options[optIdx]}`;
                } else {
                    formattedSelectedAnswer = selectedAnswer;
                }
            }
            // Corrected answer: full option if a circle is selected
            const reviewBox = document.querySelectorAll('.review-box')[index];
            if (reviewBox) {
                const selectedCircle = reviewBox.querySelector('.option-circle.selected');
                if (selectedCircle) {
                    // Find the full option text for the selected circle
                    const letter = selectedCircle.textContent.trim();
                    const currentQ = customQuestions[index];
                    const optIdx = letter.charCodeAt(0) - 65;
                    if (currentQ && currentQ.options[optIdx]) {
                        correctedAnswer = `${letter}) ${currentQ.options[optIdx]}`;
                    } else {
                        correctedAnswer = letter;
                    }
                }
            }
        } else {
            // Standard quiz: only option letter
            if (!selectedAnswer) {
                formattedSelectedAnswer = 'Not Answered';
            } else {
                const match = selectedAnswer.match(/Option ([A-E])/);
                if (match) {
                    formattedSelectedAnswer = match[1];
                } else {
                    formattedSelectedAnswer = selectedAnswer;
                }
            }
            // Corrected answer: only option letter
            const reviewBox = document.querySelectorAll('.review-box')[index];
            if (reviewBox) {
                const selectedCircle = reviewBox.querySelector('.option-circle.selected');
                if (selectedCircle) {
                    correctedAnswer = selectedCircle.textContent.trim();
                }
            }
        }

        // Status logic
        let status = '';
        const reviewBox = document.querySelectorAll('.review-box')[index];
        if (reviewBox) {
            if (reviewBox.classList.contains('right-selected')) {
                status = 'Right';
            } else if (reviewBox.classList.contains('wrong-selected')) {
                status = 'Wrong';
            } else if (selectedAnswer) {
                status = 'Unchecked';
            }
        }
        const queryStatus = starredQuestions[index] ? 'Doubt' : '';
        answers.push([questionNumber, formattedSelectedAnswer, status, correctedAnswer, queryStatus]);
    }

    // Add the score row at the end ONLY for custom quiz
    if (isCustomQuiz) {
        const totalScore = document.getElementById('score')?.textContent || 0;
        answers.push(['Your Score', totalScore, '', '', `Out of ${qCount}`]);
    }

    const csvContent = answers.map(row => row.map(value => `"${value}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'results.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}