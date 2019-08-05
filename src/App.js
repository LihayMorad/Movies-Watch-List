import React from 'react';
import Layout from './containers/Layout/Layout';
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import rootReducer from './store/rootReducer';

import './App.css';

const store = createStore(rootReducer);

if (process.env.NODE_ENV === "development") window.store = store;

const App = () => (
	<div className="App">
		<Provider store={store}>
			<Layout />
		</Provider>
	</div>
);

export default App;
