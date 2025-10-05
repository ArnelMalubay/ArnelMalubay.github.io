# Arnel Malubay - Data Scientist Portfolio

Welcome to my professional portfolio website! This repository hosts my personal portfolio showcasing my work as a Data Scientist specializing in Health Informatics, AI Research, and Computational Mathematics.

## 🚀 Live Website

Visit the live portfolio at: [https://arnelmalubay.github.io](https://arnelmalubay.github.io)

## 🎯 About This Portfolio

This is a responsive, modern portfolio website built with HTML, CSS, and JavaScript. It features:

- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Customizable Project Showcase**: Easy-to-use function for adding new projects
- **Interactive Project Ordering**: Sort projects by default order, alphabetical, or most recent
- **Professional Introduction**: Highlighting my background in health informatics and AI research
- **Collaboration Invitation**: Clear call-to-action for potential employers and collaborators

## 🛠️ Features

### Project Management
- **Four-Parameter Project Function**: Easily add projects with title, URL, image, and description
- **Flexible Ordering**: Drag-and-drop style ordering system
- **Technology Tags**: Visual representation of technologies used in each project
- **Direct Links**: Both project demo links and GitHub repository links

### Responsive Design
- **Mobile-First Approach**: Optimized for all screen sizes
- **Smooth Animations**: CSS transitions and JavaScript animations
- **Modern UI/UX**: Clean, professional design with intuitive navigation
- **Accessibility**: Semantic HTML and proper contrast ratios

### Content Sections
- **Hero Section**: Eye-catching introduction with call-to-action buttons
- **About Section**: Professional background and technical skills
- **Projects Section**: Interactive showcase of my work
- **Contact Section**: Multiple ways to get in touch and collaborate

## 📁 Project Structure

```
├── index.html          # Main HTML structure
├── styles.css          # Responsive CSS styling
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## 🎨 Customization Guide

### Adding New Projects

Use the built-in `addProject()` function in the browser console or modify the `projectsData` array in `script.js`:

```javascript
addProject(
    "Project Title",
    "https://project-url.com",
    "https://image-url.com/project-image.jpg",
    "Project description explaining what it does and technologies used.",
    {
        technologies: ["Python", "Machine Learning", "Data Science"],
        order: 7,
        githubUrl: "https://github.com/username/repo"
    }
);
```

### Updating Project Order

```javascript
updateProjectOrder("Project Title", newOrderNumber);
```

### Removing Projects

```javascript
removeProject("Project Title");
```

## 🔧 Technical Details

### Technologies Used
- **HTML5**: Semantic markup and accessibility features
- **CSS3**: Flexbox, Grid, animations, and responsive design
- **JavaScript (ES6+)**: Modern JavaScript with modular functions
- **Font Awesome**: Icons for enhanced visual appeal
- **Google Fonts**: Inter font family for clean typography

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📱 Responsive Breakpoints

- **Desktop**: 1200px and above
- **Tablet**: 768px to 1199px
- **Mobile**: Below 768px
- **Small Mobile**: Below 480px

## 🎯 Current Projects Showcased

1. **PDF Explainer using RAG** - Document analysis with RAG technology
2. **Personal Assistant Chatbot** - NLP-powered assistant using Groq
3. **Collatz Conjecture Visualizer** - Mathematical visualization tool
4. **Julia Set Visualizer** - Fractal visualization with Gradio
5. **Parameter-Efficient CNN Using Wavelet** - Deep learning research
6. **Cellular Automata & Markov Chain Simulation** - Land use modeling

## 📞 Contact & Collaboration

I'm always interested in discussing:
- Data Science opportunities
- Research collaborations
- AI and machine learning projects
- Health informatics applications

**Contact Methods:**
- GitHub: [@ArnelMalubay](https://github.com/ArnelMalubay)
- Email: [Update with your email]
- LinkedIn: [Update with your LinkedIn]

## 🚀 Deployment

This portfolio is automatically deployed to GitHub Pages when changes are pushed to the main branch. Simply:

1. Make your changes to the files
2. Commit and push to the main branch
3. GitHub Pages will automatically update the live site

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

While this is my personal portfolio, I welcome feedback and suggestions for improvements. Feel free to open an issue or submit a pull request if you have ideas for enhancements.

---

**Built with ❤️ by Arnel Malubay**
