import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'


const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path : "/auth",
    element : <Auth />
  }
])

const App = () => {
  return (
    <RouterProvider router={appRouter} />
  )
}

export default App;