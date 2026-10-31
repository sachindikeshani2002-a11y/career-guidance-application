import heroAuth from "../assets/images/hero-auth.svg";

// 18 Distinct Career-Specific Vector Illustrations
import careerCivilEngineer from "../assets/images/career-civil-engineer.svg";
import careerMechanicalEngineer from "../assets/images/career-mechanical-engineer.svg";
import careerElectricalEngineer from "../assets/images/career-electrical-engineer.svg";
import careerComputerEngineer from "../assets/images/career-computer-engineer.svg";
import careerManufacturingEngineer from "../assets/images/career-manufacturing-engineer.svg";
import careerSoftwareDev from "../assets/images/career-software-developer.svg";
import careerDataAnalyst from "../assets/images/career-data-analyst.svg";
import careerCybersecurityAnalyst from "../assets/images/career-cybersecurity-analyst.svg";
import careerBusinessAnalyst from "../assets/images/career-business-analyst.svg";
import careerProjectCoordinator from "../assets/images/career-project-coordinator.svg";
import careerHrExecutive from "../assets/images/career-hr-executive.svg";
import careerAccountant from "../assets/images/career-accountant.svg";
import careerFinancialAnalyst from "../assets/images/career-financial-analyst.svg";
import careerBankingOfficer from "../assets/images/career-banking-officer.svg";
import careerDigitalMarketing from "../assets/images/career-digital-marketing.svg";
import careerContentStrategist from "../assets/images/career-content-strategist.svg";
import careerMarketingExecutive from "../assets/images/career-marketing-executive.svg";
import careerUiux from "../assets/images/career-uiux-designer.svg";

// Generic Fallback (Used only when a career title is unknown)
import careerDefault from "../assets/images/career-default.svg";

// Course Thumbnails
import courseJs from "../assets/images/course-javascript.svg";
import coursePython from "../assets/images/course-python.svg";
import courseUiux from "../assets/images/course-uiux.svg";
import courseGit from "../assets/images/course-git.svg";
import courseDatabase from "../assets/images/course-database.svg";
import courseStats from "../assets/images/course-statistics.svg";
import courseDataviz from "../assets/images/course-dataviz.svg";
import courseUserResearch from "../assets/images/course-user-research.svg";
import courseDefault from "../assets/images/course-default.svg";

export { heroAuth, careerDefault, courseDefault };

/**
 * Normalized exact-match lookup dictionary for all 18 catalog careers.
 */
const EXACT_CAREER_MAP = {
  "civil engineer": careerCivilEngineer,
  "mechanical engineer": careerMechanicalEngineer,
  "electrical and electronic engineer": careerElectricalEngineer,
  "electrical engineer": careerElectricalEngineer,
  "electronic engineer": careerElectricalEngineer,
  "computer engineer": careerComputerEngineer,
  "manufacturing engineer": careerManufacturingEngineer,
  "software developer": careerSoftwareDev,
  "data analyst": careerDataAnalyst,
  "cybersecurity analyst": careerCybersecurityAnalyst,
  "business analyst": careerBusinessAnalyst,
  "project coordinator": careerProjectCoordinator,
  "human resources executive": careerHrExecutive,
  "hr executive": careerHrExecutive,
  "accountant": careerAccountant,
  "financial analyst": careerFinancialAnalyst,
  "banking officer": careerBankingOfficer,
  "digital marketing executive": careerDigitalMarketing,
  "content strategist": careerContentStrategist,
  "marketing executive": careerMarketingExecutive,
  "ui/ux designer": careerUiux,
  "ui / ux designer": careerUiux,
  "ui/ux design": careerUiux,
};

/**
 * Returns a locally hosted, vector-optimized thumbnail for career paths.
 * Every known career resolves to its distinct artwork.
 * careerDefault is retained strictly as a fallback for unknown titles.
 */
