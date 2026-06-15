import { Component, type ReactNode } from "react";

interface Props {
  fallback: ReactNode;
  children: ReactNode;
}
interface State {
  failed: boolean;
}

/** Catches a GLB load/parse failure and renders the parametric fallback. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };
  static getDerivedStateFromError(): State {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    // eslint-disable-next-line no-console
    console.warn("GLB model failed, using parametric fallback:", err);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
