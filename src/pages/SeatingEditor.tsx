import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Stage, Layer, Group, Rect, Text } from "react-konva";
import { Plus, Trash2, Armchair, Users } from "lucide-react";
import "./SeatingEditor.css";

type StudentRecord = Record<string, string>;

interface Desk {
  id: number;
  x: number;
  y: number;
  studentIndex: number | null;
}

interface LocationState {
  students?: StudentRecord[];
}

// Find a student's name using common Bromcom column headings
function getStudentName(student: StudentRecord, index: number): string {
  const keys = Object.keys(student);

  const findValue = (possibleNames: string[]) => {
    const key = keys.find((item) =>
      possibleNames.includes(item.toLowerCase().replace(/[^a-z0-9]/g, "")),
    );

    return key ? student[key]?.trim() : "";
  };

  const firstName = findValue([
    "firstname",
    "forename",
    "preferredfirstname",
    "knownas",
  ]);

  const lastName = findValue(["lastname", "surname", "familyname"]);

  const fullName = findValue(["studentname", "fullname", "name", "pupilname"]);

  const combinedName = [firstName, lastName].filter(Boolean).join(" ");

  return combinedName || fullName || `Student ${index + 1}`;
}

// Find a student's ID
function getStudentId(student: StudentRecord): string {
  const keys = Object.keys(student);

  const idKey = keys.find((key) =>
    ["studentid", "pupilid", "upn", "admissionnumber"].includes(
      key.toLowerCase().replace(/[^a-z0-9]/g, ""),
    ),
  );

  return idKey ? student[idKey] : "";
}

