import { useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

function BuggyComponent() {
  const [throwError, setThrowError] = useState(false);

  if (throwError) {
    throw new Error('Test error from buggy component');
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-medium mb-2">Test Error Boundary</h3>
      <p className="text-sm text-gray-600 mb-4">
        Click the button to trigger an error and test the ErrorBoundary component.
      </p>
      <button
        onClick={() => setThrowError(true)}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Trigger Error
      </button>
    </div>
  );
}

export function TestErrorBoundary() {
  return (
    <ErrorBoundary>
      <BuggyComponent />
    </ErrorBoundary>
  );
}
