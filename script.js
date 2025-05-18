// Store lessons in localStorage
let lessons = JSON.parse(localStorage.getItem('lessons')) || [];
let currentWeekStart = new Date();
currentWeekStart.setHours(0, 0, 0, 0);
currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());

// Add updateStats function
function updateStats() {
    const now = new Date();
    const totalLessons = lessons.length;
    const weeklyLessons = lessons.filter(lesson => isInCurrentWeek(new Date(lesson.date))).length;
    const totalMinutes = lessons.reduce((acc, lesson) => acc + lesson.duration, 0);
    const totalHours = Math.round(totalMinutes / 60);
    
    // Calculate streak
    const streakDays = calculateStreak();
    
    document.getElementById('totalLessons').textContent = totalLessons;
    document.getElementById('weeklyLessons').textContent = weeklyLessons;
    document.getElementById('totalHours').textContent = totalHours;
    document.getElementById('streakDays').textContent = streakDays;
}

function calculateStreak() {
    if (lessons.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dates = lessons.map(lesson => {
        const date = new Date(lesson.date);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
    });
    
    const uniqueDates = [...new Set(dates)].sort((a, b) => b - a);
    let streak = 1;
    
    for (let i = 0; i < uniqueDates.length - 1; i++) {
        const current = new Date(uniqueDates[i]);
        const next = new Date(uniqueDates[i + 1]);
        const diffDays = (current - next) / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

// Add current time indicator
function updateCurrentTimeIndicator() {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const indicator = document.querySelector('.current-time-indicator') || document.createElement('div');
    
    indicator.className = 'current-time-indicator';
    indicator.style.top = `${minutes}px`;
    
    document.getElementById('lessonsContainer').appendChild(indicator);
}

// Initialize the timeline
function initializeTimeline() {
    const timeIndicators = document.getElementById('timeIndicators');
    timeIndicators.innerHTML = '';
    
    // Create time slots for 24 hours
    for (let hour = 0; hour < 24; hour++) {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.style.top = `${hour * 60}px`;
        
        const timeLabel = document.createElement('div');
        timeLabel.className = 'time-label';
        timeLabel.textContent = `${hour.toString().padStart(2, '0')}:00`;
        timeSlot.appendChild(timeLabel);
        
        timeIndicators.appendChild(timeSlot);
    }
    
    updateWeekDisplay();
    renderLessons();
    updateStats();
    updateCurrentTimeIndicator();
}

// Update the week display
function updateWeekDisplay() {
    const endDate = new Date(currentWeekStart);
    endDate.setDate(endDate.getDate() + 6);
    
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    document.getElementById('currentWeek').textContent = 
        `${formatDate(currentWeekStart)} - ${formatDate(endDate)}`;
}

// Render lessons on the timeline
function renderLessons() {
    const container = document.getElementById('lessonsContainer');
    container.innerHTML = '';
    
    lessons.forEach((lesson, index) => {
        const lessonDate = new Date(lesson.date);
        if (isInCurrentWeek(lessonDate)) {
            const lessonEl = createLessonElement(lesson, index);
            container.appendChild(lessonEl);
        }
    });
}

// Create a lesson element
function createLessonElement(lesson, index) {
    const lessonEl = document.createElement('div');
    lessonEl.className = 'lesson-block';
    lessonEl.setAttribute('data-index', index);
    
    const lessonDate = new Date(lesson.date);
    const dayOffset = lessonDate.getDay() * (100 / 7);
    const timeOffset = getMinutesSinceMidnight(lesson.time);
    
    lessonEl.style.left = `${dayOffset}%`;
    lessonEl.style.width = `${100/7 - 2}%`;
    lessonEl.style.top = `${timeOffset}px`;
    lessonEl.style.height = `${lesson.duration}px`;
    
    lessonEl.innerHTML = `
        <div class="font-semibold">${lesson.title}</div>
        <div class="text-sm">${lesson.time}</div>
        <button onclick="deleteLesson(${index})" class="absolute top-1 right-1 text-white hover:text-red-200">×</button>
    `;
    
    // Add click handler for lesson details
    lessonEl.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') {
            showLessonDetails(lesson);
        }
    });
    
    makeDraggable(lessonEl);
    return lessonEl;
}

