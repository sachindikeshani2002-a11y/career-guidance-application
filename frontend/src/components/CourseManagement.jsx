import { useCallback, useEffect, useState } from "react";
import { getCourseImage, courseDefault } from "../utils/imageMapper";

const API_BASE = "http://localhost:5001/api/courses";

const VALID_LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function CourseManagement({ token, onLogout }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  // Search, filter, and sort state
  const [searchText, setSearchText] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [sortBy, setSortBy] = useState("title-asc");

  // Feedback notifications
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Modal / Form state: mode is null, "create", or "edit"
  const [formMode, setFormMode] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    description: "",
    level: "Beginner",
    skills: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation state
  const [deletingCourse, setDeletingCourse] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch all courses
  useEffect(() => {
    const controller = new AbortController();

    async function loadCourses() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(API_BASE, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        if (response.status === 401) {
          onLogout();
          return;
        }

        const data = await response.json();

        if (controller.signal.aborted) return;

        if (!response.ok) {
          throw new Error(data.message || "Unable to load courses");
        }

        if (!Array.isArray(data.courses)) {
          throw new Error("Invalid course data received from server");
        }

        setCourses(data.courses);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof TypeError
            ? "Cannot connect to the backend. Please check port 5001."
            : err.message
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadCourses();

    return () => controller.abort();
  }, [token, onLogout, attempt]);

  // Prevent background page scrolling while any modal is open, restoring when closed or unmounted
  useEffect(() => {
    const isModalOpen = formMode !== null || deletingCourse !== null;
    if (!isModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [formMode, deletingCourse]);

  const handleCloseForm = useCallback(() => {
    if (submitting) return;
    setFormMode(null);
    setFormErrors({});
  }, [submitting]);

  const handleCloseDelete = useCallback(() => {
    if (deleting) return;
    setDeletingCourse(null);
  }, [deleting]);

  // Keyboard accessibility: Close modals on Escape key when not submitting/deleting
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        if (formMode !== null && !submitting) {
          handleCloseForm();
        } else if (deletingCourse !== null && !deleting) {
          handleCloseDelete();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [formMode, deletingCourse, submitting, deleting, handleCloseForm, handleCloseDelete]);

  function refreshCourses() {
    setAttempt((v) => v + 1);
  }

  function clearMessages() {
    setSuccessMessage("");
    setErrorMessage("");
  }

  // Client-side validation matching backend rules
  function validateForm() {
    const errors = {};
    const cleanTitle = formData.title.trim();
    const cleanDesc = formData.description.trim();

    if (!cleanTitle) {
      errors.title = "Course title is required.";
    } else if (cleanTitle.length < 2 || cleanTitle.length > 100) {
      errors.title = "Title must contain between 2 and 100 characters.";
    }

    if (!cleanDesc) {
      errors.description = "Course description is required.";
    } else if (cleanDesc.length < 10 || cleanDesc.length > 1000) {
      errors.description =
        "Description must contain between 10 and 1000 characters.";
    }

    if (!VALID_LEVELS.includes(formData.level)) {
      errors.level = "Select a valid course level.";
    }

    const rawSkills = formData.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (rawSkills.length > 20) {
      errors.skills = "A course can list at most 20 skills.";
    } else {
      for (const skill of rawSkills) {
        if (skill.length > 60) {
          errors.skills =
            "Each skill name must not exceed 60 characters.";
          break;
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // Open Create Form
  function handleOpenCreate() {
    clearMessages();
    setFormErrors({});
    setFormData({
      id: null,
      title: "",
      description: "",
      level: "Beginner",
      skills: "",
    });
    setFormMode("create");
  }

  // Open Edit Form prefilled with course data
  function handleOpenEdit(course) {
    clearMessages();
    setFormErrors({});
    setFormData({
      id: course._id,
      title: course.title || "",
      description: course.description || "",
      level: course.level || "Beginner",
      skills: Array.isArray(course.skills)
        ? course.skills.join(", ")
        : "",
    });
    setFormMode("edit");
  }

  // Submit Create or Update
  async function handleFormSubmit(event) {
    event.preventDefault();
    clearMessages();

    if (submitting) return;

    if (!validateForm()) return;

    setSubmitting(true);

    const isEdit = formMode === "edit";
    const cleanTitle = formData.title.trim();
    const cleanDesc = formData.description.trim();
    const skillsList = formData.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title: cleanTitle,
      description: cleanDesc,
      level: formData.level,
      skills: skillsList,
    };

    const targetUrl = isEdit
      ? `${API_BASE}/${formData.id}`
      : API_BASE;
    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(targetUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        onLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isEdit
              ? "Unable to update course"
              : "Unable to create course")
        );
      }

      setSuccessMessage(
        isEdit
          ? `Course "${cleanTitle}" updated successfully.`
          : `Course "${cleanTitle}" created successfully.`
      );

      setFormMode(null);
      refreshCourses();
    } catch (err) {
      setErrorMessage(
        err instanceof TypeError
          ? "Cannot connect to the backend. Please check port 5001."
          : err.message
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Open Delete Confirmation Dialog
  function handleOpenDelete(course) {
    clearMessages();
    setDeletingCourse(course);
  }

  // Execute Safe Delete
  async function handleConfirmDelete() {
    if (!deletingCourse || deleting) return;

    setDeleting(true);
    clearMessages();

    try {
      const response = await fetch(
        `${API_BASE}/${deletingCourse._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        onLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        // Backend returned explanation (e.g., 409 Conflict with enrollmentCount)
        throw new Error(
          data.message || "Failed to delete course."
        );
      }

      setSuccessMessage(
        `Course "${deletingCourse.title}" deleted successfully.`
      );
      setDeletingCourse(null);
      refreshCourses();
    } catch (err) {
      setErrorMessage(
        err instanceof TypeError
          ? "Cannot connect to the backend. Please check port 5001."
          : err.message
      );
      setDeletingCourse(null);
    } finally {
      setDeleting(false);
    }
  }

  function resetFilters() {
    setSearchText("");
    setLevelFilter("All");
    setSortBy("title-asc");
  }

  // Filter and sort the courses list
  const query = searchText.trim().toLowerCase();

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      !query ||
      [
        course.title,
        course.description,
        ...(Array.isArray(course.skills) ? course.skills : []),
      ].some((val) =>
        String(val || "").toLowerCase().includes(query)
      );

    const matchesLevel =
      levelFilter === "All" || course.level === levelFilter;

    return matchesSearch && matchesLevel;
  });

  const levelRank = {
    Beginner: 1,
    Intermediate: 2,
    Advanced: 3,
  };

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "title-asc":
        return a.title.localeCompare(b.title);
      case "title-desc":
        return b.title.localeCompare(a.title);
      case "level-asc":
        return (
          (levelRank[a.level] || 0) -
            (levelRank[b.level] || 0) ||
          a.title.localeCompare(b.title)
        );
      case "level-desc":
        return (
          (levelRank[b.level] || 0) -
            (levelRank[a.level] || 0) ||
          a.title.localeCompare(b.title)
        );
      case "newest":
        return (
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
      default:
        return a.title.localeCompare(b.title);
    }
  });

  return (
    <section className="cp-panel cp-admin-courses">
      <div className="cp-admin-header">
        <div>
          <h2>Course Management</h2>
          <p>
            Add new courses, update details, and safely manage
            the university course catalog.
          </p>
        </div>

        <button
          type="button"
          className="cp-btn-primary cp-btn-add"
          onClick={handleOpenCreate}
          disabled={loading || formMode !== null}
        >
          + Add New Course
        </button>
      </div>

      {/* Global Notifications */}
      {successMessage && (
        <div className="cp-banner-success" role="status">
          <span>✓</span>
          <p>{successMessage}</p>
          <button
            type="button"
            className="cp-banner-close"
            onClick={() => setSuccessMessage("")}
            aria-label="Dismiss success message"
          >
            ×
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="cp-banner-error" role="alert">
          <span>⚠</span>
          <p>{errorMessage}</p>
          <button
            type="button"
            className="cp-banner-close"
            onClick={() => setErrorMessage("")}
            aria-label="Dismiss error message"
          >
            ×
          </button>
        </div>
      )}

      {/* Course List Controls: Search, Level Filter, Sort */}
      <div className="cp-course-controls">
        <div>
          <label htmlFor="admin-course-search">Search courses</label>
          <input
            id="admin-course-search"
            type="search"
            placeholder="Search title, description or skills..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="admin-course-level">Filter Level</label>
          <select
            id="admin-course-level"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="All">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label htmlFor="admin-course-sort">Sort By</label>
          <select
            id="admin-course-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="title-asc">Title: A to Z</option>
            <option value="title-desc">Title: Z to A</option>
            <option value="level-asc">
              Level: Beginner to Advanced
            </option>
            <option value="level-desc">
              Level: Advanced to Beginner
            </option>
            <option value="newest">Recently Added</option>
          </select>
        </div>

        <button
          type="button"
          className="cp-btn-secondary"
          onClick={resetFilters}
        >
          Reset Filters
        </button>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <p className="cp-loading-text" role="status">
          Loading course catalog...
        </p>
      )}

      {!loading && error && (
        <div className="cp-status-block">
          <p role="alert">{error}</p>
          <button type="button" onClick={refreshCourses}>
            Try Again
          </button>
        </div>
      )}

      {/* Course Cards Grid */}
      {!loading && !error && (
        <>
          <p className="cp-count-summary" role="status">
            Showing {sortedCourses.length} of {courses.length} courses
          </p>

          {courses.length === 0 && (
            <p className="cp-empty-text">
              No courses exist in the catalog. Click "+ Add New Course"
              above to create your first course.
            </p>
          )}

          {courses.length > 0 && sortedCourses.length === 0 && (
            <p className="cp-empty-text">
              No courses match your filter criteria. Try resetting
              filters.
            </p>
          )}

          <div className="cp-cards">
            {sortedCourses.map((course) => (
              <article
                className="cp-card cp-admin-card"
                key={course._id}
              >
                <div className="cp-thumbnail-container">
                  <img
                    src={getCourseImage(course.title)}
                    alt={`${course.title} thumbnail`}
                    className="cp-card-thumbnail"
                    width="400"
                    height="200"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = courseDefault;
                    }}
                  />
                  <span className={`cp-level-badge cp-level-${String(course.level).toLowerCase()}`}>
                    {course.level}
                  </span>
                </div>

                <div className="cp-card-body">
                  <div className="cp-admin-card-action-bar">
                    <h3>{course.title}</h3>
                    <div className="cp-card-actions">
                      <button
                        type="button"
                        className="cp-btn-edit"
                        onClick={() => handleOpenEdit(course)}
                        disabled={submitting || deleting}
                        aria-label={`Edit ${course.title}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="cp-btn-delete"
                        onClick={() => handleOpenDelete(course)}
                        disabled={submitting || deleting}
                        aria-label={`Delete ${course.title}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="cp-card-description">{course.description}</p>

                  <h4>Skills Covered</h4>
                  {Array.isArray(course.skills) &&
                  course.skills.length > 0 ? (
                    <ul className="cp-skill-pills">
                      {course.skills.map((skill) => (
                        <li key={skill} className="cp-pill-general">{skill}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="cp-subtle-text">
                      No skills specified.
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {/* Add / Edit Course Modal Form */}
      {formMode !== null && (
        <div
          className="cp-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="course-form-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) {
              handleCloseForm();
            }
          }}
        >
          <div className="cp-modal-content">
            <div className="cp-modal-header">
              <h3 id="course-form-title">
                {formMode === "edit"
                  ? `Edit Course: ${formData.title || "Course"}`
                  : "Add New Course"}
              </h3>
              <button
                type="button"
                className="cp-modal-close"
                onClick={handleCloseForm}
                disabled={submitting}
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>

            <form
              className="cp-course-form"
              onSubmit={handleFormSubmit}
              noValidate
            >
              <div className="cp-modal-body">
                <div className="cp-form-group">
                  <label htmlFor="course-title-input">
                    Course Title <span className="cp-required" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="course-title-input"
                    type="text"
                    placeholder="e.g. Cloud Computing & Kubernetes"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        title: e.target.value,
                      })
                    }
                    required
                    maxLength={100}
                    disabled={submitting}
                    aria-invalid={!!formErrors.title}
                    aria-describedby={
                      formErrors.title
                        ? "course-title-error"
                        : "course-title-count"
                    }
                  />
                  <div className="cp-field-footer">
                    {formErrors.title ? (
                      <span
                        id="course-title-error"
                        className="cp-field-error"
                        role="alert"
                      >
                        {formErrors.title}
                      </span>
                    ) : <span />}
                    <small id="course-title-count" className="cp-char-count">
                      {formData.title.length}/100 characters
                    </small>
                  </div>
                </div>

                <div className="cp-form-group">
                  <label htmlFor="course-desc-input">
                    Description <span className="cp-required" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="course-desc-input"
                    rows={5}
                    placeholder="Provide an overview of the curriculum and learning outcomes..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    required
                    maxLength={1000}
                    disabled={submitting}
                    aria-invalid={!!formErrors.description}
                    aria-describedby={
                      formErrors.description
                        ? "course-desc-error"
                        : "course-desc-count"
                    }
                  />
                  <div className="cp-field-footer">
                    {formErrors.description ? (
                      <span
                        id="course-desc-error"
                        className="cp-field-error"
                        role="alert"
                      >
                        {formErrors.description}
                      </span>
                    ) : <span />}
                    <small id="course-desc-count" className="cp-char-count">
                      {formData.description.length}/1000 characters (min 10)
                    </small>
                  </div>
                </div>

                <div className="cp-form-group">
                  <label htmlFor="course-level-input">
                    Difficulty Level <span className="cp-required" aria-hidden="true">*</span>
                  </label>
                  <select
                    id="course-level-input"
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        level: e.target.value,
                      })
                    }
                    disabled={submitting}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  {formErrors.level && (
                    <div className="cp-field-footer">
                      <span className="cp-field-error" role="alert">
                        {formErrors.level}
                      </span>
                    </div>
                  )}
                </div>

                <div className="cp-form-group">
                  <label htmlFor="course-skills-input">
                    Skills Covered
                  </label>
                  <input
                    id="course-skills-input"
                    type="text"
                    placeholder="e.g. Docker, Kubernetes, CI/CD"
                    value={formData.skills}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        skills: e.target.value,
                      })
                    }
                    disabled={submitting}
                    aria-describedby="course-skills-help"
                  />
                  <small id="course-skills-help" className="cp-field-help">
                    Separate skills with commas (max 20 skills, 60 characters each).
                  </small>
                  {formErrors.skills && (
                    <span
                      id="course-skills-error"
                      className="cp-field-error"
                      role="alert"
                    >
                      {formErrors.skills}
                    </span>
                  )}
                </div>
              </div>

              <div className="cp-modal-footer">
                <button
                  type="button"
                  className="cp-btn-secondary"
                  onClick={handleCloseForm}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cp-btn-primary"
                  disabled={submitting}
                >
                  {submitting
                    ? formMode === "edit"
                      ? "Saving Changes..."
                      : "Creating Course..."
                    : formMode === "edit"
                      ? "Save Changes"
                      : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingCourse && (
        <div
          className="cp-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleting) {
              handleCloseDelete();
            }
          }}
        >
          <div className="cp-modal-content cp-modal-danger">
            <div className="cp-modal-header">
              <h3 id="delete-dialog-title">Confirm Deletion</h3>
              <button
                type="button"
                className="cp-modal-close"
                onClick={handleCloseDelete}
                disabled={deleting}
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>

            <div className="cp-dialog-body">
              <p>
                Are you sure you want to permanently delete the
                course:
              </p>
              <p className="cp-dialog-highlight">
                "{deletingCourse.title}"
              </p>
              <div className="cp-notice-box">
                <strong>Referential Integrity Note:</strong> If any
                students are currently enrolled in or have completed
                this course, deletion will be safely rejected by the
                server to protect their academic learning history.
              </div>
            </div>

            <div className="cp-modal-footer">
              <button
                type="button"
                className="cp-btn-secondary"
                onClick={handleCloseDelete}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="cp-btn-danger"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
