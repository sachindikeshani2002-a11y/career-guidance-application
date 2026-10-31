import { useState } from "react";

const lessonsByCourse = {
  // =========================================================================
  // Baseline Existing Courses
  // =========================================================================
  "JavaScript Fundamentals": [
    {
      title: "Variables",
      content:
        "Use const for a variable that will not be reassigned. Use let when you need to assign a new value later. JavaScript values include strings, numbers and booleans.",
      example:
        'const student = "Sam";\nlet score = 70;\nscore = 85;\nconsole.log(student, score);',
    },
    {
      title: "Functions",
      content:
        "A function groups instructions that you can reuse. Parameters receive input values. The return statement provides the result.",
      example:
        "function add(a, b) {\n  return a + b;\n}\n\nconsole.log(add(10, 20));",
    },
    {
      title: "Arrays and filtering",
      content:
        "An array stores a list of values. The filter method creates a new array containing the items that satisfy a condition.",
      example:
        "const marks = [35, 60, 80];\nconst passed = marks.filter(mark => mark >= 50);\nconsole.log(passed);",
    },
  ],

  "Python for Data Analysis": [
    {
      title: "Variables",
      content:
        "Variables refer to values. Python can work with text, numbers and other data types. The print function displays values.",
      example:
        'name = "Student"\nscore = 85\nprint(name, score)',
    },
    {
      title: "Lists",
      content:
        "A list stores multiple values in order. You can access an item using its index. The first index is zero.",
      example:
        "marks = [70, 85, 90]\nprint(marks[0])",
    },
    {
      title: "Calculate an average",
      content:
        "sum adds the numbers in a list. len gives the number of items. Divide the total by the count to calculate the average of a non-empty list.",
      example:
        "marks = [70, 85, 90]\naverage = sum(marks) / len(marks)\nprint(average)",
    },
  ],

  "UI/UX Design Basics": [
    {
      title: "Understand the user",
      content:
        "UX design considers how people experience a product. UI design focuses on the interface they use. Begin by identifying the user's goal and the difficulties they face.",
      example:
        "User goal: Find a suitable course.\nDesign task: Make course skills and enrollment actions easy to understand.",
    },
    {
      title: "Create a wireframe",
      content:
        "A wireframe is a simple layout showing the main content and controls. Plan the information order before adding detailed colors, images and decoration.",
      example:
        "Course card content:\n1. Course title\n2. Short description\n3. Skills covered\n4. Enroll button",
    },
    {
      title: "Prototype and test",
      content:
        "A prototype demonstrates how screens connect. Give a user a realistic task and observe how they complete it. Improve the design based on the difficulties you observe.",
      example:
        'Task: "Find a Python course and enroll."\nObserve: Can the user find the course and understand the enrollment result?',
    },
  ],

  "Git and Version Control": [
    {
      title: "What is Git?",
      content:
        "Git tracks changes to project files. A repository stores your project history. Each commit records a snapshot of the staged changes.",
      example:
        "git status",
    },
    {
      title: "Create a commit",
      content:
        "Stage the files you want to include, then create a commit with a message describing your change.",
      example:
        'git add README.md\ngit commit -m "Update project documentation"',
    },
    {
      title: "Working with branches",
      content:
        "A branch lets you work on a feature separately. You can later merge the completed changes into your main branch.",
      example:
        "git switch -c feature/profile",
    },
  ],

  "Database Fundamentals": [
    {
      title: "What is a database?",
      content:
        "A database stores and organizes information. CareerPath stores users, careers, courses and enrollments in MongoDB.",
      example:
        '{ "title": "Database Fundamentals", "level": "Beginner" }',
    },
    {
      title: "Tables and documents",
      content:
        "Relational databases organize records into tables with rows and columns. MongoDB stores documents in collections. Documents can contain fields and arrays.",
      example:
        'Collection: courses\nDocument: { "title": "Git and Version Control", "skills": ["Git"] }',
    },
    {
      title: "Introduction to SQL",
      content:
        "SQL is used to query relational databases. SELECT reads data. WHERE filters rows. This example is for a relational database, while CareerPath uses MongoDB.",
      example:
        "SELECT title FROM courses WHERE level = 'Beginner';",
    },
  ],

  "Statistics for Data Analysis": [
    {
      title: "Mean and median",
      content:
        "The mean is the total divided by the number of values. The median is the middle value after sorting. Extreme values can affect the mean more strongly than the median.",
      example:
        "Values: 10, 20, 30, 40, 100\nMean: 200 / 5 = 40\nMedian: 30",
    },
    {
      title: "Describe variation",
      content:
        "Variation describes how spread out the values are. The range is the maximum minus the minimum. Standard deviation is another measure of spread around the mean.",
      example:
        "Values: 5, 8, 12, 15\nRange: 15 - 5 = 10",
    },
    {
      title: "Correlation and causation",
      content:
        "Correlation describes an association between variables. An association alone does not prove that one variable causes a change in the other. Other factors may explain the pattern.",
      example:
        "Students who study longer may have higher marks.\nThis association alone does not establish the effect of study time.",
    },
  ],

  "Data Visualization Basics": [
    {
      title: "Choose a chart",
      content:
        "Use a bar chart to compare categories. Use a line chart to show change over ordered time points. Use a scatter plot to explore the relationship between two numeric variables.",
      example:
        "Enrollments by course: Bar chart\nMonthly enrollments: Line chart\nStudy hours and marks: Scatter plot",
    },
    {
      title: "Label clearly",
      content:
        "Give the chart a useful title. Label axes and units. Explain colors when they represent different groups. Include the data source when presenting results.",
      example:
        "Title: Monthly Course Enrollments\nHorizontal axis: Month\nVertical axis: Number of enrollments",
    },
    {
      title: "Avoid misleading charts",
      content:
        "Use scales consistently and show missing data honestly. Bar chart value axes should generally start at zero because bar length represents the value. Avoid decorative effects that make comparisons harder.",
      example:
        "Compare 90 and 100 using a zero-based bar chart.\nAn axis starting at 89 can exaggerate the difference.",
    },
  ],

  "User Research Fundamentals": [
    {
      title: "Define a research question",
      content:
        "Start with a specific question about users or their tasks. Choose participants who represent the people expected to use the application.",
      example:
        "Research question: How do students decide which career skills to learn next?",
    },
    {
      title: "Ask neutral questions",
      content:
        "Ask about real experiences and avoid suggesting a preferred answer. Explain the purpose of the research and obtain consent before recording participants.",
      example:
        'Neutral: "Tell me about the last time you chose an online course."\nLeading: "Our recommendations are useful, right?"',
    },
    {
      title: "Summarize findings",
      content:
        "Look for recurring patterns in participant experiences. Separate observations from your interpretation. Use findings to propose changes, then test whether those changes help.",
      example:
        "Observation: Several students could not find course prerequisites.\nPossible improvement: Display prerequisites on the course details page.",
    },
  ],

  // =========================================================================
  // Existing Database Course: Introduction to Cloud Computing
  // =========================================================================
  "Introduction to Cloud Computing": [
    {
      title: "Cloud Service Models (IaaS, PaaS, SaaS)",
      content:
        "Cloud computing provisions compute, storage, and networking on demand over the internet. Infrastructure as a Service (IaaS) provides virtual compute machines, Platform as a Service (PaaS) manages application runtimes, and Software as a Service (SaaS) delivers complete hosted applications.",
      example:
        "IaaS: AWS EC2 virtual machine instance\nPaaS: Managed container deployment environment\nSaaS: Web-based email or document collaborative suite",
    },
    {
      title: "Virtual Compute and Object Storage",
      content:
        "In modern cloud architectures like AWS, virtual instances execute backend business logic while object storage services store static media assets with high durability. Storage buckets organize files using unique object keys.",
      example:
        "Compute: AWS EC2 t3.micro instance running web application\nStorage: AWS S3 bucket 'careerpath-course-thumbnails' storing course SVG vectors",
    },
    {
      title: "Web Application Deployment Workflows",
      content:
        "Deploying an application involves bundling static frontend assets, compiling backend dependencies, and running processes behind a reverse proxy that manages HTTPS domain routing.",
      example:
        "Deployment Pipeline:\n1. Build frontend bundle: npm --prefix frontend run build\n2. Configure backend reverse proxy on cloud VM port 5001\n3. Verify HTTPS certificate renewal",
    },
  ],

  // =========================================================================
  // 17 New Courses Across Engineering, IT, Business, Finance, Marketing
  // =========================================================================

  // 1. Engineering: CAD and Technical Drafting
  "Computer-Aided Design and Technical Drafting": [
    {
      title: "2D Drafting and Precision Constraints (AutoCAD)",
      content:
        "Technical drafting communicates geometric dimensions for manufacturing and construction. In AutoCAD, engineers use coordinate grids, object snaps, and geometric constraints (parallel, perpendicular, tangent) to create exact 2D drawings. Note: Educational simulation exercise.",
      example:
        "Drafting Parameters: Units = mm, Scale = 1:1\nCOMMAND: LINE (0,0) -> (150,0) -> (150,80) -> (0,80) -> CLOSE\nCONSTRAINT: Set horizontal boundary edges to PARALLEL; Fillet corner R = 10.0 mm",
    },
    {
      title: "3D Parametric Part Modeling and Extrusion (SolidWorks)",
      content:
        "SolidWorks constructs 3D parts through parametric feature-based modeling. A designer creates a 2D sketch on a datum plane, applies dimensions, and adds volume using features such as Boss-Extrude and Extruded-Cut.",
      example:
        "Simulation Modeling Step:\n1. Sketch circle Ø40.0 mm on Front Datum Plane\n2. Apply Feature: Boss-Extrude depth d = 75.0 mm\n3. Sketch concentric circle Ø20.0 mm on front face -> Extruded-Cut (Through All)",
    },
    {
      title: "Assembly Mates and Technical Fabrication Drawings",
      content:
        "Parametric assemblies unite individual components using kinematic mates like concentric, coincident, and distance offsets. Technical drawings document multi-view orthographic projections, section views, and bill-of-materials (BOM) callouts.",
      example:
        "Assembly Mating Step:\nSelect Shaft outer surface and Bushing inner bore -> Apply Concentric Mate\nDrawing: Insert Front, Top, and Isometric views; apply ISO standard linear dimensions with ±0.05 mm tolerance",
    },
  ],

  // 2. Engineering: Structural Mechanics and Strength of Materials
  "Structural Mechanics and Strength of Materials": [
    {
      title: "Axial Loading and Stress-Strain Elasticity",
      content:
        "Materials under external loads develop internal stresses (force per unit area) and strains (relative deformation). In the linear elastic regime, Hooke's Law governs deformation: stress equals Young's modulus times strain (σ = E * ε). Note: Educational sample calculation only.",
      example:
        "Assumptions: Structural steel rod, Young's Modulus E = 200 GPa, Area A = 400 mm² (0.0004 m²), Length L = 2.0 m\nApplied Tensile Force F = 40 kN (40,000 N)\nStress σ = F / A = 40,000 / 0.0004 = 100 MPa\nElongation ΔL = (F * L) / (A * E) = (40,000 * 2.0) / (0.0004 * 200e9) = 1.0 mm",
    },
    {
      title: "Shear Force and Bending Moment Diagrams",
      content:
        "Transverse loads on beams induce internal shear forces and bending moments. Equilibrium analysis (sum of vertical forces and moments equals zero) determines reaction forces at supports and reveals maximum bending moment locations.",
      example:
        "Assumptions: Simply supported horizontal beam, Span L = 6.0 m, Central Point Load P = 12.0 kN at x = 3.0 m\nReactions: R_left = R_right = 6.0 kN\nMaximum Shear Force V_max = 6.0 kN\nMaximum Bending Moment M_max = (P * L) / 4 = (12.0 * 6.0) / 4 = 18.0 kNm",
    },
    {
      title: "Material Yield Criteria and Factor of Safety",
      content:
        "Materials science characterizes yield strength, ultimate tensile strength, and ductile versus brittle failure. Structural designs require working stresses to remain below material yield limits by a design factor of safety (FOS = σ_yield / σ_working).",
      example:
        "Material: Mild Steel Grade S275 (Yield Strength σ_yield = 275 MPa)\nCalculated Maximum Working Stress σ_working = 110 MPa\nFactor of Safety (FOS) = σ_yield / σ_working = 275 / 110 = 2.5\nDesign Verification: FOS 2.5 satisfies typical building code threshold (FOS >= 2.0)",
    },
  ],

  // 3. Engineering: Thermodynamics and Fluid Mechanics
  "Thermodynamics and Fluid Mechanics": [
    {
      title: "First Law of Thermodynamics and Closed Systems",
      content:
        "The First Law of Thermodynamics establishes the conservation of energy: the change in internal energy (ΔU) of a closed system equals net heat added (Q) minus net work done by the system (W). Note: Idealized simulation assumptions.",
      example:
        "Assumptions: Closed cylinder with movable piston, ideal gas working fluid\nHeat added to system: Q = +500 J\nWork performed by gas expansion: W = +200 J\nChange in Internal Energy: ΔU = Q - W = 500 J - 200 J = +300 J",
    },
    {
      title: "Ideal Gas State Transformations",
      content:
        "Ideal gases follow the equation of state PV = mRT. Standard thermodynamic cycles evaluate state changes across isobaric (constant pressure), isochoric (constant volume), isothermal (constant temperature), and adiabatic paths.",
      example:
        "Assumptions: Air with gas constant R = 287 J/(kg·K)\nMass m = 0.5 kg, Temperature T1 = 300 K (27°C), Volume V1 = 0.2 m³\nInitial Pressure P1 = (m * R * T1) / V1 = (0.5 * 287 * 300) / 0.2 = 215,250 Pa (215.3 kPa)",
    },
    {
      title: "Fluid Statics, Pressure Head, and Bernoulli Continuity",
      content:
        "Fluid mechanics analyzes fluids at rest and in motion. Fluid statics calculates pressure head with depth (P = ρgh), while Bernoulli's continuity equation relates flow velocity to cross-sectional area changes in laminar incompressible flow.",
      example:
        "Assumptions: Steady, inviscid, incompressible water flow (Density ρ = 1000 kg/m³)\nInlet Pipe: Diameter D1 = 0.10 m, Velocity v1 = 2.0 m/s\nConstricted Outlet: Diameter D2 = 0.05 m\nContinuity: A1 * v1 = A2 * v2 -> v2 = v1 * (D1 / D2)² = 2.0 * (0.10 / 0.05)² = 8.0 m/s",
    },
  ],

  // 4. Engineering: Electric Circuit Analysis and Microcontroller Interfacing
  "Electric Circuit Analysis and Microcontroller Interfacing": [
    {
      title: "Ohm's Law, Kirchhoff's Laws, and DC Circuit Analysis",
      content:
        "Circuit analysis calculates branch currents, node voltages, and power dissipation. Kirchhoff's Current Law (KCL) balances node currents; Kirchhoff's Voltage Law (KVL) balances loop voltage drops.",
      example:
        "Circuit: 12.0 V DC power supply connected to R1 = 100 Ω in series with R2 = 200 Ω\nTotal Resistance R_total = R1 + R2 = 300 Ω\nLoop Current I = V / R_total = 12.0 / 300 = 0.04 A (40 mA)\nVoltage across R2: V_R2 = I * R2 = 0.04 * 200 = 8.0 V",
    },
    {
      title: "Microcontroller GPIO, ADC, and PWM Interfacing",
      content:
        "Microcontrollers interface with analog and digital circuit peripherals. General Purpose Input/Output (GPIO) pins control digital logic levels, Analog-to-Digital Converters (ADCs) sample analog sensor voltages, and Pulse Width Modulation (PWM) regulates output power.",
      example:
        "Scenario: 10-bit ADC measuring temperature sensor (Reference V_ref = 5.0 V)\nADC Digital Reading = 512 (out of 1023)\nMeasured Sensor Voltage = (512 / 1023) * 5.0 V = 2.50 V\nPWM Duty Cycle for 50% motor power: OCR0A = 128 (out of 255)",
    },
    {
      title: "MATLAB Scripting for Circuit Transient Response",
      content:
        "MATLAB provides mathematical modeling for dynamic systems. Engineers write scripts to calculate resistor-capacitor (RC) time constants and plot step-response capacitor charging curves over time.",
      example:
        "MATLAB Simulation Script:\nR = 10e3; C = 100e-6; tau = R * C; % Time constant tau = 1.0 s\nt = 0:0.05:5; V_supply = 5.0;\nV_cap = V_supply * (1 - exp(-t / tau));\nplot(t, V_cap); xlabel('Time (s)'); ylabel('Capacitor Voltage (V)'); grid on;",
    },
  ],

  // 5. Engineering: Embedded Systems Programming and C
  "Embedded Systems Programming and C": [
    {
      title: "Memory Layout, Pointers, and Bitwise Register Manipulation",
      content:
        "Embedded C interfaces directly with memory-mapped hardware peripheral registers. Bitwise operators (AND, OR, NOT, XOR, Bitshifts) modify specific register bit flags without overwriting adjacent hardware settings.",
      example:
        "C Firmware Snippet:\n#define PORTB_DIR (*(volatile uint8_t*)0x24)\n#define PIN_LED   (1 << 5) // Bit 5 mask\nPORTB_DIR |= PIN_LED;   // Set Pin 5 as output (Bitwise OR)\nPORTB_DIR &= ~PIN_LED;  // Clear Pin 5 to input (Bitwise AND with complement)",
    },
    {
      title: "Hardware Interrupt Service Routines (ISRs)",
      content:
        "Interrupts allow embedded controllers to respond to hardware events asynchronously without CPU polling. An Interrupt Service Routine (ISR) must be fast, deterministic, and communicate through volatile shared variables.",
      example:
        "C Firmware Snippet:\nvolatile uint32_t g_encoder_ticks = 0;\nvoid __attribute__((interrupt)) EXTI0_IRQHandler(void) {\n    g_encoder_ticks++; // Increment position counter on hardware edge trigger\n    CLEAR_INTERRUPT_FLAG();\n}",
    },
    {
      title: "Serial Communication Protocols: UART and SPI",
      content:
        "Embedded microcontrollers communicate with external sensors through standardized serial interfaces. UART provides asynchronous point-to-point communication with start/stop bits; SPI provides high-speed synchronous communication using clock and chip-select lines.",
      example:
        "UART Initialization in C:\nvoid uart_init(uint32_t baud_rate) {\n    uint16_t ubrr = (F_CPU / (16 * baud_rate)) - 1;\n    UBRR0H = (uint8_t)(ubrr >> 8);\n    UBRR0L = (uint8_t)ubrr;\n    UCSR0B = (1 << RXEN0) | (1 << TXEN0); // Enable Rx and Tx circuits\n}",
    },
  ],

  // 6. Engineering: Digital Logic and Computer Architecture
  "Digital Logic and Computer Architecture": [
    {
      title: "Combinational and Sequential Logic in Verilog",
      content:
        "Digital systems combine combinational logic gates with sequential clocked flip-flops. Hardware Description Languages (HDLs) such as Verilog specify hardware structure and concurrent timing behavior for digital synthesis.",
      example:
        "Verilog RTL Snippet (4-bit counter with synchronous reset):\nmodule counter(input wire clk, input wire rst, output reg [3:0] count);\n  always @(posedge clk) begin\n    if (rst) count <= 4'b0000;\n    else count <= count + 1'b1;\n  end\nendmodule",
    },
    {
      title: "Finite State Machine (FSM) Design and Synthesis",
      content:
        "Finite State Machines coordinate control logic across sequential states. Designers encode states, specify synchronous state transitions, and author combinational next-state decoders.",
      example:
        "Verilog FSM Snippet:\nlocalparam S_IDLE = 2'b00, S_READ = 2'b01, S_DONE = 2'b10;\nreg [1:0] state, next_state;\nalways @(*) begin\n  case (state)\n    S_IDLE: next_state = (start_req) ? S_READ : S_IDLE;\n    S_READ: next_state = S_DONE;\n    default: next_state = S_IDLE;\n  endcase\nend",
    },
    {
      title: "CPU Datapath, Instruction Pipelines, and Memory Hierarchy",
      content:
        "Computer architecture organizes instruction fetch, decode, execute, memory access, and writeback into pipelined datapaths. Memory hierarchies combine fast L1/L2 on-chip caches with main RAM.",
      example:
        "Classic 5-Stage RISC Pipeline Model:\n1. IF (Instruction Fetch) -> 2. ID (Decode & Read Regs) -> 3. EX (ALU Execute) -> 4. MEM (Data Memory Access) -> 5. WB (Write Back to Register)\nHazard Mitigation: Internal forwarding buses bypass results directly from EX stage",
    },
  ],

  // 7. Engineering: Lean Manufacturing and Process Engineering
  "Lean Manufacturing and Process Engineering": [
    {
      title: "Value Stream Mapping and the Seven Forms of Waste",
      content:
        "Lean manufacturing focuses on maximizing customer value while systematically eliminating non-value-added waste (Muda: transport, inventory, motion, waiting, overproduction, overprocessing, defects). Value stream maps document end-to-end production cycles.",
      example:
        "Production Assumptions: Assembly line produces 240 brackets per 8-hour shift\nAvailable Operating Time = 8 hrs * 3600 s = 28,800 s\nTakt Time = Available Operating Time / Customer Demand = 28,800 s / 240 units = 120 s/unit\nTarget: Balance workstation cycle times to <= 120 s to meet customer demand",
    },
    {
      title: "Statistical Process Control (SPC) and Control Charts",
      content:
        "Quality management uses Statistical Process Control to distinguish normal random variation from assignable quality defects. Process capability indices (Cp and Cpk) quantify process performance against design tolerances.",
      example:
        "Assumptions: Component target diameter = 25.00 mm, Upper Spec = 25.15 mm, Lower Spec = 24.85 mm\nSample standard deviation s = 0.04 mm\nProcess Capability Cp = (USL - LSL) / (6 * s) = 0.30 / (6 * 0.04) = 0.30 / 0.24 = 1.25\nAssessment: Cp of 1.25 indicates process is capable with low defect probability",
    },
    {
      title: "Process Optimization and 5S Standardization",
      content:
        "Process engineering eliminates assembly bottlenecks through 5S workplace organization (Sort, Set in order, Shine, Standardize, Sustain) and root-cause analysis (5 Whys) to sustain ISO 9001 compliance.",
      example:
        "Root Cause 5 Whys Analysis:\n1. Problem: Assembly machine stopped -> Hydraulic pump overheated\n2. Why? -> Oil filter was clogged\n3. Why? -> Filter replacement was overdue\n4. Why? -> Maintenance schedule was untracked\nCorrective Action: Implement standard preventive maintenance visual board and automated digital log",
    },
  ],

  // 8. IT & Computing: Network Defense and Linux Fundamentals
  "Network Defense and Linux Fundamentals": [
    {
      title: "Linux Permissions, Sudo Policies, and Service Hardening",
      content:
        "Linux administration enforces the principle of least privilege. Defenders audit user groups, configure restrictive file permissions, and restrict administrative escalation through sudoers rules in simulated defensive labs.",
      example:
        "Simulated Lab Defense Configuration:\n# Create dedicated defensive analyst group and set restrictive permissions\n$ sudo groupadd secops\n$ sudo chown root:secops /etc/lab_firewall.conf\n$ sudo chmod 640 /etc/lab_firewall.conf\n# Verify no world-writable configuration files exist in /etc",
    },
    {
      title: "Packet Inspection and Software Firewall ACLs (Lab Environment)",
      content:
        "Network defense regulates traffic between subnets using stateful access control lists (ACLs). Defenders inspect packet headers and configure software firewall rules to drop unauthorized connection attempts in simulated networks.",
      example:
        "Fictional Lab Network Defense (10.0.4.0/24 Subnet):\n# Accept established sessions, allow internal administrative host, drop outside requests\n$ sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT\n$ sudo iptables -A INPUT -p tcp -s 10.0.4.50 --dport 22 -j ACCEPT\n$ sudo iptables -A INPUT -p tcp --dport 22 -j DROP",
    },
    {
      title: "Encrypted Remote Administration and SSH Key Management",
      content:
        "Defending internal infrastructure requires replacing plaintext protocols with encrypted SSH connections using public-key cryptography. Password authentication is disabled to prevent automated brute-force attacks.",
      example:
        "Defensive Configuration in /etc/ssh/sshd_config:\nPermitRootLogin no\nPasswordAuthentication no\nPubkeyAuthentication yes\nMaxAuthTries 3\n# Generate 4096-bit RSA or Ed25519 administrative access keypair",
    },
  ],

  // 9. IT & Computing: Security Operations and Defensive Incident Handling
  "Security Operations and Defensive Incident Handling": [
    {
      title: "Defensive Vulnerability Triage (Lab Model LAB-DEF-2026)",
      content:
        "Vulnerability assessment systematically scans internal IT assets to identify missing software patches and misconfigurations. Defenders prioritize fixes using qualitative severity scales based on exploitability and asset criticality in academic lab environments.",
      example:
        "Fictional Lab Triage Report:\nAsset ID: srv-internal-02 (Database Backup Host)\nVulnerability Flag: LAB-DEF-2026-04 (Outdated TLS Library)\nSeverity Rating: High (Internal Asset, Sensitive Data Access)\nRemediation Recommendation: Apply tested package update in staging environment",
    },
    {
      title: "Centralized SIEM Log Ingestion and Detection Rule Writing",
      content:
        "Security Information and Event Management (SIEM) systems aggregate audit logs from firewalls, servers, and authentication endpoints. Analysts write detection rules that correlate multiple events into actionable defensive alerts.",
      example:
        "Generic SIEM Query Syntax:\nSELECT timestamp, source_ip, user_account, count(*) as failed_attempts\nFROM authentication_events\nWHERE event_status = 'FAILURE' AND timestamp > NOW() - INTERVAL 10 MINUTE\nGROUP BY source_ip, user_account\nHAVING failed_attempts >= 5;",
    },
    {
      title: "NIST Incident Handling Lifecycle: Containment and Post-Mortems",
      content:
        "Defensive incident response follows structured phases: Preparation, Detection, Containment, Eradication, Recovery, and Lessons Learned. Defenders isolate affected network segments to stop lateral spread while preserving audit trails.",
      example:
        "Incident Response Playbook Step (Containment):\n1. Isolate compromised workstation host from production VLAN to quarantine segment\n2. Revoke active session tokens and reset user credentials\n3. Capture forensic memory snapshot for root-cause analysis\n4. Document timeline for post-incident review",
    },
  ],

  // 10. Business: Agile Methodologies and Project Coordination
  "Agile Methodologies and Project Coordination": [
    {
      title: "Agile Ceremonies and User Story Definition",
      content:
        "Agile project coordination organizes software and engineering development into incremental sprint cycles. Coordinators write user stories using standard templates and facilitate sprint planning, daily standups, and retrospectives.",
      example:
        "User Story Template:\n'As a student user, I want to filter career pathways by faculty field, so that I can focus on engineering curricula.'\nAcceptance Criteria:\n1. Dropdown includes All Fields and Engineering\n2. Selecting Engineering updates card list instantly",
    },
    {
      title: "Work Breakdown Structures (WBS) and Gantt Schedules",
      content:
        "Project scheduling decomposes complex project milestones into discrete, measurable work packages. Gantt charts in tools like Microsoft Project plot task dependencies, critical path items, and buffer margins.",
      example:
        "WBS Decomposition for Feature Release:\n1.0 Database Schema Update (2 days, depends on none)\n2.0 Backend Route Implementation (3 days, depends on 1.0)\n3.0 Frontend UI Integration (4 days, depends on 2.0)\nTotal Critical Path = 9 days",
    },
    {
      title: "Sprint Board Coordination and Status Reporting in Jira",
      content:
        "Cross-functional collaboration requires shared transparency. Project coordinators organize Jira Kanban boards with clear WIP (Work In Progress) limits, track sprint burn-down charts, and publish weekly stakeholder milestone reports.",
      example:
        "Jira Workflow Columns:\n[To Do] -> [In Development (WIP: 4)] -> [Code Review (WIP: 2)] -> [QA Verified] -> [Done]\nStatus Report: Sprint 4 delivered 32 story points; 1 blocker resolved via cross-team coordination",
    },
  ],

  // 11. Business: Business Analysis and Process Modeling
  "Business Analysis and Process Modeling": [
    {
      title: "Requirements Gathering and Elicitation Techniques",
      content:
        "Business analysts bridge business stakeholders with technical development teams. They conduct structured stakeholder interviews, classify functional vs. non-functional requirements, and resolve conflicting scope expectations.",
      example:
        "Requirements Specification:\nFunctional: The platform must calculate student skill match percentage against target career.\nNon-Functional: Calculation and API response must complete within 200 milliseconds under a 50 concurrent user load.",
    },
    {
      title: "Business Process Modeling (BPMN) Swimlane Workflows",
      content:
        "BPMN 2.0 visualizes business workflows across departments using pools and swimlanes. Standard symbols (start events, tasks, decision gateways, end events) document current-state and optimized future-state business processes.",
      example:
        "BPMN Process Flow:\n[Student Swimlane]: Submit Career Selection ->\n[Application System]: Validate Prerequisites ->\n[Decision Gateway]: Are prerequisites met?\n  - Yes: Update Target Career Record & Recommend Courses\n  - No: Display Educational Guidance Banner",
    },
    {
      title: "Quantitative Data Interpretation and Risk Tracking",
      content:
        "Business analysis requires interpreting operational metrics to identify performance bottlenecks. Analysts interpret funnel drop-offs and maintain risk registers evaluating probability and impact to guide mitigation strategies.",
      example:
        "Data Interpretation Scenario:\nOnboarding funnel analysis reveals 45% drop-off at profile skill entry.\nInterpretation: Long manual text fields create high friction.\nRecommendation: Introduce pre-populated skill pill selectors.\nRisk Register: Risk ID R-04 (User drop-off), Probability: High, Impact: Moderate, Mitigation: Add quick-select pills",
    },
  ],

  // 12. Business: Human Resources Management Principles
  "Human Resources Management Principles": [
    {
      title: "Structured Recruitment and Behavioral Interviewing",
      content:
        "Talent acquisition requires objective, competency-based recruitment workflows. HR professionals develop structured interview scorecards using the STAR method (Situation, Task, Action, Result) to evaluate candidate competencies fairly.",
      example:
        "STAR Evaluation Rubric:\nQuestion: 'Describe a project where you resolved a team scheduling conflict.'\nRating Criteria (1-5):\n- Situation & Task clearly articulated\n- Constructive action taken to listen to both parties\n- Measurable positive project outcome achieved",
    },
    {
      title: "Employment Law Fundamentals and HRIS Record Keeping",
      content:
        "HR departments manage personnel data within Human Resource Information Systems (HRIS). Professionals ensure strict compliance with statutory employment regulations, overtime thresholds, and employee data privacy standards.",
      example:
        "HRIS Master Record Fields:\nEmployee ID, Tax Identification, Department, Job Grade, Statutory Leave Balances, Annual Review Date\nCompliance Audit Check: Ensure non-exempt hourly employees have digital timesheets verified against statutory overtime regulations",
    },
    {
      title: "Employee Relations and Workplace Conflict Mediation",
      content:
        "Positive employee relations depend on structured, impartial conflict resolution. HR executives mediate interpersonal friction, document objective factual statements, and formulate constructive performance improvement plans (PIPs).",
      example:
        "Three-Stage Mediation Framework:\nStage 1: Individual fact-finding caucuses with each party\nStage 2: Joint facilitated session focusing on mutual business objectives rather than personal grievances\nStage 3: Signed resolution agreement with 30-day follow-up review",
    },
  ],

  // 13. Finance: Financial Accounting and Bookkeeping Principles
  "Financial Accounting and Bookkeeping Principles": [
    {
      title: "Double-Entry Principles: Debits, Credits, and the Ledger",
      content:
        "Financial accounting rests on the fundamental accounting equation: Assets = Liabilities + Equity. Double-entry bookkeeping dictates that every financial transaction affects at least two accounts with equal debit and credit amounts.",
      example:
        "General Journal Entry: Business purchases equipment for $5,000 cash.\nDebit: Equipment Account (Asset increases) $5,000\nCredit: Cash Account (Asset decreases) $5,000\nResult: Equation remains in balance; total asset valuation unchanged.",
    },
    {
      title: "Bank and Account Reconciliation Workflows",
      content:
        "Reconciliation ensures internal accounting records match external bank and vendor statements. Accountants adjust for timing differences such as outstanding checks and deposits in transit to verify ledger accuracy.",
      example:
        "Reconciliation Summary:\nGeneral Ledger Cash Balance: $42,100\nBank Statement Ending Balance: $44,500\nLess: Outstanding check #104 (-$2,800)\nPlus: Deposit in transit (+$400)\nAdjusted Bank Balance = $44,500 - $2,800 + $400 = $42,100 (Reconciled)",
    },
    {
      title: "Financial Reporting and Accounting Software Workflows",
      content:
        "Accountants configure chart of accounts within digital software (QuickBooks/Xero) to generate standard financial reports: the Balance Sheet, Income Statement (Profit & Loss), and Statement of Cash Flows.",
      example:
        "Income Statement Report Generation:\nRevenue: $120,000\nCost of Goods Sold (COGS): $45,000\nGross Profit: $75,000\nOperating Expenses (Salaries, Rent, Utilities): $35,000\nNet Operating Income: $40,000",
    },
  ],

  // 14. Finance: Corporate Financial Analysis and Modeling
  "Corporate Financial Analysis and Modeling": [
    {
      title: "Advanced Excel for Finance: Dynamic Formulas and Lookups",
      content:
        "Financial analysts use advanced Excel formulas to build reliable financial calculations. Functions such as XLOOKUP, INDEX/MATCH, and dynamic data tables structure financial calculations without manual hardcoding.",
      example:
        "Excel Formula Scenario:\nHistorical revenue in Column B, growth rates in Column C.\nDynamic projection formula: =B10 * (1 + C10)\nLookup historical tax rate: =XLOOKUP(F$2, $A$2:$A$20, $D$2:$D$20, 0.21)",
    },
    {
      title: "Three-Statement Financial Statement Modeling",
      content:
        "Financial modeling connects the Income Statement, Balance Sheet, and Cash Flow Statement into an integrated model. Net income from the Income Statement flows into retained earnings and operating cash flow.",
      example:
        "Financial Model Integration Link:\nNet Income: $50,000 -> Cash Flow Statement (Top Line)\nAdd Back Depreciation: +$10,000\nLess Working Capital Increase: -$5,000\nCash Flow from Operations = $55,000 -> Updates Balance Sheet Cash balance",
    },
    {
      title: "Discounted Cash Flow (DCF) Basics and Variance Reporting",
      content:
        "Corporate valuation estimates enterprise worth by discounting projected future cash flows to present value using the Weighted Average Cost of Capital (WACC). Variance analysis tracks budget vs. actual discrepancies.",
      example:
        "Discounted Cash Flow Calculation:\nProjected Free Cash Flow Year 1: $100,000; Discount Rate (WACC): 10%\nPresent Value (PV) = $100,000 / (1 + 0.10)¹ = $90,909\nVariance Analysis: Actual Revenue ($105k) vs Budget ($100k) = +$5,000 (+5.0% Favorable Variance)",
    },
  ],

  // 15. Finance: Commercial Banking Operations and Credit Analysis
  "Commercial Banking Operations and Credit Analysis": [
    {
      title: "Retail Banking Branch Operations and Account Governance",
      content:
        "Retail banking manages deposit accounts, wire transfers, and daily liquidity operations under strict regulatory governance. Bank officers verify transaction authorizations and maintain audit logs of all cash and electronic transfers.",
      example:
        "Branch Operation Check:\nCustomer requests $25,000 international wire transfer.\nProcedure:\n1. Verify customer government photo ID and signature card\n2. Dual authorization review required for transfers over $10,000\n3. Log transaction reference in branch core banking system",
    },
    {
      title: "Credit Underwriting and the 5 C's of Credit",
      content:
        "Credit analysis assesses loan applicant repayment capacity using the 5 C's: Character, Capacity, Capital, Collateral, and Conditions. Analysts calculate Debt Service Coverage Ratios (DSCR) to gauge default risk.",
      example:
        "Commercial Loan Assessment:\nApplicant Annual Net Operating Income: $180,000\nAnnual Loan Debt Service (Principal + Interest): $120,000\nDebt Service Coverage Ratio (DSCR) = $180,000 / $120,000 = 1.50x\nDecision: DSCR of 1.50x exceeds bank minimum threshold of 1.25x (Favorable credit risk)",
    },
    {
      title: "Customer Advisory and AML/KYC Regulatory Compliance",
      content:
        "Banking officers provide structured financial advisory matching credit products to client debt capacity. Anti-Money Laundering (AML) and Know Your Customer (KYC) regulations require identifying beneficial owners and flagging suspicious transactions.",
      example:
        "Customer Advisory & Compliance Scenario:\nAdvisory: Advise commercial customer on fixed-rate equipment loan vs. revolving line of credit based on cash conversion cycle.\nAML Compliance: Customer makes rapid successive cash deposits just below statutory reporting threshold ($9,500 x 3). Officer files internal Suspicious Activity Report (SAR) per compliance mandate.",
    },
  ],

  // 16. Marketing: Digital Marketing and Web Analytics
  "Digital Marketing and Web Analytics": [
    {
      title: "Search Engine Optimization (SEO) and Keyword Placement",
      content:
        "Search Engine Optimization organizes web content so search engines can index and rank pages for relevant user queries. Marketers optimize title tags, meta descriptions, semantic header structures, and internal links.",
      example:
        "On-Page SEO Audit:\nPage Target: 'introductory mechanical engineering course'\nTitle Tag: 'Introduction to Mechanical Engineering | University Platform'\nMeta Description: 'Learn thermodynamics and fluid mechanics fundamentals with self-paced sample lessons.'\nH1 Header: Matches primary search keyword intent.",
    },
    {
      title: "Google Analytics Fundamentals and Traffic Acquisition",
      content:
        "Web analytics platforms like Google Analytics 4 (GA4) measure user traffic, acquisition channels (Organic, Paid, Direct, Referral), and engagement events. Marketers inspect user funnels to identify where visitors drop off.",
      example:
        "GA4 Traffic Acquisition Report Analysis:\nOrganic Search: 4,200 visitors, Conversion Rate: 3.8% (160 enrollments)\nPaid Social: 2,100 visitors, Conversion Rate: 1.5% (31 enrollments)\nInsight: Organic search traffic demonstrates higher conversion intent than paid social.",
    },
    {
      title: "Performance Marketing, Ad Testing, and A/B Split Testing",
      content:
        "Performance marketing focuses on measurable return on investment. Marketers calculate Return on Ad Spend (ROAS) and Customer Acquisition Cost (CAC) while running controlled A/B split-tests on ad creatives and landing pages.",
      example:
        "Performance Marketing Metrics:\nAd Campaign Spend: $1,200; Revenue Generated from Enrollments: $4,800\nReturn on Ad Spend (ROAS) = Revenue / Spend = $4,800 / $1,200 = 4.0x (or 400%)\nA/B Test: Headline Variant A has 2.4% CTR; Variant B has 3.6% CTR (Statistically significant 50% lift)",
    },
  ],

  // 17. Marketing: Content Strategy and Brand Communications
  "Content Strategy and Brand Communications": [
    {
      title: "Audience Persona Development and Customer Empathy Mapping",
      content:
        "Content strategists develop audience personas based on qualitative user research and demographic trends. Personas identify user goals, educational backgrounds, and common informational objections.",
      example:
        "Audience Persona Profile:\nPersona Name: 'Career-Transitioning Engineer'\nBackground: Experienced in mechanical drafting, seeking software and microcontroller skills\nCore Pain Point: Difficulty identifying which programming language to learn first\nContent Strategy: Produce guided pathway articles mapping C/C++ to hardware design",
    },
    {
      title: "Brand Positioning Statements and Value Proposition Messaging",
      content:
        "Brand communications articulate what makes an institution unique. A positioning statement clarifies the target audience, category reference, unique benefit, and reason to believe.",
      example:
        "Positioning Statement Formulation:\n'For university students seeking career direction, CareerPath is the academic guidance platform that directly connects target careers to verifiable foundational skills and course recommendations.'\nCore Value Proposition: Clarity, structure, and transparent academic exploration.",
    },
    {
      title: "Editorial Calendars, Content Taxonomy, and Copywriting",
      content:
        "Editorial strategy plans content publishing schedules across web, email, and social media channels. Content architecture organizes topics into logical categories (taxonomies), while clear copywriting drives user action.",
      example:
        "Editorial Calendar Matrix:\nWeek 1: Article: 'What Does a Manufacturing Engineer Do?' (Top of Funnel)\nWeek 2: Guide: 'Top 5 Skills in Lean Production and Quality Control' (Mid Funnel)\nWeek 3: Course Spotlight: 'Enroll in Lean Manufacturing & Process Engineering' (Call to Action)",
    },
  ],
};

