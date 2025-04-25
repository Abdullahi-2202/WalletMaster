import { Route } from "wouter";
import { ReactElement } from "react";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => ReactElement;
}) {
  // Simply render the component without any authentication checks
  return <Route path={path} component={Component} />;
}
