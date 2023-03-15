import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import Home from './components/Home';
import Login from './components/Login';
import {Routes,Route} from "react-router-dom"

function App() {
  return (
    <>
     <Header/>
     <Routes>
      <Route path='/' element={<Home />}/>
      <Route path='/Login' element={<Login />}/>
      <Route path='/Home' element={<Home />}/>
     </Routes>
    </>
  );
}

export default App;
