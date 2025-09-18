import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'
import { Provider } from 'react-redux';
import store from './redux/store'; // Make sure this file exists and exports a valid Redux store
createRoot(document.getElementById('root')).render(

    <Provider store={store}>
      <App />
    </Provider>
)
