import React from 'react';
import Layout from './containers/Layout/Layout';
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import rootReducer from './store/rootReducer';

import './styles/main.scss';

const inDev = process.env.NODE_ENV === "development";

const store = createStore(
	rootReducer,
	inDev ? window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__() : undefined
);

const App = () => (
	<div className="App">
		<Provider store={store}>
			<Layout />
		</Provider>
	</div>
);

export default App;
