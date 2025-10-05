// Portfolio JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Project Data Configuration
    // This is where you can easily customize your projects
    const projectsData = [
        {
            title: "PDF Explainer using RAG",
            description: "A simple Gradio app that allows you to upload PDF documents and ask questions about them using an LLM with RAG (Retrieval-Augmented Generation) technology. Perfect for simple document analysis and information extraction.",
            image: "assets/pdf-explainer.jpg",
            redirectUrl: "https://huggingface.co/spaces/arnel8888/pdf-explainer-using-RAG",
            githubUrl: "https://github.com/ArnelMalubay/pdf-explainer-using-rag",
            buttonText : "Try it Out!",
            technologies: ["Python", "Gradio", "RAG", "LLM"],
            order: 1
        },
        {
            title: "Personal Assistant Chatbot",
            description: "A personal assistant chatbot implemented using Groq and Gradio. Features natural language processing capabilities and can assist with various tasks and queries.",
            image: "assets/chatbot.jpg",
            redirectUrl: "https://huggingface.co/spaces/arnel8888/sample-personal-assistant-chatbot",
            githubUrl: "https://github.com/ArnelMalubay/sample-personal-assistant-chatbot",
            buttonText : "Try it Out!",
            technologies: ["Python", "Gradio", "Groq", "NLP"],
            order: 2
        },
        {
            title: "Collatz Conjecture Visualizer",
            description: "A Gradio app that visualizes the paths made by numbers when subjected to the Collatz rule. An interactive exploration of this famous mathematical conjecture with configurable visualizations.",
            image: "assets/collatz-viz.jpg",
            redirectUrl: "https://huggingface.co/spaces/arnel8888/collatz-branches-visualizer",
            githubUrl: "https://github.com/ArnelMalubay/collatz-gradio",
            buttonText : "Try it Out!",
            technologies: ["Python", "Gradio", "Mathematics", "Visualization"],
            order: 3
        },
        {
            title: "Julia Set Visualizer",
            description: "A Gradio app that visualizes Julia sets. Creates stunning fractal visualizations with interactive controls for mathematical exploration.",
            image: "assets/julia-sets.png",
            redirectUrl: "https://huggingface.co/spaces/arnel8888/julia-set-visualizer",
            githubUrl: "https://github.com/ArnelMalubay/julia-visualizer-using-gradio",
            buttonText : "Try it Out!",
            technologies: ["Python", "Gradio", "Fractals", "Mathematics"],
            order: 4
        },
        {
            title: "Parameter-Efficient CNN Using Wavelet Transforms",
            description: "My thesis project that incorporates 2D wavelet transforms to create parameter-efficient Convolutional Neural Networks. This was eventually published in the American Institute of Physics Conference Proceedings.",
            image: "assets/wavelet-cnn.jpg",
            redirectUrl: "https://pubs.aip.org/aip/acp/article-abstract/2895/1/040012/3269703/Parameter-efficient-convolutional-neural-networks?redirectedFrom=fulltext",
            githubUrl: "https://github.com/ArnelMalubay/Parameter-Efficient-CNN-Using-Wavelet",
            buttonText : "Read it Here!",
            technologies: ["Python", "Deep Learning", "CNN", "Wavelet Transforms"],
            order: 5
        },
        {
            title: "Cellular Automata & Markov Chain Simulation",
            description: "A comprehensive land use change simulation project using cellular automata and Markov chains. Demonstrates advanced modeling techniques for spatial analysis and forecasting.",
            image: "assets/cellular-automata.png",
            redirectUrl: "https://drive.google.com/file/d/1jpvSGi6sNMaVF8NIaH6awOTyN5Py1f-F/view?usp=sharing",
            githubUrl: "https://github.com/ArnelMalubay/Cellular-Automata-And-Markov-Chain-Simulation",
            buttonText : "Read it Here!",
            technologies: ["Python", "Cellular Automata", "Markov Chains", "Simulation"],
            order: 6
        }
    ];

    // Customizable Project Function
    // This function allows you to easily add new projects with customizable parameters
    function createProjectCard(projectTitle, redirectUrl, image, description, additionalData = {}) {
        const project = {
            title: projectTitle,
            description: description,
            image: image,
            redirectUrl: redirectUrl,
            githubUrl: additionalData.githubUrl || redirectUrl,
            technologies: additionalData.technologies || [],
            order: additionalData.order || projectsData.length + 1,
            buttonText: additionalData.buttonText || "Try it out!"
        };
        
        return project;
    }

    // Function to render a single project card
    function renderProjectCard(project) {
        const projectLink = project.redirectUrl && project.redirectUrl.trim() !== '' 
            ? `<a href="${project.redirectUrl}" target="_blank" class="project-link">
                <i class="fas fa-external-link-alt"></i>
                ${project.buttonText}
              </a>`
            : '';

        return `
            <div class="project-card" data-order="${project.order}">
                <div class="project-image">
                    ${project.image ? `<img src="${project.image}" alt="${project.title}">` : '<div class="placeholder-icon"><i class="fas fa-code"></i></div>'}
                </div>
                <div class="project-content">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                    <div class="project-links">
                        ${projectLink}
                        <a href="${project.githubUrl}" target="_blank" class="project-link github">
                            <i class="fab fa-github"></i>
                            GitHub
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    // Function to render all projects
    function renderProjects(projects) {
        const projectsGrid = document.getElementById('projects-grid');
        if (!projectsGrid) return;

        projectsGrid.innerHTML = projects.map(project => renderProjectCard(project)).join('');
    }

    // Function to sort projects by order (backend ordering)
    function sortProjectsByOrder() {
        const sortedProjects = [...projectsData].sort((a, b) => a.order - b.order);
        renderProjects(sortedProjects);
    }

    // Initialize projects on page load with proper ordering
    sortProjectsByOrder();

    // Set dynamic year in footer
    const currentYear = new Date().getFullYear();
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = currentYear;
    }

    // Add new project function (for easy customization)
    window.addProject = function(title, redirectUrl, image, description, additionalData = {}) {
        const newProject = createProjectCard(title, redirectUrl, image, description, additionalData);
        projectsData.push(newProject);
        sortProjectsByOrder();
    };

    // Update project order function
    window.updateProjectOrder = function(title, newOrder) {
        const project = projectsData.find(p => p.title === title);
        if (project) {
            project.order = newOrder;
            sortProjectsByOrder();
        }
    };

    // Remove project function
    window.removeProject = function(title) {
        const index = projectsData.findIndex(p => p.title === title);
        if (index > -1) {
            projectsData.splice(index, 1);
            sortProjectsByOrder();
        }
    };


    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe project cards for animations
    setTimeout(() => {
        document.querySelectorAll('.project-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    }, 100);

    // Console log for easy project management
    console.log('Portfolio loaded successfully!');
    console.log('Available functions:');
    console.log('- addProject(title, redirectUrl, image, description, additionalData)');
    console.log('- updateProjectOrder(title, newOrder)');
    console.log('- removeProject(title)');
    console.log('- Projects are automatically ordered by the "order" parameter');
    console.log('- Current projects:', projectsData);
});

// Example usage for adding a new project:
/*
addProject(
    "My New Project",
    "https://github.com/ArnelMalubay/my-new-project",
    "assets/new-project.png",
    "Description of my amazing new project that showcases my skills.",
    {
        technologies: ["Python", "Machine Learning", "Data Science"],
        order: 7,
        buttonText: "Try it out!"  // Customizable button text
    }
);

// Examples of different button texts for different project types:
// - "Try it out!" (for interactive apps)
// - "Read it here!" (for papers/articles)
// - "View Demo" (for demos)
// - "Download" (for downloadable files)
// - "Learn More" (for documentation)
// - "Live Site" (for websites)
*/
