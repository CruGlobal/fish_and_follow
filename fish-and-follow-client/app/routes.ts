import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/login", "routes/login.tsx"),
  route("/resources", "routes/resources.tsx"),
  route("/contacts", "routes/contacts.tsx"),
  route("/admin", "routes/admin.tsx"),
] satisfies RouteConfig;