// Make an element draggable
function makeDraggable(element) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    element.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === element) {
            isDragging = true;
            element.classList.add('dragging');
            // Store the start time to differentiate between clicks and drags
            element.dataset.dragStartTime = Date.now();
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            const container = document.getElementById('lessonsContainer');
            const rect = container.getBoundingClientRect();
            const relativeX = e.clientX - rect.left;
            const relativeY = e.clientY - rect.top;

            // Calculate new day and time
            const dayWidth = container.offsetWidth / 7;
            const newDay = Math.floor(relativeX / dayWidth);
            const newMinutes = Math.floor(relativeY / 60) * 60;

            if (newDay >= 0 && newDay < 7 && newMinutes >= 0 && newMinutes < 1440) {
                const index = parseInt(element.getAttribute('data-index'));
                const lesson = lessons[index];
                
                // Create temporary lesson object for overlap check
                const tempLesson = {
                    ...lesson,
                    date: (() => {
                        const newDate = new Date(currentWeekStart);
                        newDate.setDate(newDate.getDate() + newDay);
                        return newDate.toISOString().split('T')[0];
                    })(),
                    time: `${Math.floor(newMinutes / 60).toString().padStart(2, '0')}:${(newMinutes % 60).toString().padStart(2, '0')}`
                };

                // Check for overlap and update visual feedback
                if (!checkLessonOverlap(tempLesson, lessons, index)) {
                    element.classList.remove('invalid-position');
                    // Update lesson time and date
                    lesson.date = tempLesson.date;
                    lesson.time = tempLesson.time;
                    
                    // Update position
                    element.style.left = `${newDay * (100 / 7)}%`;
                    element.style.top = `${newMinutes}px`;
                } else {
                    element.classList.add('invalid-position');
                }
            }
        }
    }

    function dragEnd() {
        if (isDragging) {
            isDragging = false;
            element.classList.remove('dragging', 'invalid-position');
            localStorage.setItem('lessons', JSON.stringify(lessons));
        }
    }
}

// Helper functions
function getMinutesSinceMidnight(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

function isInCurrentWeek(date) {
    const endDate = new Date(currentWeekStart);
    endDate.setDate(endDate.getDate() + 7);
    return date >= currentWeekStart && date < endDate;
}

// Add this function after the helper functions
function checkLessonOverlap(newLesson, existingLessons, excludeIndex = -1) {
    const newStart = getMinutesSinceMidnight(newLesson.time);
    const newEnd = newStart + newLesson.duration;
    const newDate = new Date(newLesson.date).toDateString();

    return existingLessons.some((lesson, index) => {
        if (index === excludeIndex) return false;
        
        const lessonDate = new Date(lesson.date).toDateString();
        if (lessonDate !== newDate) return false;

        const lessonStart = getMinutesSinceMidnight(lesson.time);
        const lessonEnd = lessonStart + lesson.duration;

        return (newStart < lessonEnd && newEnd > lessonStart);
    });
}

// Event Listeners
document.getElementById('lessonForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const lesson = {
        title: document.getElementById('lessonTitle').value,
        date: document.getElementById('lessonDate').value,
        time: document.getElementById('lessonTime').value,
        duration: parseInt(document.getElementById('lessonDuration').value)
    };

    if (checkLessonOverlap(lesson, lessons)) {
        alert('This lesson overlaps with an existing lesson. Please choose a different time.');
        return;
    }
    
    lessons.push(lesson);
    localStorage.setItem('lessons', JSON.stringify(lessons));
    renderLessons();
    updateStats();
    
    // Show confetti
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
    
    e.target.reset();
});

document.getElementById('prevWeek').addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    updateWeekDisplay();
    renderLessons();
    updateStats();
});

document.getElementById('nextWeek').addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    updateWeekDisplay();
    renderLessons();
    updateStats();
});

function deleteLesson(index) {
    lessons.splice(index, 1);
    localStorage.setItem('lessons', JSON.stringify(lessons));
    renderLessons();
    updateStats();
}

function showLessonDetails(lesson) {
    const detailsHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="this.remove()">
            <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4" onclick="event.stopPropagation()">
                <h2 class="text-xl font-bold mb-4">${lesson.title}</h2>
                <div class="space-y-2">
                    <p><span class="font-semibold">Date:</span> ${formatDate(new Date(lesson.date))}</p>
                    <p><span class="font-semibold">Time:</span> ${lesson.time}</p>
                    <p><span class="font-semibold">Duration:</span> ${lesson.duration} minutes</p>
                </div>
                <button class="mt-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 w-full" onclick="this.closest('.fixed').remove()">
                    Close
                </button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', detailsHtml);
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch(e.key) {
        case 'ArrowLeft':
            if (e.ctrlKey || e.metaKey) {
                document.getElementById('prevWeek').click();
            }
            break;
        case 'ArrowRight':
            if (e.ctrlKey || e.metaKey) {
                document.getElementById('nextWeek').click();
            }
            break;
        case 'Escape':
            const modal = document.querySelector('.fixed.inset-0');
            if (modal) modal.remove();
            break;
    }
});

// Update current time indicator every minute
setInterval(updateCurrentTimeIndicator, 60000);

// Initialize the timeline when the page loads
document.addEventListener('DOMContentLoaded', initializeTimeline); 