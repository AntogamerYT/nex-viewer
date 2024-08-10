import '@renderer/assets/index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@renderer/App';

Object.defineProperty(BigInt.prototype, 'toJSON', {
	value: function() { return this.toString(); },
	configurable: true,
	enumerable: false,
	writable: true
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
