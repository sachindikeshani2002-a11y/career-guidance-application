import heroAuth from "../assets/images/hero-auth.svg";

import careerSoftwareDev from "../assets/images/career-software-developer.svg";
import careerDataAnalyst from "../assets/images/career-data-analyst.svg";
import careerUiux from "../assets/images/career-uiux-designer.svg";
import careerDefault from "../assets/images/career-default.svg";

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
 * Returns a locally hosted, vector-optimized thumbnail for career paths.
 */
export function getCareerImage(title) {
  const clean = String(title || "").toLowerCase();
  if (clean.includes("software") || clean.includes("developer")) {
    return careerSoftwareDev;
  }
  if (clean.includes("data") || clean.includes("analyst")) {
    return careerDataAnalyst;
  }
  if (
    clean.includes("ui") ||
    clean.includes("ux") ||
    clean.includes("design")
  ) {
    return careerUiux;
  }
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
