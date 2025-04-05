import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home/Home'
import Layout from './components/Layout';
const App = () => {
  return (
    <BrowserRouter>
    <Layout>
        <Routes>
          
            <Route index element={<Home />} />
          
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
