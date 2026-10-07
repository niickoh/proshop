import Badge from '../../ui/Badge'

export default function SaleBadge({ percent }: { percent: number }) {
  return <Badge tone="sale">{percent}% OFF</Badge>
}
