import { Card, ErrorState, Grid, LoadingState, StatGrid, StatTile } from '../ui';
import { EngagementChart, Funnel } from './EngagementChart';

/**
 * "Who looked at it" for a listing or event: totals, a per-day chart and the path from viewing to buying.
 * `conversions` are the steps after the click (bookings requested/paid, checkouts, tickets).
 */
export default function EngagementPanel({ engagement, steps }) {
  if (!engagement) return <LoadingState />;
  if (engagement.not_ready) return <ErrorState>Statistics need the latest database update (migration 13).</ErrorState>;
  const t = engagement.totals;
  return (
    <>
      <StatGrid>
        <StatTile label="Page views" value={t.views.toLocaleString()} />
        <StatTile label="Different visitors" value={t.visitors.toLocaleString()} />
        <StatTile label="Clicked book / tickets" value={t.clicks.toLocaleString()} />
      </StatGrid>
      <Grid>
        <Card title="Visits per day">
          <EngagementChart days={engagement.days} />
        </Card>
        {steps && (
          <Card title="From looking to buying">
            <Funnel
              steps={[
                { label: 'Viewed the page', value: t.views },
                { label: 'Clicked to book or buy', value: t.clicks },
                ...steps,
              ]}
            />
          </Card>
        )}
      </Grid>
    </>
  );
}
