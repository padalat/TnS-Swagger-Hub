import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home/Home'
import AddProjects from './pages/AddProjects/AddProjects'
import Layout from './components/Layout';
const App = () => {
  return (
    <BrowserRouter>
    <Layout>
        <Routes>
          
            <Route index element={<Home />} />
            <Route path="add" element={<AddProjects />} />
          
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
