import { Link } from '@tanstack/react-router'
import { NavLink, Text } from '@mantine/core'
import type { ReactNode } from 'react'

type NavButtonProps = {
  to: string
  label: string
  icon: ReactNode
  color?: string
}

export function NavButton({ to, icon, label, color }: NavButtonProps) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      {({ isActive }) => (
        <NavLink
          component="div"
          active={isActive}
          label={
            <Text size="lg" fw={isActive ? 700 : 500} c={color}>
              {label}
            </Text>
          }
          leftSection={icon}
          variant="light"
          color={color || 'blue'}
          styles={{
            root: { borderRadius: '8px', marginBottom: '8px' },
            label: { fontsize: '1.1rem' },
          }}
        />
      )}
    </Link>
  )
}
