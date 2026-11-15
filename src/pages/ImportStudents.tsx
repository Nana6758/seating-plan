import { useNavigate } from "react-router-dom";
import { useState, type ChangeEvent } from "react";
import Papa from "papaparse";

import {
  Upload,
  FileSpreadsheet,
  Users,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";

import "./ImportStudents.css";

type StudentRecord = Record<string, string>;

function ImportStudents() {
  const navigate = useNavigate();

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Handle CSV file upload
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Reset previous import
    setErrors([]);
    setStudents([]);
    setColumns([]);
    setFileName("");

    // Check file type
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setErrors(["Please select a CSV file exported from Bromcom."]);
      event.target.value = "";
      return;
    }

    setLoading(true);

    // Read and process CSV file
    Papa.parse<StudentRecord>(file, {
      header: true,
      skipEmptyLines: "greedy",

      transformHeader: (header) => header.trim(),

      complete: (results) => {
        const headers = results.meta.fields ?? [];

        const importedStudents = results.data.filter((student) =>
          Object.values(student).some(
            (value) => String(value ?? "").trim() !== "",
          ),
        );

        const parsingErrors = results.errors.map(
          (error) => `Row ${error.row ?? "unknown"}: ${error.message}`,
        );

        if (headers.length === 0) {
          setErrors(["The CSV file does not contain any column headings."]);
          setLoading(false);
          return;
        }

        if (importedStudents.length === 0) {
          setErrors(["No student records were found in this CSV file."]);
          setLoading(false);
          return;
        }

        setColumns(headers);
        setStudents(importedStudents);
        setFileName(file.name);
        setErrors(parsingErrors);
        setLoading(false);
      },

      error: (error) => {
        setErrors([error.message]);
        setLoading(false);
      },
    });
  };

  // Remove imported file and reset the page
  const clearImport = () => {
    setStudents([]);
    setColumns([]);
    setFileName("");
    setErrors([]);

    const fileInput = document.getElementById(
      "csv-upload",
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Continue to seating editor
  const goToSeatingEditor = () => {
    navigate("/seating-editor", {
      state: { students },
    });
  };

  return (
    <div className="import-page">
      {/* Page heading */}
      <div className="import-header">
        <div>
          <p className="page-eyebrow">CLASSROOM MANAGEMENT</p>

          <h1>Import students</h1>

          <p>
            Upload your Bromcom class list to begin creating your seating plan.
          </p>
        </div>
      </div>

      {/* CSV upload card */}
      <div className="import-card">
        <div className="import-icon">
          <FileSpreadsheet size={28} />
        </div>

        <h2>Upload Bromcom CSV</h2>

        <p className="upload-description">
          Select a CSV file containing your student information. Your column
          headings will be detected automatically.
        </p>

        <label className="upload-area" htmlFor="csv-upload">
          <Upload size={30} />

          <span className="upload-main-text">
            Click to select your CSV file
          </span>

          <span className="upload-sub-text">CSV files only</span>

          <input
            id="csv-upload"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileUpload}
            disabled={loading}
          />
        </label>

        {/* Loading message */}
        {loading && (
          <p className="loading-message">Reading student records...</p>
        )}

        {/* Successful file upload */}
        {fileName && (
          <div className="file-success">
            <CheckCircle2 size={19} />

            <div>
              <strong>{fileName}</strong>
              <span>File successfully processed</span>
            </div>

            <button
              type="button"
              onClick={clearImport}
              aria-label="Remove imported file"
            >
              <X size={19} />
            </button>
          </div>
        )}

        {/* Import errors */}
        {errors.length > 0 && (
          <div className="import-errors" role="alert">
            <AlertCircle size={19} />

            <div>
              <strong>Import messages</strong>

              <ul>
                {errors.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Student records preview */}
      {students.length > 0 && (
        <div className="student-preview">
          <div className="preview-header">
            <div>
              <h2>Student records</h2>
              <p>Review your imported class list.</p>
            </div>

            <div className="student-count">
              <Users size={19} />

              <strong>{students.length}</strong>

              <span>Students</span>
            </div>
          </div>

          {/* Student data table */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>

                  {columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {students.slice(0, 10).map((student, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>

                    {columns.map((column) => (
                      <td key={column}>{student[column] ?? ""}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Preview information */}
          {students.length > 10 && (
            <p className="preview-note">
              Showing the first 10 of {students.length} students. All records
              have been read.
            </p>
          )}

          {/* Action buttons */}
          <div className="preview-actions">
            <button
              type="button"
              className="continue-button"
              onClick={goToSeatingEditor}
            >
              Continue to seating editor
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportStudents;