function SeatingEditor() {
  const location = useLocation();

  const students: StudentRecord[] =
    (location.state as LocationState | null)?.students ?? [];

  const [desks, setDesks] = useState<Desk[]>([]);
  const [selectedDeskId, setSelectedDeskId] = useState<number | null>(null);
  const [nextDeskId, setNextDeskId] = useState(1);
  const [frontPosition, setFrontPosition] = useState({ x: 300, y: 25 });

  const selectedDesk = desks.find((desk) => desk.id === selectedDeskId);

  const assignedStudentIndexes = desks
    .map((desk) => desk.studentIndex)
    .filter((index): index is number => index !== null);

  // Add a new desk
  const addDesk = () => {
    const newDesk: Desk = {
      id: nextDeskId,
      x: 40 + (desks.length % 5) * 175,
      y: 90 + Math.floor(desks.length / 5) * 120,
      studentIndex: null,
    };

    setDesks((previous) => [...previous, newDesk]);
    setSelectedDeskId(nextDeskId);
    setNextDeskId((previous) => previous + 1);
  };

  // Move a desk
  const moveDesk = (id: number, x: number, y: number) => {
    setDesks((previous) =>
      previous.map((desk) =>
        desk.id === id
          ? {
              ...desk,
              x: Math.max(10, Math.min(x, 830)),
              y: Math.max(60, Math.min(y, 540)),
            }
          : desk,
      ),
    );
  };

  // Assign a student to the selected desk
  const assignStudent = (value: string) => {
    if (selectedDeskId === null) return;

    const studentIndex = value === "" ? null : Number(value);

    setDesks((previous) =>
      previous.map((desk) => {
        if (desk.id === selectedDeskId) {
          return { ...desk, studentIndex };
        }

        if (studentIndex !== null && desk.studentIndex === studentIndex) {
          return { ...desk, studentIndex: null };
        }

        return desk;
      }),
    );
  };

  // Remove selected desk
  const removeDesk = () => {
    if (selectedDeskId === null) return;

    setDesks((previous) =>
      previous.filter((desk) => desk.id !== selectedDeskId),
    );

    setSelectedDeskId(null);
  };

  const seatedCount = assignedStudentIndexes.length;

  // Show this if no students have been imported
  if (students.length === 0) {
    return (
      <div className="seating-empty">
        <Armchair size={45} />
        <h2>No student records found</h2>
        <p>
          Please import your Bromcom CSV file before creating a seating plan.
        </p>

        <Link to="/import-students" className="back-to-import">
          Import students
        </Link>
      </div>
    );
  }

  return (
    <div className="seating-page">
      {/* Page header */}
      <header className="seating-header">
        <div>
          <p className="page-eyebrow">CLASSROOM MANAGEMENT</p>
          <h1>Classroom seating plan</h1>
          <p>Arrange desks and assign students to their seats.</p>
        </div>

        <div className="seating-header-count">
          <Users size={19} />
          <span>{students.length} students imported</span>
        </div>
      </header>

      <div className="seating-workspace">
        {/* Classroom area */}
        <main className="classroom-panel">
          <div className="classroom-toolbar">
            <div>
              <h2>Classroom layout</h2>
              <p>Drag desks to arrange your classroom.</p>
            </div>

            <button type="button" className="add-desk-button" onClick={addDesk}>
              <Plus size={18} />
              Add desk
            </button>
          </div>

          <div className="classroom-canvas">
            <Stage width={1000} height={650}>
              <Layer>
                {/* Classroom boundary */}
                <Rect
                  x={10}
                  y={10}
                  width={980}
                  height={630}
                  fill="#f8fafc"
                  stroke="#cbd5e1"
                  strokeWidth={3}
                  cornerRadius={12}
                />

                {/* Front of classroom */}
                <Group
                  x={frontPosition.x}
                  y={frontPosition.y}
                  draggable
                  onDragEnd={(event) => {
                    setFrontPosition({
                      x: event.target.x(),
                      y: event.target.y(),
                    });
                  }}
                >
                  <Rect
                    width={400}
                    height={12}
                    fill="#64748b"
                    cornerRadius={4}
                  />

                  <Text
                    y={20}
                    width={400}
                    text="FRONT OF CLASSROOM"
                    fontSize={13}
                    fill="#64748b"
                    align="center"
                  />
                </Group>

                {/* Desks */}
                {desks.map((desk) => {
                  const student =
                    desk.studentIndex !== null
                      ? students[desk.studentIndex]
                      : undefined;

                  const studentName =
                    student && desk.studentIndex !== null
                      ? getStudentName(student, desk.studentIndex)
                      : "Empty desk";

                  return (
                    <Group
                      key={desk.id}
                      x={desk.x}
                      y={desk.y}
                      draggable
                      onClick={() => setSelectedDeskId(desk.id)}
                      onTap={() => setSelectedDeskId(desk.id)}
                      onDragEnd={(event) => {
                        moveDesk(desk.id, event.target.x(), event.target.y());
                      }}
                    >
                      <Rect
                        width={150}
                        height={80}
                        fill={
                          selectedDeskId === desk.id
                            ? "#dbeafe"
                            : student
                              ? "#dcfce7"
                              : "#ffffff"
                        }
                        stroke={
                          selectedDeskId === desk.id ? "#2563eb" : "#94a3b8"
                        }
                        strokeWidth={2}
                        cornerRadius={10}
                      />

                      <Text
                        x={5}
                        y={12}
                        width={140}
                        text={`Desk ${desk.id}`}
                        fontSize={13}
                        fontStyle="bold"
                        fill="#475569"
                        align="center"
                      />

                      <Text
                        x={5}
                        y={35}
                        width={140}
                        height={35}
                        text={studentName}
                        fontSize={12}
                        fill="#0f172a"
                        align="center"
                        verticalAlign="middle"
                        wrap="word"
                      />
                    </Group>
                  );
                })}
              </Layer>
            </Stage>
          </div>

          <div className="classroom-footer">
            <span>{desks.length} desks created</span>
            <span>{seatedCount} students seated</span>
          </div>
        </main>

        {/* Desk settings and student list */}
        <aside className="seating-sidebar">
          <div className="sidebar-heading">
            <h2>Desk settings</h2>
            <p>Select a desk to manage its student.</p>
          </div>

          {selectedDesk ? (
            <div className="desk-settings">
              <div className="selected-desk">
                <Armchair size={22} />

                <div>
                  <strong>Desk {selectedDesk.id}</strong>
                  <span>
                    {selectedDesk.studentIndex !== null
                      ? "Student assigned"
                      : "No student assigned"}
                  </span>
                </div>
              </div>

              <label htmlFor="student-assignment">Assign student</label>

              <select
                id="student-assignment"
                value={selectedDesk.studentIndex ?? ""}
                onChange={(event) => assignStudent(event.target.value)}
              >
                <option value="">No student assigned</option>

                {students.map((student: StudentRecord, index: number) => (
                  <option key={index} value={index}>
                    {getStudentName(student, index)}
                    {getStudentId(student) ? ` (${getStudentId(student)})` : ""}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="remove-desk-button"
                onClick={removeDesk}
              >
                <Trash2 size={17} />
                Remove desk
              </button>
            </div>
          ) : (
            <div className="no-desk-selected">
              <Armchair size={30} />
              <p>Select a desk in the classroom to manage it.</p>
            </div>
          )}

          {/* Student list */}
          <div className="student-list-section">
            <h3>Class list</h3>

            <div className="student-progress">
              <div className="progress-label">
                <span>Students seated</span>
                <strong>
                  {seatedCount}/{students.length}
                </strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${(seatedCount / students.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="class-list">
              {students.map((student: StudentRecord, index: number) => {
                const isAssigned = assignedStudentIndexes.includes(index);

                return (
                  <div className="class-list-item" key={index}>
                    <div>
                      <strong>{getStudentName(student, index)}</strong>

                      {getStudentId(student) && (
                        <span>{getStudentId(student)}</span>
                      )}
                    </div>

                    <span
                      className={
                        isAssigned
                          ? "student-status assigned"
                          : "student-status waiting"
                      }
                    >
                      {isAssigned ? "Seated" : "Waiting"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default SeatingEditor;
