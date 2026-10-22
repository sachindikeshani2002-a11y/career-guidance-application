import { useState } from "react";

const lessonsByCourse = {
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
          {lessons.length === 0 ? (
            <p>
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