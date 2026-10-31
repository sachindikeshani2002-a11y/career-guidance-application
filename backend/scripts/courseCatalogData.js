/**
 * CareerPath University Platform - Course Expansion Catalog
 *
 * Defines the 17 proposed new courses across Engineering, IT & Computing,
 * Business & Management, Finance & Accounting, and Marketing & Media.
 *
 * All skill names match the career catalog normalization logic exactly.
 * Prerequisites are stated in the course description where applicable.
 *
 * Educational Sample Material Notice:
 * These course definitions represent illustrative university curriculum
 * modules designed for academic exploration and skill gap discovery.
 * They do not confer professional chartership or statutory licensing.
 */

const PROPOSED_COURSES = [
  // =========================================================================
  // Field 1: Engineering (7 Courses)
  // =========================================================================
  {
    title: "Computer-Aided Design and Technical Drafting",
    description:
      "Foundations of technical drafting, orthographic projections, and 3D parametric solid modeling. Students learn 2D engineering schematics in AutoCAD and part/assembly modeling in SolidWorks. Recommended for civil and mechanical engineering pathways. No technical prerequisites.",
    level: "Beginner",
    skills: ["AutoCAD", "SolidWorks"],
  },
  {
    title: "Structural Mechanics and Strength of Materials",
    description:
      "Principles of deformable body mechanics, internal shear and bending moment distributions, and material failure criteria. Prerequisites: Basic differential calculus and introductory physics. Ideal for civil and mechanical engineering students.",
    level: "Intermediate",
    skills: ["Structural Analysis", "Materials Science"],
  },
  {
    title: "Thermodynamics and Fluid Mechanics",
    description:
      "Core principles of thermodynamic systems, closed and open control volumes, and fluid flow dynamics. Covers the First Law, ideal gas transformations, hydrostatic pressure, and Bernoulli continuity. Prerequisite: Introductory physics and calculus.",
    level: "Intermediate",
    skills: ["Thermodynamics", "Fluid Mechanics"],
  },
  {
    title: "Electric Circuit Analysis and Microcontroller Interfacing",
    description:
      "Analysis of linear DC and AC electrical circuits, operational amplifiers, and microcontroller peripheral interfacing. Uses MATLAB for transient response simulations and breadboard hardware interfacing for digital I/O. Prerequisite: Basic algebra and physics.",
    level: "Intermediate",
    skills: ["Circuit Design", "Microcontrollers", "MATLAB"],
  },
  {
    title: "Embedded Systems Programming and C",
    description:
      "Low-level firmware development in C for embedded microcontrollers. Covers bitwise memory manipulation, hardware timer interrupts, and serial communication buses (UART/SPI). Prerequisite: Basic programming experience in any language.",
    level: "Intermediate",
    skills: ["Embedded Systems", "C/C++"],
  },
  {
    title: "Digital Logic and Computer Architecture",
    description:
      "Advanced register-transfer level (RTL) design of synchronous digital systems using Verilog/VHDL, pipeline CPU datapaths, memory hierarchies, and instruction set architectures. Prerequisite: Embedded Systems or digital logic fundamentals.",
    level: "Advanced",
    skills: ["Computer Architecture", "VHDL/Verilog"],
  },
  {
    title: "Lean Manufacturing and Process Engineering",
    description:
      "Applied methodologies for industrial process optimization and production quality management. Covers Value Stream Mapping, 5S waste reduction, Statistical Process Control (SPC), and ISO 9001 quality compliance. No formal engineering prerequisites.",
    level: "Intermediate",
    skills: [
      "Lean Manufacturing",
      "Process Optimization",
      "Quality Management (ISO/SPC)",
    ],
  },

  // =========================================================================
  // Field 2: IT & Computing (2 Courses)
  // =========================================================================
  {
    title: "Network Defense and Linux Fundamentals",
    description:
      "Practical administration and security hardening of Linux operating systems alongside defensive TCP/IP network configuration. Covers POSIX permissions, software firewalls, packet analysis, and SSH key management in simulated lab environments. Prerequisite: Basic computer literacy.",
    level: "Intermediate",
    skills: ["Network Security", "Linux"],
  },
  {
    title: "Security Operations and Defensive Incident Handling",
    description:
      "Defensive security operations covering vulnerability triaging, centralized SIEM event log correlation, and structured NIST incident containment procedures. Focuses strictly on defensive posture and log analysis. Prerequisite: Network Defense and Linux Fundamentals.",
    level: "Advanced",
    skills: [
      "Security Information & Event Management (SIEM)",
      "Incident Response",
      "Vulnerability Assessment",
    ],
  },

  // =========================================================================
  // Field 3: Business & Management (3 Courses)
  // =========================================================================
  {
    title: "Agile Methodologies and Project Coordination",
    description:
      "Essential frameworks for modern project coordination. Covers Scrum sprint cadences, Kanban workflows, Work Breakdown Structures (WBS), and task management in tools such as Microsoft Project and Jira. No prerequisites.",
    level: "Beginner",
    skills: [
      "Agile Methodologies",
      "Project Scheduling",
      "Microsoft Project / Jira",
      "Documentation",
      "Cross-Functional Collaboration",
    ],
  },
  {
    title: "Business Analysis and Process Modeling",
    description:
      "Systematic requirements elicitation, Business Process Model and Notation (BPMN) workflow mapping, stakeholder communication, quantitative data interpretation, and risk register tracking. Prerequisite: Basic spreadsheet literacy.",
    level: "Intermediate",
    skills: [
      "Requirements Analysis",
      "Business Process Modeling",
      "Stakeholder Communication",
      "Data Interpretation",
      "Risk Tracking",
    ],
  },
  {
    title: "Human Resources Management Principles",
    description:
      "Core operational foundations of human resource management. Covers structured competency-based recruitment, employment law fundamentals, Human Resource Information Systems (HRIS), and workplace conflict mediation. No prerequisites.",
    level: "Intermediate",
    skills: [
      "Talent Acquisition",
      "Employee Relations",
      "HR Information Systems (HRIS)",
      "Employment Law Fundamentals",
      "Conflict Resolution",
    ],
  },

  // =========================================================================
  // Field 4: Finance & Accounting (3 Courses)
  // =========================================================================
  {
    title: "Financial Accounting and Bookkeeping Principles",
    description:
      "Fundamental principles of double-entry bookkeeping, general ledger accounts, trial balance preparation, and monthly reconciliation workflows in accounting software such as QuickBooks/Xero. No prior financial background required.",
    level: "Beginner",
    skills: [
      "Financial Reporting",
      "Ledger Reconciliation",
      "Accounting Software (QuickBooks/Xero)",
    ],
  },
  {
    title: "Corporate Financial Analysis and Modeling",
    description:
      "Applied corporate valuation and financial analysis. Covers advanced Excel formulas, three-statement dynamic financial modeling, budget variance analysis, and Discounted Cash Flow (DCF) valuation techniques. Prerequisite: Basic accounting or spreadsheet familiarity.",
    level: "Intermediate",
    skills: [
      "Financial Modeling",
      "Advanced Excel",
      "Variance Analysis",
      "Valuation Techniques",
    ],
  },
  {
    title: "Commercial Banking Operations and Credit Analysis",
    description:
      "Operational processes in retail and commercial banking. Covers the 5 C's of credit underwriting, debt service coverage ratios, customer financial advisory, and Anti-Money Laundering / Know Your Customer (AML/KYC) compliance. Prerequisite: Financial Accounting.",
    level: "Intermediate",
    skills: [
      "Retail Banking Operations",
      "Credit Analysis",
      "Risk Assessment",
      "Customer Advisory",
      "AML/KYC Compliance",
    ],
  },

  // =========================================================================
  // Field 5: Marketing & Media (2 Courses)
  // =========================================================================
  {
    title: "Digital Marketing and Web Analytics",
    description:
      "Comprehensive introduction to digital marketing channels and data-driven web analytics. Covers Search Engine Optimization (SEO/SEM), paid social ad targeting, Google Analytics 4 tracking, and landing page A/B split-testing. No prerequisites.",
    level: "Beginner",
    skills: [
      "Google Analytics",
      "SEO/SEM",
      "Social Media Advertising",
      "A/B Testing",
      "Performance Marketing",
    ],
  },
  {
    title: "Content Strategy and Brand Communications",
    description:
      "Strategic planning and execution of digital content. Covers audience persona development, brand positioning hierarchies, content architecture, and editorial calendar management. No prerequisites.",
    level: "Intermediate",
    skills: [
      "Content Architecture",
      "Copywriting",
      "Editorial Strategy",
      "Audience Personas",
      "Brand Positioning",
    ],
  },
];

module.exports = { PROPOSED_COURSES };

