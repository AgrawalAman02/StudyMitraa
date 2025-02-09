import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Note from './pages/Note'
import TTSX from './pages/TTSX'
import VideoAnalysis from './pages/VideoUpload'
const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Note />,
  },
  {
    path : "/auth",
    element : <Auth />
  }, 
  {
    path:"/video" , 
    element:<VideoAnalysis/>
  },
  {
    path:"/notes" , 
    element:<Home/>
  },
  {
    path:'/ttsx',
    element:<TTSX/>
  }
])

const App = () => {
  return (
    <RouterProvider router={appRouter} />
  )
}

export default App;