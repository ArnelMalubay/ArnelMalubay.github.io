// ---------------------------------------------------------------------------
// PROJECTS
//
// To add a project:     copy an entry, edit it, done.
// To remove a project:  delete its entry.
// To reorder:           change `order` (lower renders first, within its category).
// To add a category:    add an entry to projectCategories and use its `id`.
// To zoom an image:     set `zoom`. 1 (default) fills the card, above 1 crops in
//                       closer, below 1 shows the whole image. Range 0.25–4.
//
// Categories render in the order listed below.
// ---------------------------------------------------------------------------
const projectCategories = [
  { id: "ai-safety", label: "AI Safety Research" },
  { id: "ai-ml", label: "AI & ML Engineering" },
  { id: "data-api", label: "Data & APIs" },
  { id: "math-viz", label: "Math & Visualization" },
];

const projectsData = [
  {
    id: "multi-hop-subliminal",
    title: "Exploring Multi-Hop Subliminal Learning",
    category: "ai-safety",
    date: "Jun 2026 – Jul 2026",
    context: "BlueDot Impact Project Course",
    description:
      "Investigated whether subliminal learning can survive a chain of distillations, and whether mechanistic measures from the literature — such as empirical activation similarity — correlate with trait expression across hops.",
    image: "assets/multi-hop.png",
    technologies: ["PyTorch", "Transformers", "Distillation", "LoRA"],
    links: [
      { label: "Repo", url: "https://github.com/ArnelMalubay/multi-hop-subliminal-learning", icon: "fab fa-github" },
      { label: "Write-Up", url: "https://drive.google.com/file/d/13bvkn6Ml28VuCPDnYmG7nfzhKHLcxkjM/view", icon: "fas fa-file-lines" },
    ],
    order: 1,
  },
  {
    id: "tara-subliminal-em",
    title: "Subliminal Emergent Misalignment on a Minimal Model Organism",
    category: "ai-safety",
    date: "May 2026 – Jul 2026",
    context: "Technical Alignment Research Accelerator (TARA)",
    description:
      "Replicated the subliminal emergent misalignment pipeline on a minimal rank-1 LoRA model organism. Submitted to the Reproducibility Track of BlackBoxNLP 2026.",
    image: "assets/subliminal-em.png",
    technologies: ["PyTorch", "TransformerLens", "LoRA", "Interpretability"],
    links: [
      { label: "Repo", url: "https://github.com/ArnelMalubay/tara-project-subliminal-em", icon: "fab fa-github" },
      { label: "Write-Up", url: "https://drive.google.com/file/d/1kE-ckxW1m5udZT8225ZcEhvJF0bI9o1K/view?usp=sharing", icon: "fas fa-file-lines" },
    ],
    order: 2,
    zoom: 0.98
  },
  {
    id: "persuasion-linear-bilingual",
    title: "We Are Convinced That Persuasion Is Linear And Bilingual In LLMs",
    category: "ai-safety",
    date: "Jun 2026",
    context: "Apart Global South AI Safety Hackathon",
    description:
      "Investigated whether persuasion is a structured internal property of LLMs rather than an artifact of prompt wording, testing both English and Tagalog setups on Gemma-SEA-LION-v4.5.",
    image: "assets/apart.png",
    technologies: ["TransformerLens", "Gemma", "Activation Analysis", "Multilingual"],
    links: [
      { label: "Repo", url: "https://github.com/ArnelMalubay/apart-global-south-persuasion-project", icon: "fab fa-github" },
      { label: "Write-Up", url: "https://apartresearch.com/project/we-are-convinced-that-persuasion-is-linear-and-bilingual-in-llms-jrkk", icon: "fas fa-file-lines" },
    ],
    order: 3,
    zoom: 0.98
  },
  {
    id: "react-agent",
    title: "ReAct Agentic Chatbot",
    category: "ai-ml",
    description:
      "A ReAct agent with access to document analysis via RAG and web search through Tavily. Serves as a general-purpose chatbot for a range of tasks and queries.",
    image: "assets/chatbot.jpg",
    technologies: ["Python", "LangGraph", "Gradio", "Groq", "Tavily"],
    links: [
      { label: "Try it Out!", url: "https://huggingface.co/spaces/arnel8888/react-agent-ai-assistant", icon: "fas fa-external-link-alt" },
      { label: "GitHub", url: "https://github.com/ArnelMalubay/react-agent-ai-assistant", icon: "fab fa-github" },
    ],
    order: 1,
    zoom: 0.99
  },
  {
    id: "pdf-explainer",
    title: "PDF Explainer using RAG",
    category: "ai-ml",
    description:
      "A Gradio app for uploading PDF documents and asking questions about them using an LLM with retrieval-augmented generation. Built for quick document analysis and information extraction.",
    image: "assets/pdf-explainer.jpg",
    technologies: ["Python", "Gradio", "RAG", "LLM"],
    links: [
      { label: "Try it Out!", url: "https://huggingface.co/spaces/arnel8888/pdf-explainer-using-RAG", icon: "fas fa-external-link-alt" },
      { label: "GitHub", url: "https://github.com/ArnelMalubay/pdf-explainer-using-rag", icon: "fab fa-github" },
    ],
    order: 2,
    zoom: 0.99
  },
  {
    id: "wavelet-cnn",
    title: "Parameter-Efficient CNN Using Wavelet Transforms",
    category: "ai-ml",
    date: "Mar 2024",
    context: "Published in AIP Conference Proceedings",
    description:
      "My senior thesis, incorporating 2D wavelet transforms to build parameter-efficient convolutional neural networks. Published in the American Institute of Physics Conference Proceedings.",
    image: "assets/wavelet-cnn.jpg",
    technologies: ["Python", "Deep Learning", "CNN", "Wavelet Transforms"],
    links: [
      { label: "Read it Here!", url: "https://pubs.aip.org/aip/acp/article-abstract/2895/1/040012/3269703/Parameter-efficient-convolutional-neural-networks?redirectedFrom=fulltext", icon: "fas fa-file-lines" },
      { label: "GitHub", url: "https://github.com/ArnelMalubay/Parameter-Efficient-CNN-Using-Wavelet", icon: "fab fa-github" },
    ],
    order: 3,
    zoom: 0.98
  },
  {
    id: "scoliosis-transfer-learning",
    title: "Scoliosis Identification via Transfer Learning",
    category: "ai-ml",
    date: "Jan 2022",
    context: "NAIST Research Internship",
    description:
      "Project files and related documents from my internship at the Nara Institute of Science and Technology, where I trained a CNN to detect scoliosis in X-ray images using transfer learning.",
    image: "assets/scoliosis.png",
    technologies: ["Python", "Deep Learning", "CNN", "Transfer Learning", "Computer Vision"],
    links: [
      { label: "Read it Here!", url: "https://drive.google.com/file/d/12361MbVaYKruyu9N6lP3nf-zPwxKKzBT/view?usp=sharing", icon: "fas fa-file-lines" },
      { label: "GitHub", url: "https://github.com/ArnelMalubay/NAPI-Internship", icon: "fab fa-github" },
    ],
    order: 4,
    zoom: 0.9
  },
  {
    id: "pasig-api",
    title: "Pasig Full Disclosure API",
    category: "data-api",
    description:
      "A free-to-use REST API for Pasig City government transparency documents — resolutions, ordinances, executive orders, and bids and awards. Built with FastAPI and BeautifulSoup.",
    image: "assets/pasig.png",
    technologies: ["Python", "FastAPI", "BeautifulSoup", "Web Scraping"],
    links: [
      { label: "Try it Out!", url: "https://arnel8888-pasig-full-disclosure-api.hf.space/docs#/", icon: "fas fa-external-link-alt" },
      { label: "GitHub", url: "https://github.com/ArnelMalubay/pasig-full-disclosure-api", icon: "fab fa-github" },
    ],
    order: 1,
    zoom: 0.9
  },
  {
    id: "collatz-visualizer",
    title: "Collatz Conjecture Visualizer",
    category: "math-viz",
    description:
      "A Gradio app that visualizes the paths numbers take under the Collatz rule — an interactive exploration of the conjecture with configurable visualizations.",
    image: "assets/collatz-viz.jpg",
    technologies: ["Python", "Gradio", "Mathematics", "Visualization"],
    links: [
      { label: "Try it Out!", url: "https://huggingface.co/spaces/arnel8888/collatz-branches-visualizer", icon: "fas fa-external-link-alt" },
      { label: "GitHub", url: "https://github.com/ArnelMalubay/collatz-gradio", icon: "fab fa-github" },
    ],
    order: 1,
    zoom: 1
  },
  {
    id: "julia-set-visualizer",
    title: "Julia Set Visualizer",
    category: "math-viz",
    description:
      "A Gradio app that renders Julia sets, with interactive controls for exploring the fractal parameter space.",
    image: "assets/julia-sets.png",
    technologies: ["Python", "Gradio", "Fractals", "Mathematics"],
    links: [
      { label: "Try it Out!", url: "https://huggingface.co/spaces/arnel8888/julia-set-visualizer", icon: "fas fa-external-link-alt" },
      { label: "GitHub", url: "https://github.com/ArnelMalubay/julia-visualizer-using-gradio", icon: "fab fa-github" },
    ],
    order: 2,
    zoom: 0.9
  },
  {
    id: "cellular-automata-markov",
    title: "Cellular Automata & Markov Chain Simulation",
    category: "math-viz",
    description:
      "A land use change simulation built on cellular automata and Markov chains, applying spatial modelling techniques to forecasting.",
    image: "assets/land-change.png",
    technologies: ["Python", "Cellular Automata", "Markov Chains", "Simulation"],
    links: [
      { label: "Read it Here!", url: "https://drive.google.com/file/d/1jpvSGi6sNMaVF8NIaH6awOTyN5Py1f-F/view?usp=sharing", icon: "fas fa-file-lines" },
      { label: "GitHub", url: "https://github.com/ArnelMalubay/Cellular-Automata-And-Markov-Chain-Simulation", icon: "fab fa-github" },
    ],
    order: 3,
  },
];