export default function CourseLessons({ courseTitle }) {
  const [open, setOpen] = useState(false);

  const lessons =
    Object.prototype.hasOwnProperty.call(
      lessonsByCourse,
      courseTitle
    )
      ? lessonsByCourse[courseTitle]
      : [];

  return (
    <div className="cp-lessons">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Hide lessons" : "View lessons"}
      </button>

      {open && (
        <div>
          <div
            style={{
              padding: "6px 10px",
              margin: "6px 0 10px",
              borderRadius: "6px",
              background: "var(--cp-subtle-box, #edf5fe)",
              fontSize: "12px",
              color: "var(--cp-text-muted, #475569)",
              border: "1px solid var(--cp-subtle-box-border, #c7dcf5)",
            }}
          >
            <em>* Illustrative educational sample modules for academic exploration.</em>
          </div>

          {lessons.length === 0 ? (
            <p className="cp-subtle-text">
              Lessons for this course have not been added yet.
            </p>
          ) : (
            lessons.map((lesson, index) => (
              <section
                className="cp-lesson"
                key={lesson.title}
              >
                <h4>
                  Lesson {index + 1}: {lesson.title}
                </h4>

                <p>{lesson.content}</p>

                <pre>
                  <code>{lesson.example}</code>
                </pre>
              </section>
            ))
          )}
        </div>
      )}
    </div>
  );
}
