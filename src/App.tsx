import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import EditUserPage from "./pages/EditUserPage";
import NotFoundPage from "./pages/NotFoundPage";
import UserDetailsPage from "./pages/UserDetailsPage";
import UsersPage from "./pages/UsersPage";

/**
 * ============================================================================
 *  ROUTES - THIS IS THE ONE PLACE WHERE THE APP'S PAGES (URLs) ARE DEFINED
 * ============================================================================
 * A route maps a browser URL to a React component (a "page").
 * This is the frontend twin of backend/src/routes/user.routes.ts:
 *
 *   Backend (Express)                      Frontend (React Router)
 *   router.get("/:id", controller)   <->   <Route path="/users/:id" element={<UserDetailsPage />} />
 *
 *  URL (browser)           Page component        What it does                      API call it makes
 *  ----------------------  --------------------  --------------------------------  -------------------
 *  /                       (redirect)            sends you to /users
 *  /users                  UsersPage             list, search, add, delete         GET/POST/DELETE /api/users
 *  /users/:id              UserDetailsPage       view one user                     GET /api/users/:id
 *  /users/:id/edit         EditUserPage          prefilled form, save changes      GET + PATCH /api/users/:id
 *  *  (anything else)      NotFoundPage          friendly 404 page                 -
 *
 *  ":id" is a URL PARAMETER (same idea as Express's req.params.id). Inside the page we read it with
 *  useParams(). Example: URL /users/665f1c2e8b3a4d0012345678 -> useParams().id === "665f1c2e8b3a4d0012345678"
 *
 *  IMPORTANT: these are FRONTEND URLs (http://localhost:5173/users/123). They are NOT the backend
 *  endpoints (http://localhost:5000/api/users/123). The browser URL picks which screen to show; the
 *  page then calls the backend API to get its data.
 * ============================================================================
 */
export default function App() {
  return (
    <Routes>
      {/* Layout route: renders Navbar once, and <Outlet /> is where the matching child page appears. */}
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/users" replace />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/users/:id" element={<UserDetailsPage />} />
        <Route path="/users/:id/edit" element={<EditUserPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

/** Shared page frame: the navbar stays on screen while only the <Outlet /> content changes. */
function Layout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
