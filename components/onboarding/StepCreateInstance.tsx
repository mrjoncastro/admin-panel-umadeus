'use client'
export default function StepCreateInstance() {
  return (
    <div className="flex flex-col items-center p-8">
      <span>Configurando sua instância...</span>
      <div className="animate-spin h-12 w-12 border-4 border-t-green-600 rounded-full" />
    </div>
  )
}
