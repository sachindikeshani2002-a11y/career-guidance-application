/**
 * CareerPath University Platform - Career Catalog Data
 *
 * Illustrative educational guidance catalog spanning 5 fields:
 * 1. Engineering (Civil, Mechanical, Electrical & Electronic, Computer, Manufacturing)
 * 2. IT & Computing (Software Developer, Data Analyst, Cybersecurity Analyst)
 * 3. Business & Management (Business Analyst, Project Coordinator, HR Executive)
 * 4. Finance & Accounting (Accountant, Financial Analyst, Banking Officer)
 * 5. Marketing & Media (Digital Marketing Executive, Content Strategist, Marketing Executive)
 *
 * NOTE: All career pathways, required skills, and qualification guidance in this catalog
 * are provided solely as illustrative educational guidance. They do not constitute official
 * university degree curriculum, professional engineering licenses, statutory accreditation,
 * or employment guarantees.
 */

const CAREER_CATALOG = [
  // ==========================================
  // FIELD 1: ENGINEERING (MANDATORY)
  // ==========================================
  {
    title: "Civil Engineer",
    field: "Engineering",
    description:
      "Plan, design, and oversee the construction and maintenance of building structures, transportation infrastructure, and water supply systems.",
    responsibilities: [
      "Design structural and civil infrastructure components adhering to safety codes and environmental standards.",
      "Perform structural calculations, geotechnical assessments, and hydraulic modeling.",
      "Prepare detailed engineering drawings, specifications, and bill of quantities.",
      "Supervise construction site progress and inspect material testing results.",
    ],
    skills: [
      "AutoCAD",
      "Structural Analysis",
      "Geotechnical Engineering",
      "Project Planning",
      "Surveying",
    ],
    educationGuidance:
      "Typical entry requires an accredited bachelor's degree in Civil Engineering (BSc/BEng). Professional practice as a chartered or registered engineer requires an accredited university curriculum followed by supervised professional development and statutory licensure.",
    disclaimer:
      "Completing short online courses or matching introductory competencies provides foundational conceptual understanding, but does not qualify an individual to practise as a professional engineer. Statutory licensure requires an accredited university degree and formal engineering council registration.",
  },
  {
    title: "Mechanical Engineer",
    field: "Engineering",
    description:
      "Design, analyze, manufacture, and maintain mechanical systems, thermal equipment, and machinery across various industries.",
    responsibilities: [
      "Develop CAD models, technical drawings, and specifications for mechanical components and machinery.",
      "Perform stress analysis, finite element analysis (FEA), and thermal-fluid simulations.",
      "Select suitable engineering materials based on strength, fatigue, and environmental tolerances.",
      "Conduct prototype testing, diagnose mechanical failures, and implement design refinements.",
    ],
    skills: [
      "SolidWorks",
      "Thermodynamics",
      "Finite Element Analysis (FEA)",
      "Materials Science",
      "Fluid Mechanics",
    ],
    educationGuidance:
      "Typical entry requires an accredited bachelor's degree in Mechanical Engineering (BSc/BEng). Professional licensure requires accredited academic credentials followed by formal postgraduate practical training and assessment.",
    disclaimer:
      "Completing short online courses or matching introductory competencies provides foundational conceptual understanding, but does not qualify an individual to practise as a professional engineer. Statutory licensure requires an accredited university degree and formal engineering council registration.",
  },
  {
    title: "Electrical and Electronic Engineer",
    field: "Engineering",
    description:
      "Design, develop, test, and supervise the deployment of electrical power systems, electronic circuits, and control instrumentation.",
    responsibilities: [
      "Design schematic layouts for power distribution, electrical installations, and electronic circuits.",
      "Simulate circuit performance and transient behavior using industry-standard modeling software.",
      "Test and troubleshoot embedded hardware, microcontrollers, and electrical control panels.",
      "Ensure electrical installations adhere to national electrical codes, grid regulations, and electromagnetic safety standards.",
    ],
    skills: [
      "Circuit Design",
      "Power Systems",
      "MATLAB",
      "Microcontrollers",
      "Electrical Safety Standards",
    ],
    educationGuidance:
      "Typical entry requires an accredited bachelor's degree in Electrical, Electronic, or Electrical & Electronic Engineering. Formal engineering practice requires accreditation by recognized engineering councils and certified board examinations.",
    disclaimer:
      "Completing short online courses or matching introductory competencies provides foundational conceptual understanding, but does not qualify an individual to practise as a professional engineer. Statutory licensure requires an accredited university degree and formal engineering council registration.",
  },
  {
    title: "Computer Engineer",
    field: "Engineering",
    description:
      "Integrate electrical engineering and computer science to design, build, and optimize hardware-software computer architectures and embedded systems.",
    responsibilities: [
      "Architect digital hardware systems, FPGA logic, and embedded microprocessors.",
      "Write low-level firmware and device drivers in C/C++ to interface with hardware peripherals.",
      "Perform timing analysis, hardware validation, and signal integrity testing on PCB prototypes.",
      "Collaborate with software engineers to optimize hardware acceleration for high-performance computing tasks.",
    ],
    skills: [
      "Embedded Systems",
      "C/C++",
      "VHDL/Verilog",
      "Computer Architecture",
      "PCB Design",
    ],
    educationGuidance:
      "Typical entry requires an accredited bachelor's degree in Computer Engineering or Electrical & Computer Engineering. Professional engineering certification requires an accredited university qualification and formal engineering council registration.",
    disclaimer:
      "Completing short online courses or matching introductory competencies provides foundational conceptual understanding, but does not qualify an individual to practise as a professional engineer. Statutory licensure requires an accredited university degree and formal engineering council registration.",
  },
  {
    title: "Manufacturing Engineer",
    field: "Engineering",
    description:
      "Design, optimize, and oversee integrated manufacturing processes, production lines, and quality assurance systems.",
    responsibilities: [
      "Analyze manufacturing workflows to identify bottlenecks, reduce waste, and improve operational throughput.",
      "Program and configure CNC machinery, robotics, and automated assembly systems.",
      "Implement quality control procedures, statistical process control (SPC), and lean manufacturing methodologies.",
      "Design tooling, fixtures, and production layouts to ensure worker ergonomics and production efficiency.",
    ],
    skills: [
      "Lean Manufacturing",
      "CNC Programming",
      "Quality Management (ISO/SPC)",
      "Process Optimization",
      "CAD/CAM",
    ],
    educationGuidance:
      "Typical entry requires an accredited bachelor's degree in Manufacturing, Production, or Industrial Engineering. Formal professional qualification requires completing an accredited university degree program along with industry engineering certification.",
    disclaimer:
      "Completing short online courses or matching introductory competencies provides foundational conceptual understanding, but does not qualify an individual to practise as a professional engineer. Statutory licensure requires an accredited university degree and formal engineering council registration.",
  },

  // ==========================================
  // FIELD 2: IT & COMPUTING
  // ==========================================
  {
    title: "Software Developer",
    field: "IT & Computing",
    description: "Design, build and maintain software applications.",
    responsibilities: [
      "Design and build scalable web and mobile software applications using modern programming frameworks.",
      "Write clean, maintainable, and well-tested code following software engineering best practices.",
      "Collaborate with cross-functional teams to integrate APIs, databases, and third-party services.",
      "Review code, troubleshoot software defects, and maintain version control repositories.",
    ],
    skills: ["JavaScript", "Problem Solving", "Git", "Databases"],
    educationGuidance:
      "Typical entry requires a bachelor's degree in Computer Science, Software Engineering, or Information Technology, or a verifiable portfolio of production-grade software projects and industry certifications.",
    disclaimer:
      "Illustrative educational guidance only. Specific technology stacks and competencies vary across employers and project domains.",
  },
  {
    title: "Data Analyst",
    field: "IT & Computing",
    description:
      "Analyze data and communicate findings to support decisions.",
    responsibilities: [
      "Extract, clean, and transform data from relational and non-relational sources.",
      "Perform exploratory data analysis and statistical testing to discover actionable business insights.",
      "Build interactive dashboards, executive reports, and data visualizations using BI tools.",
      "Communicate data findings clearly to technical and non-technical stakeholders.",
    ],
    skills: ["Python", "SQL", "Statistics", "Data Visualization"],
    educationGuidance:
      "Typical entry requires a bachelor's degree in Data Science, Computer Science, Statistics, Mathematics, or a related quantitative discipline, supplemented by hands-on data analytics portfolio projects.",
    disclaimer:
      "Illustrative educational guidance only. Analytical tool requirements vary across industry sectors.",
  },
  {
    title: "Cybersecurity Analyst",
    field: "IT & Computing",
    description:
      "Monitor, prevent, and respond to security threats across networks, endpoints, and cloud infrastructure to safeguard organizational data.",
    responsibilities: [
      "Monitor network traffic and security alert logs for suspicious behavior, anomalies, and unauthorized access.",
      "Conduct vulnerability scans, risk assessments, and compliance audits on corporate systems.",
      "Respond to security incidents, analyze malware threats, and participate in post-incident containment.",
      "Formulate and communicate cybersecurity hygiene policies and employee awareness training.",
    ],
    skills: [
      "Network Security",
      "Vulnerability Assessment",
      "Incident Response",
      "Linux",
      "Security Information & Event Management (SIEM)",
    ],
    educationGuidance:
      "Typical entry requires a bachelor's degree in Cybersecurity, Computer Science, or Information Technology, or recognized industry credentials such as CompTIA Security+, CEH, or CISSP.",
    disclaimer:
      "Illustrative educational guidance only. Security accreditations and security clearance levels vary by organization and jurisdiction.",
  },

  // ==========================================
  // FIELD 3: BUSINESS & MANAGEMENT
  // ==========================================
  {
    title: "Business Analyst",
    field: "Business & Management",
    description:
      "Bridge the gap between business objectives and technology solutions by analyzing requirements, processes, and data models.",
    responsibilities: [
      "Elicit, validate, and document functional and non-functional requirements from business stakeholders.",
      "Model current-state ('as-is') and future-state ('to-be') business processes using standard notation.",
      "Facilitate stakeholder workshops and align technological roadmaps with strategic organizational goals.",
      "Support user acceptance testing (UAT) and measure business process KPIs post-implementation.",
    ],
    skills: [
      "Requirements Analysis",
      "Business Process Modeling",
      "Stakeholder Communication",
      "Agile Methodologies",
      "Data Interpretation",
    ],
    educationGuidance:
      "Typical entry requires a bachelor's degree in Business Administration, Information Systems, Management, or Economics, supplemented by professional credentials like ECBA or CBAP.",
    disclaimer:
      "Illustrative educational guidance only. Requirements vary based on domain specialization and business scale.",
  },
  {
    title: "Project Coordinator",
    field: "Business & Management",
    description:
      "Facilitate the planning, scheduling, resource tracking, and documentation necessary to deliver projects on time and within scope.",
    responsibilities: [
      "Maintain project schedules, milestone trackers, and detailed risk and issue registers.",
      "Coordinate cross-functional project meetings, record minutes, and track action items to resolution.",
      "Monitor project resource allocations, deliverable deadlines, and budget tracking spreadsheets.",
      "Draft status reports for project managers and senior stakeholders.",
    ],
    skills: [
      "Project Scheduling",
      "Risk Tracking",
      "Microsoft Project / Jira",
      "Cross-Functional Collaboration",
      "Documentation",
    ],
    educationGuidance:
      "Typical entry requires a bachelor's degree in Business, Management, or a domain-relevant field, often accompanied by CAPM or PRINCE2 Foundation certification.",
    disclaimer:
      "Illustrative educational guidance only. Methodologies (Agile, Scrum, Waterfall) vary by project environment.",
  },
  {
    title: "Human Resources Executive",
    field: "Business & Management",
    description:
      "Coordinate talent recruitment, onboarding, employee engagement, workplace relations, and performance appraisal workflows.",
    responsibilities: [
      "Manage talent sourcing pipelines, screen applicant resumes, and coordinate interview panels.",
      "Administer employee onboarding orientations, benefits registration, and HR records maintenance.",
      "Support performance review cycles and facilitate employee relations resolutions.",
      "Ensure workplace policies comply with labor laws and organizational codes of conduct.",
    ],
    skills: [
      "Talent Acquisition",
      "Employee Relations",
      "HR Information Systems (HRIS)",
      "Employment Law Fundamentals",
      "Conflict Resolution",
    ],
    educationGuidance:
      "Typical entry requires a bachelor's degree in Human Resource Management, Psychology, or Business Administration, often supported by professional credentials like SHRM-CP or CIPD.",
    disclaimer:
      "Illustrative educational guidance only. Labor regulations and compliance frameworks vary by country and region.",
  },

  // ==========================================
  // FIELD 4: FINANCE & ACCOUNTING
  // ==========================================
  {
    title: "Accountant",
    field: "Finance & Accounting",
    description:
      "Prepare, examine, and maintain financial records, ensuring accuracy of financial statements and compliance with accounting standards.",
    responsibilities: [
      "Prepare journal entries, reconcile ledger balances, and perform month-end closing procedures.",
      "Generate balance sheets, profit and loss statements, and cash flow reports in compliance with IFRS/GAAP.",
      "Review tax filings, withholding calculations, and statutory compliance submissions.",
      "Conduct internal financial audits and assist external audit review teams.",
    ],
    skills: [
      "Financial Reporting",
      "Ledger Reconciliation",
      "Tax Compliance",
      "Accounting Software (QuickBooks/Xero)",
      "Auditing",
    ],
    educationGuidance:
      "Typical entry requires a bachelor's degree in Accounting or Finance, followed by professional chartered accounting qualifications such as ACCA, CIMA, CPA, or CA.",
    disclaimer:
      "Illustrative educational guidance only. Statutory auditing and signing powers require certified professional accounting body membership.",
  },
  {
    title: "Financial Analyst",
    field: "Finance & Accounting",
    description:
      "Evaluate financial performance, forecast economic trends, and build quantitative financial models to guide investment decisions.",
    responsibilities: [
      "Build discounted cash flow (DCF) models, scenario analyses, and capital budgeting forecasts.",
      "Analyze company financial statements, industry benchmarking metrics, and macroeconomic indicators.",
      "Synthesize valuation data into executive briefings and investment recommendation memos.",
      "Monitor key performance indicators (KPIs) and variance against quarterly budget projections.",
    ],
    skills: [
      "Financial Modeling",
      "Valuation Techniques",
      "Advanced Excel",
      "Variance Analysis",
      "Market Research",
    ],
    educationGuidance:
      "Typical entry requires a bachelor's degree in Finance, Economics, Mathematics, or Accounting. Candidates often pursue professional charters such as CFA (Chartered Financial Analyst).",
    disclaimer:
      "Illustrative educational guidance only. Investment advisory licensing is subject to national securities regulations.",
  },
  {
    title: "Banking Officer",
    field: "Finance & Accounting",
    description:
      "Manage retail and corporate banking services, assess credit and loan applications, and ensure regulatory compliance.",
    responsibilities: [
      "Evaluate retail and commercial loan applications, assessing creditworthiness and debt service ratios.",
      "Advise customers on savings instruments, investment accounts, and treasury services.",
      "Enforce Anti-Money Laundering (AML) and Know-Your-Customer (KYC) regulatory compliance procedures.",
      "Oversee branch transaction operations and daily cash balancing protocols.",
    ],
    skills: [
      "Credit Analysis",
      "AML/KYC Compliance",
      "Retail Banking Operations",
      "Customer Advisory",
      "Risk Assessment",
    ],
    educationGuidance:
      "Typical entry requires a bachelor's degree in Banking, Finance, Business, or Economics, supplemented by professional banking institute certifications.",
    disclaimer:
      "Illustrative educational guidance only. Banking operations are governed by central bank regulatory standards.",
  },

  // ==========================================
  // FIELD 5: MARKETING & MEDIA
  // ==========================================
  {
    title: "Digital Marketing Executive",
    field: "Marketing & Media",
    description:
      "Plan, execute, and monitor digital marketing campaigns across search, social media, email, and performance advertising channels.",
    responsibilities: [
      "Manage search engine marketing (SEM/PPC) and organic search engine optimization (SEO) campaigns.",
      "Execute paid and organic social media marketing campaigns to drive brand awareness and lead acquisition.",
      "Analyze web analytics data to measure conversion rates, ROI, and customer acquisition costs (CAC).",
      "A/B test advertising creatives, copy variations, and landing page funnels.",
    ],
    skills: [
      "SEO/SEM",
      "Google Analytics",
      "Social Media Advertising",
      "Performance Marketing",
      "A/B Testing",
    ],
    educationGuidance:
      "Typical entry requires a bachelor's degree in Marketing, Communications, or Business, supplemented by industry certifications (e.g. Google Ads, Meta Certified Digital Marketing Associate, HubSpot).",
    disclaimer:
      "Illustrative educational guidance only. Platform specializations and advertising tools evolve continuously.",
  },
  {
    title: "Content Strategist",
    field: "Marketing & Media",
    description:
      "Develop and oversee brand editorial calendars, multimedia content narratives, and audience engagement strategies.",
    responsibilities: [
      "Conduct audience research and competitive content audits to identify thematic content opportunities.",
      "Establish brand voice guidelines, editorial standards, and multichannel content calendars.",
      "Write and edit high-impact articles, whitepapers, case studies, and multimedia scripts.",
      "Measure content performance metrics (engagement rate, dwell time, retention) and optimize content life cycles.",
    ],
    skills: [
      "Content Architecture",
      "Copywriting",
      "Editorial Strategy",
      "Keyword Research",
      "Audience Personas",
    ],
    educationGuidance:
      "Typical entry requires a bachelor's degree in Journalism, English, Communications, Marketing, or Media Studies, along with a comprehensive portfolio of published work.",
    disclaimer:
      "Illustrative educational guidance only. Editorial workflows vary across brand publishers and agencies.",
  },
  {
    title: "Marketing Executive",
    field: "Marketing & Media",
    description:
      "Coordinate integrated brand marketing campaigns, promotional events, market research, and partner communications.",
    responsibilities: [
      "Coordinate multichannel promotional campaigns from inception to post-campaign evaluation.",
      "Conduct consumer surveys and competitor market intelligence analysis to inform brand positioning.",
      "Liaise with creative agencies, print vendors, and media outlets for advertising collateral production.",
      "Organize corporate trade shows, product launches, and brand activation events.",
    ],
    skills: [
      "Campaign Coordination",
      "Market Research",
      "Brand Positioning",
      "Vendor Management",
      "Event Marketing",
    ],
    educationGuidance:
      "Typical entry requires a bachelor's degree in Marketing, Business Administration, or Mass Communication, supported by professional marketing credentials such as CIM (Chartered Institute of Marketing).",
    disclaimer:
      "Illustrative educational guidance only. Campaign scopes vary between B2B and B2C organizations.",
  },

  // Legacy entry fallback (UI/UX Designer present in initial seed data)
  {
    title: "UI/UX Designer",
    field: "Marketing & Media",
    description: "Research user needs and design clear, usable interfaces.",
    responsibilities: [
      "Conduct user interviews, usability testing sessions, and competitive UX audits.",
      "Create low-fidelity wireframes, interactive user flows, and high-fidelity UI prototypes.",
      "Collaborate with developers to ensure interface designs are implemented accurately.",
      "Maintain and expand design systems, component libraries, and style guides.",
    ],
    skills: ["Figma", "User Research", "Wireframing", "Prototyping"],
    educationGuidance:
      "Typical entry requires a bachelor's degree in Interaction Design, Human-Computer Interaction (HCI), Graphic Design, or a comprehensive UX portfolio showcasing end-to-end design case studies.",
    disclaimer:
      "Illustrative educational guidance only. Design specializations vary by product team.",
  },
];

module.exports = { CAREER_CATALOG };
