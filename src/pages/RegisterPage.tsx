
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, Input, Label } from '../components/ui'
import { useAuth } from '../lib/auth'
export default function RegisterPage(){
  const nav = useNavigate(); const { register:signup } = useAuth()
  const { register, handleSubmit } = useForm<{name:string;email:string;password:string}>({ defaultValues:{name:'You',email:'you@test.com',password:'secret'} })
  async function onSubmit(v:any){ await signup(v.name,v.email,v.password); nav('/app') }
  return (<div className="min-h-screen grid place-items-center p-4">
    <Card className="w-full max-w-sm"><h1 className="text-2xl font-bold mb-4">Create account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
        <div><Label>Name</Label><Input {...register('name')} /></div>
        <div><Label>Email</Label><Input type="email" {...register('email')} /></div>
        <div><Label>Password</Label><Input type="password" {...register('password')} /></div>
        <Button type="submit">Register</Button>
      </form>
      <p className="text-sm mt-3">Have an account? <Link className="text-blue-600" to="/login">Sign in</Link></p>
    </Card></div>)
}
