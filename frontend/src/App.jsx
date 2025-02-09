import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'

import VideoAnalysis from './pages/VideoUpload'
const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path : "/auth",
    element : <Auth />
  }, 
  {
    path:"/video" , 
    element:<VideoAnalysis/>
  }
])

const App = () => {
  return (
    <RouterProvider router={appRouter} />
  )
}

export default App;