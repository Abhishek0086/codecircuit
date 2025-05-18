// Sidebar Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mainContent = document.querySelector('.flex-1');
    let isCollapsed = false;

    sidebarToggle.addEventListener('click', () => {
        isCollapsed = !isCollapsed;
        
        if (isCollapsed) {
            sidebar.classList.remove('w-64');
            sidebar.classList.add('w-20');
            sidebar.querySelectorAll('span').forEach(span => span.classList.add('hidden'));
            mainContent.classList.remove('ml-64');
            sidebarToggle.innerHTML = `
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
            `;
        } else {
            sidebar.classList.add('w-64');
            sidebar.classList.remove('w-20');
            sidebar.querySelectorAll('span').forEach(span => span.classList.remove('hidden'));
            mainContent.classList.add('ml-64');
            sidebarToggle.innerHTML = `
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
            `;
        }
    });
});

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

// Create a lesson element with quick actions toolbar
function createLessonElement(lesson, index) {
    const lessonEl = document.createElement('div');
    lessonEl.className = 'lesson-block';
    lessonEl.setAttribute('data-index', index);
    
    // Calculate position based on day and time
    const lessonDate = new Date(lesson.date);
    const dayOffset = lessonDate.getDay() * (100 / 7);
    const timeOffset = getMinutesSinceMidnight(lesson.time);
    
    // Set positioning styles
    lessonEl.style.left = `${dayOffset}%`;
    lessonEl.style.width = `${100/7 - 2}%`;
    lessonEl.style.top = `${timeOffset}px`;
    lessonEl.style.height = `${lesson.duration}px`;
    
    // Create the main content and quick actions toolbar
    lessonEl.innerHTML = `
        <div class="lesson-content">
            <div class="font-semibold">${lesson.title}</div>
            <div class="text-sm">${lesson.time}</div>
        </div>
        <div class="quick-actions">
            <button class="quick-action-btn" title="Edit" onclick="editLesson(${index})">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
            </button>
            <button class="quick-action-btn" title="Duplicate" onclick="duplicateLesson(${index})">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
                </svg>
            </button>
            <button class="quick-action-btn text-red-500" title="Delete" onclick="deleteLesson(${index})">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
            </button>
        </div>
    `;
    
    // Add click handler for lesson details
    lessonEl.addEventListener('click', (e) => {
        // Only show details if not clicking a button
        if (!e.target.closest('button')) {
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
    const lessonDate = new Date(lesson.date);
    const endTime = addMinutesToTime(lesson.time, lesson.duration);
    
    const detailsHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
             onclick="this.remove()" role="dialog" aria-labelledby="lesson-details-title">
            <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4" onclick="event.stopPropagation()">
                <h2 id="lesson-details-title" class="text-xl font-bold mb-4">${lesson.title}</h2>
                <div class="space-y-3">
                    <div class="flex items-center text-gray-600">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>${formatDate(lessonDate)}</span>
                    </div>
                    <div class="flex items-center text-gray-600">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>${lesson.time} - ${endTime} (${lesson.duration} minutes)</span>
                    </div>
                </div>
                <button class="mt-6 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 w-full" 
                        onclick="this.closest('.fixed').remove()">
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

// Function to duplicate a lesson
function duplicateLesson(index) {
    const originalLesson = lessons[index];
    const newLesson = { ...originalLesson };
    
    // Show a form to adjust the duplicate's date/time
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                <h2 class="text-xl font-bold mb-4">Duplicate Lesson</h2>
                <form id="duplicateForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Date</label>
                        <input type="date" id="duplicateDate" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" 
                               value="${newLesson.date}" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Time</label>
                        <input type="time" id="duplicateTime" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" 
                               value="${newLesson.time}" required>
                    </div>
                    <div class="flex gap-2">
                        <button type="submit" class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
                            Duplicate
                        </button>
                        <button type="button" onclick="this.closest('.fixed').remove()" 
                                class="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Handle form submission
    document.getElementById('duplicateForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        newLesson.date = document.getElementById('duplicateDate').value;
        newLesson.time = document.getElementById('duplicateTime').value;
        
        // Check for overlaps
        if (checkLessonOverlap(newLesson, lessons)) {
            alert('This time slot overlaps with an existing lesson. Please choose a different time.');
            return;
        }
        
        lessons.push(newLesson);
        localStorage.setItem('lessons', JSON.stringify(lessons));
        renderLessons();
        updateStats();
        
        // Show success confetti
        confetti({
            particleCount: 50,
            spread: 45,
            origin: { y: 0.7 }
        });
        
        e.target.closest('.fixed').remove();
    });
}

// Function to edit a lesson
function editLesson(index) {
    const lesson = lessons[index];
    
    // Create edit form modal
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                <h2 class="text-xl font-bold mb-4">Edit Lesson</h2>
                <form id="editForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Lesson Title</label>
                        <input type="text" id="editTitle" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" 
                               value="${lesson.title}" required>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Date</label>
                            <input type="date" id="editDate" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" 
                                   value="${lesson.date}" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Time</label>
                            <input type="time" id="editTime" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" 
                                   value="${lesson.time}" required>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                        <input type="number" id="editDuration" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" 
                               value="${lesson.duration}" required min="15" step="15">
                    </div>
                    <div class="flex gap-2">
                        <button type="submit" class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
                            Save Changes
                        </button>
                        <button type="button" onclick="this.closest('.fixed').remove()" 
                                class="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Handle form submission
    document.getElementById('editForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const updatedLesson = {
            title: document.getElementById('editTitle').value,
            date: document.getElementById('editDate').value,
            time: document.getElementById('editTime').value,
            duration: parseInt(document.getElementById('editDuration').value)
        };
        
        // Check for overlaps (excluding the current lesson)
        if (checkLessonOverlap(updatedLesson, lessons, index)) {
            alert('This time slot overlaps with another lesson. Please choose a different time.');
            return;
        }
        
        // Update the lesson
        lessons[index] = updatedLesson;
        localStorage.setItem('lessons', JSON.stringify(lessons));
        renderLessons();
        updateStats();
        
        // Show success animation
        const lessonEl = document.querySelector(`[data-index="${index}"]`);
        if (lessonEl) {
            lessonEl.classList.add('update-success');
            setTimeout(() => lessonEl.classList.remove('update-success'), 1000);
        }
        
        e.target.closest('.fixed').remove();
    });
}

// Helper function to add minutes to a time string
function addMinutesToTime(timeStr, minutes) {
    const [hours, mins] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
} 