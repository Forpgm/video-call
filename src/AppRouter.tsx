import { useRoutes } from "react-router-dom";
import Landing from "./Landing";
import Meeting from "./Meeting";

export default function AppRouter() {
  const routeElements = useRoutes([
    { path: "/", element: <Landing /> },
    {
      path: "/meeting/:id",
      element: <Meeting />,
    },
  ]);
  return routeElements;
}
