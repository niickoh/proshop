/** Miniatura de la portada (primera imagen) con proporción fija. */
export default function ProductThumb({ src }: { src?: string }) {
  return (
    <div className="aspect-[3/4] w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
      {src && <img src={src} alt="" loading="lazy" className="size-full object-cover" />}
    </div>
  )
}
