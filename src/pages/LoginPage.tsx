import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Card, Input, Label } from '../components/ui'
import { useAuth } from '../lib/auth'
import { useEffect, useState } from 'react'

type Form = { email: string; password: string }

export default function LoginPage() {
  const nav = useNavigate()
  const { login } = useAuth()
  const [params] = useSearchParams()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<Form>()

  // Optional dynamic prefill (URL first, then last used)
  useEffect(() => {
    const urlEmail = params.get('email')
    const remembered = localStorage.getItem('lastEmail') || ''
    if (urlEmail) setValue('email', urlEmail)
    else if (remembered) setValue('email', remembered)
  }, [params, setValue])

  async function onSubmit(v: Form) {
    setSubmitError(null)
    try {
      localStorage.setItem('lastEmail', v.email)
      await login(v.email, v.password)
      nav('/app')
    } catch (e: any) {
      setSubmitError(e?.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <Card className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4">Welcome back</h1>

        {submitError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3" autoComplete="on">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="you@domain.com"
              autoComplete="email"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="text-sm mt-3">
          No account? <Link className="text-blue-600" to="/register">Create one</Link>
        </p>
      </Card>
    </div>
  )
}
