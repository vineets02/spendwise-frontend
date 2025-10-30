import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Button, Card, Input, Label, SectionTitle } from '../../components/ui'
import { useMemo } from 'react'

type TxnForm = {
  type?: 'expense' | 'income' | 'transfer'
  accountId?: string
  toAccountId?: string
  categoryId?: string
  amount?: number
  currency?: string
  whenLocal?: string   // <— user picks this in IST
  note?: string
}
function toIsoFromIST(localDT?: string) {
  // localDT like "2025-10-29T15:30"
  if (!localDT) return undefined
  // build an ISO with explicit IST offset, then convert to UTC ISO
  // appending seconds for consistency
  const isoWithOffset = `${localDT}:00+05:30`
  return new Date(isoWithOffset).toISOString()
}

function nowISTForInput() {
  // produce "YYYY-MM-DDTHH:mm" in IST for datetime-local
  const now = new Date()
  // offset IST = +5:30 from UTC
  const istMillis = now.getTime() + (5.5 * 60 * 60 * 1000)
  const ist = new Date(istMillis)
  const yyyy = ist.getUTCFullYear()
  const mm = String(ist.getUTCMonth() + 1).padStart(2,'0')
  const dd = String(ist.getUTCDate()).padStart(2,'0')
  const hh = String(ist.getUTCHours()).padStart(2,'0')
  const mi = String(ist.getUTCMinutes()).padStart(2,'0')
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
}
export default function TransactionsPanel() {
  const qc = useQueryClient()

  const { data: accounts = [], isLoading: accLoading } =
    useQuery({ queryKey: ['accounts'], queryFn: async () => (await api.get('/api/accounts')).data })

  const { data: categories = [], isLoading: catLoading } =
    useQuery({ queryKey: ['categories'], queryFn: async () => (await api.get('/api/categories')).data })

  const { data: list } =
    useQuery({ queryKey: ['txns'], queryFn: async () => (await api.get('/api/transactions')).data })

  const mCreate = useMutation({
    mutationFn: async (v: any) => (await api.post('/api/transactions', v)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['txns'] }),
  })
  const {
    register, handleSubmit, watch, reset, setValue,
    formState: { errors, isSubmitting },
  } = useForm<TxnForm>()    // <-- no defaultValues

  const type = watch('type')
  const filteredCats = useMemo(
    () => categories.filter((c: any) =>
      type === 'expense' ? c.kind === 'expense'
      : type === 'income' ? c.kind === 'income'
      : true),
    [categories, type]
  )

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <SectionTitle>Add transaction</SectionTitle>

        <form
          className="grid gap-2"
          onSubmit={handleSubmit((v) => {
            const payload: any = {
              type: v.type,
              accountId: v.accountId,
              toAccountId: v.toAccountId,
              categoryId: v.categoryId,
              amount: v.amount,
              currency: v.currency || 'INR',
              when: toIsoFromIST(v.whenLocal),   // <— convert IST → UTC ISO
              note: v.note,
            }
            if (payload.type !== 'transfer') delete payload.toAccountId
            if (payload.type === 'transfer') delete payload.categoryId

            mCreate.mutate(payload)
            reset()
          })}
        >
          {/* Type */}
          <div>
            <Label>Type</Label>
            <select
              {...register('type', { required: 'Type is required' })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
            >
              <option value="">Select type…</option>
              <option value="expense">expense</option>
              <option value="income">income</option>
              <option value="transfer">transfer</option>
            </select>
            {errors.type && <p className="text-xs text-red-600 mt-1">{errors.type.message}</p>}
          </div>

          {/* Account */}
          <div>
            <Label>Account</Label>
            <select
              {...register('accountId', { required: 'Account is required' })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              disabled={accLoading}
            >
              <option value="">Select account…</option>
              {accounts.map((a:any)=><option key={a._id} value={a._id}>{a.name} ({a.type})</option>)}
            </select>
            {errors.accountId && <p className="text-xs text-red-600 mt-1">{errors.accountId.message}</p>}
          </div>

          {/* To Account (transfer only) */}
          {type === 'transfer' && (
            <div>
              <Label>To Account</Label>
              <select
                {...register('toAccountId', { required: 'To account is required for transfer' })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                disabled={accLoading}
              >
                <option value="">Select destination…</option>
                {accounts.map((a:any)=><option key={a._id} value={a._id}>{a.name} ({a.type})</option>)}
              </select>
              {errors.toAccountId && <p className="text-xs text-red-600 mt-1">{errors.toAccountId.message}</p>}
            </div>
          )}

          {/* Category (only for expense/income) */}
          {type && type !== 'transfer' && (
            <div>
              <Label>Category</Label>
              <select
                {...register('categoryId', { required: 'Category is required' })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                disabled={catLoading}
              >
                <option value="">Select category…</option>
                {categories
                  .filter((c:any)=> type==='expense'? c.kind==='expense' : type==='income'? c.kind==='income' : true)
                  .map((c:any)=><option key={c._id} value={c._id}>{c.name} ({c.kind})</option>)}
              </select>
              {errors.categoryId && <p className="text-xs text-red-600 mt-1">{errors.categoryId.message}</p>}
            </div>
          )}

          {/* Amount / Currency */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Amount</Label>
              <Input
                type="number" step="0.01"
                {...register('amount', { required:'Amount is required', valueAsNumber:true, min:{value:0.01, message:'Must be > 0'} })}
              />
              {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount.message}</p>}
            </div>
            <div>
              <Label>Currency</Label>
              <Input placeholder="INR" {...register('currency')} />
            </div>
          </div>

          {/* When (IST via calendar+clock) */}
          <div>
            <Label>When (IST)</Label>
            <input
              type="datetime-local"
              {...register('whenLocal', { required: 'Date & time is required' })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
            <div className="flex gap-2 mt-1">
              <Button type="button" className="px-2 py-1 text-xs"
                onClick={()=>setValue('whenLocal', nowISTForInput(), { shouldValidate: true })}>
                Now (IST)
              </Button>
              <p className="text-xs text-slate-500">We’ll save it in UTC on the server.</p>
            </div>
            {errors.whenLocal && <p className="text-xs text-red-600 mt-1">{errors.whenLocal.message}</p>}
          </div>

          <div>
            <Label>Note</Label>
            <Input {...register('note')} />
          </div>

          <Button type="submit" disabled={isSubmitting || mCreate.isPending}>
            {mCreate.isPending ? 'Creating…' : 'Create'}
          </Button>
        </form>
      </Card>

      {/* right side list unchanged */}
      <Card>
        <SectionTitle>Latest</SectionTitle>
        <ul className="space-y-2">
          {(list?.items || []).map((t:any)=>(
            <li key={t._id} className="border rounded-xl px-3 py-2">
              <div className="flex justify-between">
                <div className="font-medium">{t.type} • {t.currency} {t.amount}</div>
                <div className="text-xs text-slate-500">{new Date(t.when).toLocaleString()}</div>
              </div>
              {t.note && <div className="text-sm">{t.note}</div>}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}