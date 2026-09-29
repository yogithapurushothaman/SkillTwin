"""
Skill Dictionary & Normalization Service (FR-6, FR-9, AI-2)
Predefined skill dictionary with strict canonical naming and aliases mapping.
Terms not in the dictionary are discarded or flagged, never added automatically.
"""
from typing import Dict, Optional, Tuple, List
from models.schemas import SkillCategory, ProficiencyBand

# Canonical Skill Dictionary
CANONICAL_SKILLS: Dict[str, Dict[str, str]] = {
    # Technical
    "Java": {"category": SkillCategory.TECHNICAL, "description": "Core Java, OOP, Collections, JVM principles"},
    "Python": {"category": SkillCategory.TECHNICAL, "description": "Python syntax, standard library, scripting, data handling"},
    "DSA": {"category": SkillCategory.TECHNICAL, "description": "Data Structures & Algorithms (Arrays, Trees, Graphs, Sorting, Searching)"},
    "SQL": {"category": SkillCategory.TECHNICAL, "description": "Relational database querying, joins, indexing, normalization"},
    "Git": {"category": SkillCategory.TECHNICAL, "description": "Version control, branching, merging, pull requests, collaboration"},
    "OOP": {"category": SkillCategory.TECHNICAL, "description": "Object-Oriented Programming (Inheritance, Polymorphism, Encapsulation, Abstraction)"},
    "JavaScript": {"category": SkillCategory.TECHNICAL, "description": "Modern JS, ES6+, closures, async/promises, DOM"},
    "TypeScript": {"category": SkillCategory.TECHNICAL, "description": "Static typing, generics, interfaces, TS config"},
    "React": {"category": SkillCategory.TECHNICAL, "description": "Component lifecycle, hooks, state management, virtual DOM"},
    "Node.js": {"category": SkillCategory.TECHNICAL, "description": "Server-side JavaScript, event loop, Express, REST APIs"},
    "HTML/CSS": {"category": SkillCategory.TECHNICAL, "description": "Semantic markup, modern CSS layouts, responsive design, Flexbox/Grid"},
    "Docker": {"category": SkillCategory.TECHNICAL, "description": "Containerization, Dockerfile creation, image building, docker-compose"},
    "REST API": {"category": SkillCategory.TECHNICAL, "description": "RESTful service architecture, HTTP verbs, status codes, payload design"},
    
    # Problem Solving
    "Problem Solving": {"category": SkillCategory.PROBLEM_SOLVING, "description": "Analytical problem breakdown, edge-case analysis, optimization"},
    "Algorithmic Thinking": {"category": SkillCategory.PROBLEM_SOLVING, "description": "Complexity analysis, space-time tradeoffs, greedy and dynamic approaches"},
    "System Design": {"category": SkillCategory.PROBLEM_SOLVING, "description": "Architectural decomposition, scalability, caching, load balancing"},
    "Debugging": {"category": SkillCategory.PROBLEM_SOLVING, "description": "Root cause analysis, stack trace inspection, defensive coding"},
    "Optimization": {"category": SkillCategory.PROBLEM_SOLVING, "description": "Code efficiency, memory management, query optimization"},

    # Soft Skills
    "Communication": {"category": SkillCategory.SOFT_SKILLS, "description": "Verbal and written clarity, technical explanation, active listening"},
    "Teamwork": {"category": SkillCategory.SOFT_SKILLS, "description": "Collaborative problem solving, code reviews, empathy, shared goals"},
    "Leadership": {"category": SkillCategory.SOFT_SKILLS, "description": "Initiative, mentoring peers, project ownership, decision making"},
    "Adaptability": {"category": SkillCategory.SOFT_SKILLS, "description": "Quick learning, handling changing requirements, resilience under pressure"},
    "Professionalism": {"category": SkillCategory.SOFT_SKILLS, "description": "Work ethics, deadline reliability, accountability, workplace conduct"},
    "Time Management": {"category": SkillCategory.SOFT_SKILLS, "description": "Prioritization, milestone estimation, sprint discipline"}
}

