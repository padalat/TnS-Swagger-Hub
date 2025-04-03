import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home/Home';
import AddProjects from './pages/AddProjects/AddProjects';
import ProjectDetails from './pages/ProjectDetails/ProjectDetails';
import SwaggerHub from './components/SwaggerHub';
import ProjectsList from './pages/ProjectsList/ProjectsList';
import Layout from './components/Layout';

const App = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route index element={<Home />} />
          <Route path="add" element={<AddProjects />} />
          <Route path="project/:uuid" element={<ProjectDetails />} />
          <Route path="docs" element={<SwaggerHub />} />
          <Route path="swagger" element={<SwaggerHub />} />
          <Route path="projects" element={<ProjectsList />} />
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center h-full">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
              <p className="text-gray-600">The page you are looking for does not exist.</p>
            </div>
          } />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
