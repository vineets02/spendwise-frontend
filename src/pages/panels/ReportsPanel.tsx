
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Card, SectionTitle } from '../../components/ui'
function monthId(d=new Date()){ return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}` }
export default function ReportsPanel(){
  const m = monthId()
  const monthly = useQuery({ queryKey:['rep',m], queryFn: async()=> (await api.get('/api/reports/monthly',{ params:{ month:m } })).data })
  return (<div className="grid gap-4 md:grid-cols-2">
    <Card><SectionTitle>Totals ({m})</SectionTitle>
      <div className="text-3xl font-bold text-slate-900">₹{(monthly.data?.totals?.net||0).toLocaleString()}</div>
      <div className="text-slate-600 mt-2">Income: ₹{(monthly.data?.totals?.income||0).toLocaleString()}</div>
      <div className="text-slate-600">Expense: ₹{(monthly.data?.totals?.expense||0).toLocaleString()}</div>
    </Card>
    <Card><SectionTitle>By Category</SectionTitle>
      <ul className="space-y-2">{(monthly.data?.byCategory||[]).map((c:any)=>(
        <li key={c._id} className="flex justify-between border rounded-xl px-3 py-2">
          <span>{c._id}</span><span>₹{c.total.toLocaleString()}</span>
        </li>
      ))}</ul>
    </Card>
  </div>)
}
