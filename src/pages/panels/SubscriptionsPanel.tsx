import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Button, Card, Input, Label, SectionTitle } from '../../components/ui'

const TYPE_OPTIONS = ['subscription', 'sip'] as const

export default function SubscriptionsPanel(){
  const qc = useQueryClient()
  const list = useQuery({ queryKey:['subs'], queryFn: async()=> (await api.get('/api/subscriptions')).data })
  const mCreate = useMutation({
    mutationFn: async(v:any)=> (await api.post('/api/subscriptions',v)).data,
    onSuccess:()=> qc.invalidateQueries({queryKey:['subs']})
  })
  const runRem = useMutation({ mutationFn: async()=> (await api.post('/api/reminders/run')).data })

  const { register, handleSubmit, reset, formState:{errors,isSubmitting} } = useForm()

  // On submit: convert local datetime (IST on your machine) to ISO (UTC) for backend
  const onSubmit = (v:any)=>{
    if (v.nextChargeLocal) {
      // `new Date('YYYY-MM-DDTHH:mm')` interprets string in LOCAL TZ (IST for you),
      // then toISOString() converts to UTC ISO — perfect for server.
      const iso = new Date(v.nextChargeLocal).toISOString()
      v.nextChargeAt = iso
      delete v.nextChargeLocal
    }
    mCreate.mutate(v)
    reset()
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card><SectionTitle>Create subscription</SectionTitle>
        <form className="grid gap-2" onSubmit={handleSubmit(onSubmit)}>
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
                required:'Type is required',
                validate:(v)=> TYPE_OPTIONS.includes(v as any) || 'Invalid type'
              })}
            >
              <option value="" disabled>Choose type</option>
              {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Amount</Label>
              <Input type="number" step="0.01" {...register('amount',{valueAsNumber:true, required:'Amount required'})} />
            </div>
            <div>
              <Label>Currency</Label>
              <Input placeholder="INR" {...register('currency', {required:'Currency required'})} />
            </div>
          </div>

          <div>
            <Label>Frequency</Label>
            <Input placeholder="monthly" {...register('frequency', {required:'Frequency required'})} />
          </div>

          <div>
            <Label>Day of month (1–28)</Label>
            <Input type="number" {...register('dayOfMonth',{valueAsNumber:true})} />
          </div>

          <div>
            <Label>Next charge at (IST → stored as UTC)</Label>
            <input
              type="datetime-local"
              className="w-full border rounded-xl px-3 py-2 outline-none"
              {...register('nextChargeLocal', { required:'Next charge time required' })}
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Pick your local time (IST). It will be converted to UTC ISO for the server.
            </p>
          </div>

          <div>
            <Label>Lead hours</Label>
            <Input type="number" {...register('leadHours',{valueAsNumber:true})} />
          </div>

          {Object.values(errors).length>0 && (
            <p className="text-xs text-red-600">Please fill required fields.</p>
          )}
          <Button type="submit" disabled={isSubmitting}>Create</Button>
        </form>
      </Card>

      <Card><SectionTitle>Subscriptions</SectionTitle>
        <ul className="space-y-2">
          {(list.data||[]).map((s:any)=>(
            <li key={s._id} className="border rounded-xl px-3 py-2">
              <div className="font-medium">
                {s.name} • ₹{s.amount}
              </div>
              <div className="text-xs text-slate-600">
                Next: {new Date(s.nextChargeAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
        <Button className="mt-3" onClick={()=>runRem.mutate()}>Run reminders now</Button>
      </Card>
    </div>
  )
}
