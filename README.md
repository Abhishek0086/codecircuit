# Lesson Timeline Tracker

A dynamic, interactive web application for managing and scheduling lessons with an intuitive drag-and-drop interface. This tool helps educators and instructors manage their lesson schedules efficiently.

## Development Roadmap

### Phase 1 (MVP) - Current
- ✅ Basic weekly timeline view
- ✅ Add/delete lessons
- ✅ Drag-and-drop rescheduling
- ✅ Local storage persistence
- ✅ Week navigation

### Phase 2 (Enhanced Features)
- [ ] Lesson categories/tags with color coding
- [ ] Lesson details modal
- [ ] Lesson duration validation (prevent overlaps)
- [ ] Responsive design improvements
- [ ] Toast notifications for actions

### Phase 3 (Advanced Features)
- [ ] Recurring lessons
- [ ] Multi-week view
- [ ] Export/import lesson data
- [ ] User authentication
- [ ] Backend integration

## Features

- **Interactive Timeline View**: Visual weekly calendar with 24-hour time slots
- **Drag-and-Drop Scheduling**: Easily reschedule lessons by dragging them to new time slots
- **Responsive Design**: Works seamlessly across different screen sizes
- **Local Storage**: Persists lesson data in the browser
- **Week Navigation**: Navigate between weeks to view and manage future or past lessons

## Technologies Used

- HTML5
- CSS3 with Tailwind CSS
- Vanilla JavaScript
- Local Storage API for data persistence

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A local development server (Python's `http.server` or any other static file server)

### Installation

1. Clone the repository:
   ```bash
   git clone [your-repository-url]
   cd lesson-tracker
   ```

2. Start a local server:
   ```bash
   # Using Python (Python 3)
   python -m http.server 8000
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

## Usage

### Adding a New Lesson

1. Fill in the lesson details in the form:
   - Lesson Title
   - Date
   - Time
   - Duration (in minutes)
2. Click "Add Lesson" to create the lesson

### Managing Lessons

- **Reschedule**: Drag and drop lessons to new time slots
- **Delete**: Click the '×' button on any lesson to remove it
- **Navigate**: Use the "Previous Week" and "Next Week" buttons to view different weeks

## Project Structure

```
lesson-tracker/
├── index.html      # Main HTML structure
├── styles.css      # Custom styles and animations
├── script.js       # Application logic and interactions
└── README.md       # Project documentation
```

## Future Enhancements

- [ ] Add lesson categories/tags
- [ ] Implement recurring lessons
- [ ] Add multi-week view
- [ ] Export/import lesson data
- [ ] Add user authentication
- [ ] Backend integration for data persistence

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Tailwind CSS for the utility-first CSS framework
- Modern browsers' Drag and Drop API 