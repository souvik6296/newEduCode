# EduCode Platform

Welcome to **EduCode** – a modern, full-stack platform for managing universities, batches, students, courses, units, and questions. This project leverages **Node.js**, **Express**, **Supabase**, and **Firebase** to provide a robust backend API for educational content management.

---

## 🚀 Features

- **University Management:** Register, update, delete, and authenticate universities.
- **Batch Management:** Organize students into batches, assign to universities.
- **Student Management:** Register, update, delete, and authenticate students.
- **Course Metadata:** Manage course details and batch associations.
- **Units & Questions:** Store and retrieve units, sub-units, MCQs, and coding questions using Firebase Realtime Database.
- **RESTful API:** Well-structured endpoints for all resources.
- **API Testing Page:** Simple HTML interface for manual API testing.

---

## 🗂️ Project Structure

```
.
├── .gitignore
├── git-commands.js
├── struct.json
├── vercel.json
└── server/
    ├── index.js
    ├── index.html
    ├── package.json
    ├── supabase-client.js
    ├── firebase-config.js
    ├── university/
    │   ├── university-database.js
    │   └── university-middle-controler.js
    ├── batches/
    │   ├── batches-database.js
    │   └── batches-middle-controler.js
    ├── students/
    │   ├── student-database.js
    │   └── students-middle-controler.js
    ├── courses/
    │   ├── courses-database.js
    │   └── course-middle-controler.js
    └── units and questions/
        ├── firebase-database-connection.js
        └── units-and-questions-middle-controler.js
```

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL), [Firebase Realtime Database](https://firebase.google.com/products/realtime-database)
- **API Testing:** HTML/JS ([server/index.html](server/index.html))
- **Deployment:** [Vercel](https://vercel.com/)

---

## 📦 Installation

1. **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/your-repo.git
    cd your-repo/server
    ```

2. **Install dependencies:**
    ```sh
    npm install
    ```

3. **Configure environment:**
    - Supabase and Firebase credentials are already set in the code for demo purposes.
    - For production, move keys to environment variables and update the code accordingly.

4. **Run the server:**
    ```sh
    node index.js
    ```
    The server runs on [http://localhost:3000](http://localhost:3000).

---

## 🌐 API Endpoints

### Universities
- `GET    /universities` — List all universities
- `GET    /universities/:uid` — Get university by UID
- `POST   /universities` — Add a university
- `PUT    /universities/:uid` — Update university
- `DELETE /universities/:uid` — Delete university
- `POST   /universities/login` — University login

### Batches
- `GET    /batches` — List all batches
- `GET    /batches/university/:universityId` — Batches by university
- `GET    /batches/:batchId` — Get batch by ID
- `POST   /batches` — Add batch
- `PUT    /batches/:batchId` — Update batch
- `DELETE /batches/:batchId` — Delete batch

### Students
- `GET    /students` — List all students
- `GET    /students/:studentId` — Get student by ID
- `GET    /students/university/:uniId` — Students by university
- `GET    /students/batch/:batchId` — Students by batch
- `POST   /students` — Add student
- `PUT    /students/:studentId` — Update student
- `DELETE /students/:studentId` — Delete student
- `POST   /students/login` — Student login

### Courses Metadata
- `GET    /coursesmetadata` — List all courses
- `GET    /coursesmetadata/:courseId` — Get course by ID
- `GET    /coursesmetadata/batch/:batchId` — Courses by batch
- `POST   /coursesmetadata` — Add course
- `PUT    /coursesmetadata/:courseId` — Update course
- `DELETE /coursesmetadata/:courseId` — Delete course

### Units & Questions (Firebase)
- `POST   /courses` — Add full course (units & sub-units)
- `GET    /courses/:courseId` — Get course structure
- `PUT    /courses/:courseId` — Update course
- `DELETE /courses/:courseId` — Delete course
- `POST   /courses/:courseId/units` — Add unit
- `GET    /courses/:courseId/units` — Get all units
- `PUT    /courses/:courseId/units/:unitId` — Update unit
- `DELETE /courses/:courseId/units/:unitId` — Delete unit
- `POST   /courses/:courseId/units/:unitId/sub-units` — Add sub-unit
- `GET    /courses/:courseId/units/:unitId/sub-units` — Get all sub-units
- `PUT    /courses/:courseId/units/:unitId/sub-units/:subUnitId` — Update sub-unit
- `DELETE /courses/:courseId/units/:unitId/sub-units/:subUnitId` — Delete sub-unit

---

## 🧪 API Testing

Open [server/index.html](server/index.html) in your browser for a simple UI to test all API endpoints.

---

## 📄 Example Data Structure

See [`struct.json`](struct.json) for an example of the nested course/unit/sub-unit/question structure used in Firebase.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📜 License

This project is licensed under the [ISC License](server/package.json).

---

## 💡 Author

- **Your Name** — [Souvik Gupta](https://github.com/souvik6296)

---

## ⭐️ Show your support

Give a ⭐️ if you like this project!
