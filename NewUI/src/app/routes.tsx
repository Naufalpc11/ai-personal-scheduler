import { createBrowserRouter } from "react-router";
import { MainLayout } from "./components/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { TaskManager } from "./pages/TaskManager";
import { AITaskInput } from "./pages/AITaskInput";
import { Schedule } from "./pages/Schedule";
import { TaskDetail } from "./pages/TaskDetail";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "task-manager", Component: TaskManager },
      { path: "ai-generate", Component: AITaskInput },
      { path: "schedule", Component: Schedule },
      { path: "task/:id", Component: TaskDetail },
    ],
  },
]);