# Alias Map for Normalization
SKILL_ALIASES: Dict[str, str] = {
    # Java
    "java": "Java",
    "core java": "Java",
    "java 8": "Java",
    "java 11": "Java",
    "java 17": "Java",
    "java/j2ee": "Java",
    "j2ee": "Java",
    
    # Python
    "python": "Python",
    "python 3": "Python",
    "python3": "Python",
    "py": "Python",
    
    # DSA
    "dsa": "DSA",
    "data structures": "DSA",
    "algorithms": "DSA",
    "data structures and algorithms": "DSA",
    "data structures & algorithms": "DSA",
    "ds & algo": "DSA",
    "competitive programming": "DSA",
    
    # SQL
    "sql": "SQL",
    "mysql": "SQL",
    "postgresql": "SQL",
    "postgres": "SQL",
    "rdbms": "SQL",
    "sqlite": "SQL",
    "pl/sql": "SQL",
    "database queries": "SQL",
    "relational database": "SQL",
    
    # Git
    "git": "Git",
    "github": "Git",
    "gitlab": "Git",
    "git / github": "Git",
    "version control": "Git",
    "vcs": "Git",
    
    # OOP
    "oop": "OOP",
    "oops": "OOP",
    "object oriented programming": "OOP",
    "object-oriented programming": "OOP",
    "object oriented design": "OOP",
    "ood": "OOP",
    
    # JavaScript & TypeScript
    "javascript": "JavaScript",
    "js": "JavaScript",
    "es6": "JavaScript",
    "ecmascript": "JavaScript",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    
    # React & Frontend
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "nextjs": "React",
    "html": "HTML/CSS",
    "css": "HTML/CSS",
    "html5": "HTML/CSS",
    "css3": "HTML/CSS",
    "html/css": "HTML/CSS",
    "html and css": "HTML/CSS",
    
    # Backend & DevOps
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "node": "Node.js",
    "express": "Node.js",
    "docker": "Docker",
    "containerization": "Docker",
    "rest": "REST API",
    "rest api": "REST API",
    "restful api": "REST API",
    "restful apis": "REST API",
    "web apis": "REST API",
    
    # Problem Solving
    "problem solving": "Problem Solving",
    "problem-solving": "Problem Solving",
    "analytical thinking": "Problem Solving",
    "algorithmic thinking": "Algorithmic Thinking",
    "algorithms design": "Algorithmic Thinking",
    "system design": "System Design",
    "high level design": "System Design",
    "debugging": "Debugging",
    "troubleshooting": "Debugging",
    "optimization": "Optimization",
    "performance tuning": "Optimization",
    
    # Soft Skills
    "communication": "Communication",
    "communication skills": "Communication",
    "verbal communication": "Communication",
    "written communication": "Communication",
    "teamwork": "Teamwork",
    "team player": "Teamwork",
    "collaboration": "Teamwork",
    "leadership": "Leadership",
    "team lead": "Leadership",
    "adaptability": "Adaptability",
    "flexible": "Adaptability",
    "quick learner": "Adaptability",
    "professionalism": "Professionalism",
    "work ethic": "Professionalism",
    "time management": "Time Management",
    "organization": "Time Management"
}

def normalize_skill(term: str) -> Optional[Tuple[str, SkillCategory]]:
    """
    Normalizes raw term against predefined dictionary.
    Returns (canonical_name, category) if matched, else None.
    Unknown terms are NEVER added automatically (per AI-2 and FR-6).
    """
    clean_term = term.strip().lower()
    
    # Direct alias lookup
    if clean_term in SKILL_ALIASES:
        canonical = SKILL_ALIASES[clean_term]
        category = CANONICAL_SKILLS[canonical]["category"]
        return canonical, category
    
    # Case-insensitive canonical match
    for canonical, details in CANONICAL_SKILLS.items():
        if clean_term == canonical.lower():
            return canonical, details["category"]
            
    return None

def score_to_proficiency(score: float) -> ProficiencyBand:
    """
    FR-9: Convert assessment scores to proficiency levels via fixed thresholds
    < 50: Basic
    50 - 74: Intermediate
    >= 75: Advanced
    """
    if score >= 75.0:
        return ProficiencyBand.ADVANCED
    elif score >= 50.0:
        return ProficiencyBand.INTERMEDIATE
    return ProficiencyBand.BASIC

def proficiency_to_provisional_score(band: ProficiencyBand) -> float:
    """
    Claimed level maps to a provisional score (marked self-declared):
    Basic -> 40
    Intermediate -> 60
    Advanced -> 80
    """
    if band == ProficiencyBand.ADVANCED:
        return 80.0
    elif band == ProficiencyBand.INTERMEDIATE:
        return 60.0
    return 40.0
