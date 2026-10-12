import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartCard from '../dashboard/ChartCard';

export default function BookingSources({ data }) {
  return (
    <ChartCard title="Traffic & Booking Sources">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="43%"
            outerRadius="62%"
            dataKey="value"
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--color-bg-surface)', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-base)'
            }}
            formatter={(value) => [`${value}%`, 'Share']}
          />
          <Legend
            verticalAlign="bottom"
            align="center"
            height={56}
            iconType="circle"
            wrapperStyle={{ width: '100%', fontSize: 12, lineHeight: '20px' }}
            formatter={(value) => <span style={{ color: 'var(--color-text-muted)' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
