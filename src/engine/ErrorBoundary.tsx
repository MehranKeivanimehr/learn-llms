import { Component, type ComponentType, type ReactNode } from 'react';

interface Props {
  name: string;
  children: ReactNode;
}

export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error(`[${this.props.name}]`, error);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="widget-error" role="alert">
          <p>This widget failed to load. The lesson text still works.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Reload the page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function withBoundary<P extends object>(Inner: ComponentType<P>, name: string) {
  function Wrapped(props: P) {
    return (
      <ErrorBoundary name={name}>
        <Inner {...props} />
      </ErrorBoundary>
    );
  }
  Wrapped.displayName = `withBoundary(${name})`;
  return Wrapped;
}
