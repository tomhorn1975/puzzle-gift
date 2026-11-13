import { Suspense } from 'react'
import { LoginForm } from './LoginForm'

export const instant = false

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
