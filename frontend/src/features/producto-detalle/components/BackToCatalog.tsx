import { useBackToCatalog } from '../hooks/useBackToCatalog'

export default function BackToCatalog() {
  const goBack = useBackToCatalog()

  return (
    <button
      type="button"
      onClick={goBack}
      className="-ml-2 flex min-h-11 items-center gap-1 rounded-md px-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5" fill="currentColor">
        <path d="M12.7 4.3a1 1 0 0 1 0 1.4L8.4 10l4.3 4.3a1 1 0 0 1-1.4 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 0Z" />
      </svg>
      Volver al catálogo
    </button>
  )
}
