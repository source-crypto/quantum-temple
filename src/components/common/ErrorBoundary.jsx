import React from "react";
import { base44 } from "@/api/base44Client";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  async componentDidCatch(error, info) {
    try {
      await base44.entities.AppLog.create({
        type: "runtime_error",
        message: String(error?.message || error),
        severity: "error",
        source: "Layout/ErrorBoundary",
        details: { componentStack: info?.componentStack || null },
        timestamp: new Date().toISOString()
      });
    } catch (_e) {
      // swallow
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="m-4 p-4 rounded-lg border border-red-500/30 bg-red-950/30 text-red-200">
          <div className="font-semibold mb-1">Something went wrong</div>
          <div className="text-sm opacity-80 break-all">{String(this.state.error?.message || this.state.error)}</div>
          <div className="text-xs opacity-60 mt-1">The issue was logged for review.</div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;