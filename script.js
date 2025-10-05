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
            description: "A simple Gradio app that allows you to upload PDF documents and ask questions about them using an LLM with RAG (Retrieval-Augmented Generation) technology. Perfect for document analysis and information extraction.",
            image: "https://via.placeholder.com/400x200/667eea/ffffff?text=PDF+Explainer",
            redirectUrl: "https://github.com/ArnelMalubay/pdf-explainer-using-rag",
            githubUrl: "https://github.com/ArnelMalubay/pdf-explainer-using-rag",
            technologies: ["Python", "Gradio", "RAG", "LLM"],
            order: 1
        },
        {
            title: "Personal Assistant Chatbot",
            description: "A personal assistant chatbot implemented using Groq and Gradio. Features natural language processing capabilities and can assist with various tasks and queries.",
            image: "https://via.placeholder.com/400x200/764ba2/ffffff?text=Chatbot",
            redirectUrl: "https://github.com/ArnelMalubay/sample-personal-assistant-chatbot",
            githubUrl: "https://github.com/ArnelMalubay/sample-personal-assistant-chatbot",
            technologies: ["Python", "Gradio", "Groq", "NLP"],
            order: 2
        },
        {
            title: "Collatz Conjecture Visualizer",
            description: "A Gradio app that visualizes the paths made by numbers when subjected to the Collatz rule. An interactive exploration of this famous mathematical conjecture with beautiful visualizations.",
            image: "https://via.placeholder.com/400x200/f59e0b/ffffff?text=Collatz+Viz",
            redirectUrl: "https://github.com/ArnelMalubay/collatz-gradio",
            githubUrl: "https://github.com/ArnelMalubay/collatz-gradio",
            technologies: ["Python", "Gradio", "Mathematics", "Visualization"],
            order: 3
        },
        {
            title: "Julia Set Visualizer",
            description: "A Gradio implementation of Julia Set visualizer, previously deployed in Streamlit. Creates stunning fractal visualizations with interactive controls for mathematical exploration.",
            image: "https://via.placeholder.com/400x200/ec4899/ffffff?text=Julia+Sets",
            redirectUrl: "https://github.com/ArnelMalubay/julia-visualizer-using-gradio",
            githubUrl: "https://github.com/ArnelMalubay/julia-visualizer-using-gradio",
            technologies: ["Python", "Gradio", "Fractals", "Mathematics"],
            order: 4
        },
        {
            title: "Parameter-Efficient CNN Using Wavelet",
            description: "My thesis project exploring parameter-efficient Convolutional Neural Networks using Wavelet Transforms. Includes comprehensive notebooks and research findings on optimizing neural network architectures.",
            image: "https://via.placeholder.com/400x200/10b981/ffffff?text=Wavelet+CNN",
            redirectUrl: "https://github.com/ArnelMalubay/Parameter-Efficient-CNN-Using-Wavelet",
            githubUrl: "https://github.com/ArnelMalubay/Parameter-Efficient-CNN-Using-Wavelet",
            technologies: ["Python", "Deep Learning", "CNN", "Wavelet Transforms"],
            order: 5
        },
        {
            title: "Cellular Automata & Markov Chain Simulation",
            description: "A comprehensive land use change simulation project using cellular automata and Markov chains. Demonstrates advanced modeling techniques for spatial analysis and prediction.",
            image: "https://via.placeholder.com/400x200/8b5cf6/ffffff?text=Cellular+Automata",
            redirectUrl: "https://github.com/ArnelMalubay/Cellular-Automata-And-Markov-Chain-Simulation",
            githubUrl: "https://github.com/ArnelMalubay/Cellular-Automata-And-Markov-Chain-Simulation",
            technologies: ["Python", "Cellular Automata", "Markov Chains", "Simulation"],
            order: 6
        }
    ];

    // Customizable Project Function
    // This function allows you to easily add new projects with four main parameters
    function createProjectCard(projectTitle, redirectUrl, image, description, additionalData = {}) {
        const project = {
            title: projectTitle,
            description: description,
            image: image,
            redirectUrl: redirectUrl,
            githubUrl: additionalData.githubUrl || redirectUrl,
            technologies: additionalData.technologies || [],
            order: additionalData.order || projectsData.length + 1
        };
        
        return project;
    }

    // Function to render a single project card
    function renderProjectCard(project) {
        return `
            <div class="project-card" data-order="${project.order}">
                <div class="project-image">
                    ${project.image ? `<img src="${project.image}" alt="${project.title}">` : ''}
                    <div class="placeholder-icon">
                        <i class="fas fa-code"></i>
                    </div>
                </div>
                <div class="project-content">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                    <div class="project-links">
                        <a href="${project.redirectUrl}" target="_blank" class="project-link">
                            <i class="fas fa-external-link-alt"></i>
                            View Project
                        </a>
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

    // Project sorting functionality
    function sortProjects(sortType) {
        let sortedProjects = [...projectsData];
        
        switch(sortType) {
            case 'alphabetical':
                sortedProjects.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'recent':
                sortedProjects.sort((a, b) => b.order - a.order);
                break;
            case 'default':
            default:
                sortedProjects.sort((a, b) => a.order - b.order);
                break;
        }
        
        renderProjects(sortedProjects);
    }

    // Event listeners for sorting buttons
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Sort projects based on button data
            const sortType = this.getAttribute('data-sort');
            sortProjects(sortType);
        });
    });

    // Initialize projects on page load
    renderProjects(projectsData);

    // Add new project function (for easy customization)
    window.addProject = function(title, redirectUrl, image, description, additionalData = {}) {
        const newProject = createProjectCard(title, redirectUrl, image, description, additionalData);
        projectsData.push(newProject);
        renderProjects(projectsData);
    };

    // Update project order function
    window.updateProjectOrder = function(title, newOrder) {
        const project = projectsData.find(p => p.title === title);
        if (project) {
            project.order = newOrder;
            renderProjects(projectsData);
        }
    };

    // Remove project function
    window.removeProject = function(title) {
        const index = projectsData.findIndex(p => p.title === title);
        if (index > -1) {
            projectsData.splice(index, 1);
            renderProjects(projectsData);
        }
    };

    // Resume link placeholder
    const resumeLink = document.getElementById('resume-link');
    if (resumeLink) {
        resumeLink.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Please update the resume link in the HTML file with your actual resume URL.');
        });
    }

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
    console.log('- Current projects:', projectsData);
});

// Example usage for adding a new project:
/*
addProject(
    "My New Project",
    "https://github.com/ArnelMalubay/my-new-project",
    "https://via.placeholder.com/400x200/2563eb/ffffff?text=New+Project",
    "Description of my amazing new project that showcases my skills.",
    {
        technologies: ["Python", "Machine Learning", "Data Science"],
        order: 7
    }
);
*/
