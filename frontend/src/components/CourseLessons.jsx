import { useState } from "react";

const lessonsByCourse = {
  "Git and Version Control": [
    {
      title: "What is Git?",
      content:
        "Git tracks changes to project files. A repository stores your project history. Each commit records a snapshot of the staged changes.",
      example: "git status",
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
      example: "git switch -c feature/profile",
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

  "Python for Data Analysis": [
    {
      title: "Variables",
      content:
        "Variables refer to values. Python can work with text, numbers and other data types. print displays a value.",
      example: 'name = "Student"\nscore = 85\nprint(name, score)',
    },
    {
      title: "Lists",
      content:
        "A list stores multiple values in order. You can access an item using its index. The first index is zero.",
      example: "marks = [70, 85, 90]\nprint(marks[0])",
    },
    {
      title: "Calculate an average",
      content:
        "sum adds the numbers in a list. len gives the number of items. Divide the total by the count to calculate the average of a non-empty list.",
      example:
        "marks = [70, 85, 90]\naverage = sum(marks) / len(marks)\nprint(average)",
    },
  ],
};

export default function CourseLessons({ courseTitle }) {
  const [open, setOpen] = useState(false);
  const lessons = lessonsByCourse[courseTitle] || [];

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
            <p>Lessons for this course have not been added yet.</p>
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