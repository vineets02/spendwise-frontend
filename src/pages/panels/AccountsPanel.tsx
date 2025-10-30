import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Button, Card, Input, Label, SectionTitle } from '../../components/ui'
import { useForm } from 'react-hook-form'

const TYPE_OPTIONS = ['cash', 'bank', 'wallet', 'card'] as const

export default function AccountsPanel(){
  const qc = useQueryClient()
  const list = useQuery({ queryKey:['accounts'], queryFn: async()=> (await api.get('/api/accounts')).data })
  const mCreate = useMutation({
    mutationFn: async(v:any)=> (await api.post('/api/accounts',v)).data,
    onSuccess:()=> qc.invalidateQueries({queryKey:['accounts']})
  })

  const { register, handleSubmit, reset, formState:{errors,isSubmitting} } = useForm()

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card><SectionTitle>Create account</SectionTitle>
        <form
          className="grid gap-2"
          onSubmit={handleSubmit(v=>{ mCreate.mutate(v); reset(); })}
        >
          <div>
            <Label>Name</Label>
            <Input {...register('name', {required:'Name is required'})} />
          </div>

          <div>
            <Label>Type</Label>
            <select
              className="w-full border rounded-xl px-3 py-2 outline-none"
              defaultValue=""
              {...register('type', {
                required: 'Type is required',
                validate: (v)=> TYPE_OPTIONS.includes(v as any) || 'Invalid type'
              })}
            >
              <option value="" disabled>Choose type</option>
              {TYPE_OPTIONS.map(t=>(
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <Label>Currency</Label>
            <Input placeholder="INR" {...register('currency', {required:'Currency is required'})} />
          </div>

          {Object.values(errors).length>0 && (
            <p className="text-xs text-red-600">Fill all required fields.</p>
          )}
          <Button type="submit" disabled={isSubmitting}>Create</Button>
        </form>
      </Card>

      <Card><SectionTitle>Your accounts</SectionTitle>
        <ul className="space-y-2">
          {(list.data||[]).map((a:any)=>(
            <li key={a._id} className="flex items-center justify-between border rounded-xl px-3 py-2">
              <div>
                <div className="font-medium">{a.name}</div>
                <div className="text-xs text-slate-600">{a.type} • {a.currency}</div>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
