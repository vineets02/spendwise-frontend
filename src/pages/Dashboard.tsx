
import { useState } from 'react'
import AccountsPanel from './panels/AccountsPanel'
import CategoriesPanel from './panels/CategoriesPanel'
import TransactionsPanel from './panels/TransactionsPanel'
import ReportsPanel from './panels/ReportsPanel'
import SubscriptionsPanel from './panels/SubscriptionsPanel'
const tabs = [
  { key:'accounts', label:'Accounts', comp: AccountsPanel },
  { key:'categories', label:'Categories', comp: CategoriesPanel },
  { key:'transactions', label:'Transactions', comp: TransactionsPanel },
  { key:'reports', label:'Reports', comp: ReportsPanel },
  { key:'subscriptions', label:'Subscriptions', comp: SubscriptionsPanel },
]
export default function Dashboard(){
  const [active,setActive]=useState('accounts')
  const Active = tabs.find(t=>t.key===active)!.comp
  return (<div className="grid gap-4">
    <div className="flex gap-2 flex-wrap">{tabs.map(t=>(
      <button key={t.key} onClick={()=>setActive(t.key)}
        className={"px-3 py-1.5 rounded-full border "+(active===t.key?"bg-slate-900 text-white":"bg-white")}>{t.label}</button>
    ))}</div>
    <Active/>
  </div>)
}
