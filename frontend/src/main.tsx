import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import { routeTree } from './routeTree.gen'

import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './styles.css'

const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')

if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <>
        <MantineProvider>
          <Notifications position="top-right" />
          <RouterProvider router={router} />
        </MantineProvider>
      </>
    </StrictMode>,
  )
}
