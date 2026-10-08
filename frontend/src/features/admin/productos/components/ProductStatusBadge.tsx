import Badge from '../../../../shared/ui/Badge'

export default function ProductStatusBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge tone="success">Activo</Badge>
  ) : (
    <Badge className="bg-slate-100 text-slate-600">Archivado</Badge>
  )
}
