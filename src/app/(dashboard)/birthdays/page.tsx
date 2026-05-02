import { getBirthdays } from './actions'
import BirthdaysClient from './BirthdaysClient'
import { AlertTriangle } from 'lucide-react'

export default async function BirthdaysPage() {
  const { data, error } = await getBirthdays()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Aniversariantes</h1>
        <p className="text-gray-400 mt-1">Gerencie e crie slides dos aniversariantes da sua igreja.</p>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <BirthdaysClient initialData={data || []} />
      )}
    </div>
  )
}
