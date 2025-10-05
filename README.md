# Arnel Malubay - Data Scientist Portfolio

Welcome to my professional portfolio website! This repository hosts my personal portfolio showcasing my work as a Data Scientist specializing in Health Informatics, AI Research, and Computational Mathematics. I'm a Google Cloud Certified Associate Cloud Engineer and Summa Cum Laude graduate in Mathematics from ADMU.

## 🚀 Live Website

Visit the live portfolio at: [https://arnelmalubay.github.io](https://arnelmalubay.github.io)

## 🎯 About This Portfolio

This is a responsive, modern portfolio website built with HTML, CSS, and JavaScript. It features:

- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Customizable Project Showcase**: Easy-to-use function for adding new projects with flexible button text
- **Backend Project Ordering**: Projects are automatically ordered by the "order" parameter
- **Professional Introduction**: Highlighting my background in health informatics and AI research
- **Certification Links**: Direct links to verified credentials (Google Cloud Certified)
- **Collaboration Invitation**: Clean, side-by-side layout for contact information

## 🛠️ Features

### Project Management
- **Customizable Project Function**: Easily add projects with title, URL, image, description, and custom button text
- **Backend Ordering**: Projects automatically sort by the "order" parameter for easy management
- **Technology Tags**: Visual representation of technologies used in each project
- **Multiple Link Types**: Project demo links, GitHub repository links, and customizable button text
- **Flexible Button Text**: Different button texts for different project types (e.g., "Try it Out!", "Read it Here!")

### Responsive Design
- **Mobile-First Approach**: Optimized for all screen sizes
- **Smooth Animations**: CSS transitions and JavaScript animations
- **Modern UI/UX**: Clean, professional design with intuitive navigation
- **Accessibility**: Semantic HTML and proper contrast ratios

### Content Sections
- **Hero Section**: Eye-catching introduction with certification links and call-to-action buttons
- **About Section**: Professional background, updated technical skills, and resume download
- **Projects Section**: Two-column layout showcasing work with customizable button text
- **Contact Section**: Side-by-side layout with collaboration message and contact information

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
    "assets/project-image.jpg",
    "Project description explaining what it does and technologies used.",
    {
        technologies: ["Python", "Machine Learning", "Data Science"],
        order: 7,
        githubUrl: "https://github.com/username/repo",
        buttonText: "Try it Out!"  // Customizable button text
    }
);
```

### Button Text Examples

Customize the button text based on your project type:

```javascript
// For interactive applications
buttonText: "Try it Out!"

// For research papers and articles
buttonText: "Read it Here!"

// For live demonstrations
buttonText: "View Demo"

// For downloadable content
buttonText: "Download"

// For documentation
buttonText: "Learn More"

// For websites
buttonText: "Live Site"
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
- **HTML5**: Semantic markup and accessibility features with SEO optimization
- **CSS3**: Flexbox, Grid, animations, and responsive design
- **JavaScript (ES6+)**: Modern JavaScript with modular functions and project management
- **Font Awesome**: Icons for enhanced visual appeal
- **Google Fonts**: Inter font family for clean typography
- **Assets Management**: Local image hosting for projects and profile photos

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

1. **PDF Explainer using RAG** - Document analysis with RAG technology (Hugging Face Spaces)
2. **Personal Assistant Chatbot** - NLP-powered assistant using Groq (Hugging Face Spaces)
3. **Collatz Conjecture Visualizer** - Mathematical visualization tool (Hugging Face Spaces)
4. **Julia Set Visualizer** - Fractal visualization with Gradio (Hugging Face Spaces)
5. **Parameter-Efficient CNN Using Wavelet** - Published research paper in AIP Conference Proceedings
6. **Cellular Automata & Markov Chain Simulation** - Comprehensive land use modeling project

## 📞 Contact & Collaboration

I'm always interested in discussing:
- Data Science opportunities
- Research collaborations
- AI and machine learning projects
- Health informatics applications

**Contact Methods:**
- GitHub: [@ArnelMalubay](https://github.com/ArnelMalubay)
- Email: iamarnelmalubay@gmail.com
- LinkedIn: [Arnel Malubay](https://www.linkedin.com/in/arnel-malubay-7259341aa/)
- Resume: [Download Resume](https://drive.google.com/file/d/1-XCdGrW4yedDTamhgbrTItP6eXYF5TmW/view?usp=sharing)

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
