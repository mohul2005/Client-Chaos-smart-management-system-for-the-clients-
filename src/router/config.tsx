import { Navigate, type RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import Features from "../pages/features/page";
import Pricing from "../pages/pricing/page";
import Contact from "../pages/contact/page";
import AuthPage from "../pages/auth/page";
import AppLayout from "../pages/app/layout";
import BoardPage from "../pages/app/board/page";
import ClientsPage from "../pages/app/clients/page";
import TeamPage from "../pages/app/team/page";
import RequireAuth from "../components/feature/RequireAuth";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/features",
    element: <Features />,
  },
  {
    path: "/pricing",
    element: <Pricing />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "/login",
    element: <AuthPage />,
  },
  {
    path: "/app",
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/app/board" replace /> },
      { path: "board", element: <BoardPage /> },
      { path: "clients", element: <ClientsPage /> },
      { path: "team", element: <TeamPage /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;