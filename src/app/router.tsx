import { createBrowserRouter, Navigate } from 'react-router'
import { MODULE_IDS } from '../content/modules'
import { ModuleLayout, ModuleIndex } from '../modules/ModuleLayout'
import { StagePage } from '../modules/StagePage'
import { Dashboard } from '../pages/Dashboard'
import { NotFound } from '../pages/NotFound'
import { Layout } from './Layout'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      ...MODULE_IDS.map((id) => ({
        path: id,
        element: <ModuleLayout moduleId={id} />,
        children: [
          { index: true, element: <ModuleIndex moduleId={id} /> },
          { path: ':stage', element: <StagePage moduleId={id} /> },
        ],
      })),
      {
        path: 'teachers',
        lazy: () => import('../pages/Teachers').then((m) => ({ Component: m.Teachers })),
      },
      {
        path: 'teachers/:module',
        lazy: () => import('../pages/TeacherModule').then((m) => ({ Component: m.TeacherModule })),
      },
      { path: 'about', lazy: () => import('../pages/About').then((m) => ({ Component: m.About })) },
      { path: 'home', element: <Navigate to="/" replace /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])