export function getCareerImage(title) {
  const clean = String(title || "")
    .trim()
    .toLowerCase();

  if (!clean) {
    return careerDefault;
  }

  // 1. Direct dictionary lookup for exact catalog matches
  if (EXACT_CAREER_MAP[clean]) {
    return EXACT_CAREER_MAP[clean];
  }

  // 2. Specific pattern-based matching for variants or composite titles
  // Engineering Field
  if (clean.includes("civil")) {
    return careerCivilEngineer;
  }
  if (clean.includes("mechanical")) {
    return careerMechanicalEngineer;
  }
  if (clean.includes("electrical") || clean.includes("electronic")) {
    return careerElectricalEngineer;
  }
  if (clean.includes("computer engineer") || clean.includes("hardware engineer")) {
    return careerComputerEngineer;
  }
  if (clean.includes("manufacturing") || clean.includes("industrial engineer")) {
    return careerManufacturingEngineer;
  }

  // IT & Computing Field
  if (clean.includes("cyber") || clean.includes("security") || clean.includes("infosec")) {
    return careerCybersecurityAnalyst;
  }
  if (clean.includes("software") || clean.includes("developer") || clean.includes("programmer") || clean.includes("full stack")) {
    return careerSoftwareDev;
  }
  if (clean.includes("data") && clean.includes("analyst")) {
    return careerDataAnalyst;
  }

  // Business & Management Field
  if (clean.includes("business analyst")) {
    return careerBusinessAnalyst;
  }
  if (clean.includes("project coordinator") || clean.includes("project manager") || clean.includes("scrum")) {
    return careerProjectCoordinator;
  }
  if (clean.includes("human resources") || clean.includes("hr executive") || clean.includes("talent acquisition") || clean.includes("recruiter")) {
    return careerHrExecutive;
  }

  // Finance & Accounting Field
  if (clean.includes("accountant") || clean.includes("accounting") || clean.includes("auditor") || clean.includes("bookkeeper")) {
    return careerAccountant;
  }
  if (clean.includes("financial analyst") || clean.includes("finance analyst") || clean.includes("investment analyst")) {
    return careerFinancialAnalyst;
  }
  if (clean.includes("banking") || clean.includes("bank officer") || clean.includes("banker")) {
    return careerBankingOfficer;
  }

  // Marketing & Media Field
  if (clean.includes("digital marketing") || clean.includes("seo") || clean.includes("sem") || clean.includes("growth marketing")) {
    return careerDigitalMarketing;
  }
  if (clean.includes("content strategist") || clean.includes("copywriter") || clean.includes("editorial")) {
    return careerContentStrategist;
  }
  if (clean.includes("marketing executive") || clean.includes("marketing manager") || clean.includes("marketing specialist") || clean.includes("brand strategist")) {
    return careerMarketingExecutive;
  }
  if (clean.includes("ui") || clean.includes("ux") || clean.includes("product designer") || clean.includes("user experience")) {
    return careerUiux;
  }

  // Fallback for any unknown title
  return careerDefault;
}

/**
 * Returns a locally hosted, vector-optimized thumbnail for courses.
 */
export function getCourseImage(title) {
  const clean = String(title || "").toLowerCase();
  if (clean.includes("javascript")) {
    return courseJs;
  }
  if (clean.includes("python")) {
    return coursePython;
  }
  if (
    clean.includes("ui/ux") ||
    clean.includes("wireframing") ||
    clean.includes("prototype")
  ) {
    return courseUiux;
  }
  if (clean.includes("git") || clean.includes("version control")) {
    return courseGit;
  }
  if (clean.includes("database") || clean.includes("sql")) {
    return courseDatabase;
  }
  if (clean.includes("statistics") || clean.includes("probability")) {
    return courseStats;
  }
  if (clean.includes("visualization") || clean.includes("chart")) {
    return courseDataviz;
  }
  if (clean.includes("user research") || clean.includes("interview")) {
    return courseUserResearch;
  }
  return courseDefault;
}
