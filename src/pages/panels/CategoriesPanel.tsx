import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Button, Card, Input, Label, SectionTitle } from '../../components/ui'

export default function CategoriesPanel(){
  const qc = useQueryClient()
  const list = useQuery({ queryKey:['categories'], queryFn: async()=> (await api.get('/api/categories')).data })
  const mCreate = useMutation({
    mutationFn: async(v:any)=> (await api.post('/api/categories',v)).data,
    onSuccess:()=> qc.invalidateQueries({queryKey:['categories']})
  })

  const { register, handleSubmit, reset, formState:{errors,isSubmitting} } = useForm()

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card><SectionTitle>Create category</SectionTitle>
        <form className="grid gap-2" onSubmit={handleSubmit(v=>{ mCreate.mutate(v); reset(); })}>
          <div><Label>Name</Label><Input {...register('name', {required:'Name is required'})} /></div>
          <div><Label>Kind</Label>
            <Input placeholder="expense | income" {...register('kind', {required:'Kind is required'})} />
          </div>
          {Object.values(errors).length>0 && <p className="text-xs text-red-600">Fill all required fields.</p>}
          <Button type="submit" disabled={isSubmitting}>Create</Button>
        </form>
      </Card>

      <Card><SectionTitle>Your categories</SectionTitle>
        <ul className="space-y-2">{(list.data||[]).map((c:any)=>(
          <li key={c._id} className="flex items-center justify-between border rounded-xl px-3 py-2">
            <div className="font-medium">{c.name}</div><div className="text-xs text-slate-600">{c.kind}</div>
          </li>
        ))}</ul>
      </Card>
    </div>
  )
}
