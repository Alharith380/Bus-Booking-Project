import { Card } from "@/components/ui/card";

interface MetricProps {
  label: string;
  value: string;
  detail: string;
}

/** بطاقة إحصائية في صف المقاييس */
export function Metric({ label, value, detail }: MetricProps) {
  return (
    <Card className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </Card>
  );
}
