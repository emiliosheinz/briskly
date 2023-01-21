export function Loading() {
  return (
    <div className='grid w-full animate-pulse grid-cols-1 gap-5 sm:grid-cols-2'>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className='h-96 rounded-md bg-primary-200 sm:h-64' />
      ))}
    </div>
  )
}
