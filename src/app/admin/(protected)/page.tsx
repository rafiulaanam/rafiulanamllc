import Link from 'next/link';
import { ArrowUpRight, Inbox, Package, Rows3 } from 'lucide-react';
import { requireAdmin } from '@/lib/db';
import { dateLabel } from '@/lib/admin-data';
import { neonAdminOverview } from '@/lib/neon-admin-data';

export default async function AdminDashboard() {
  const {db} = await requireAdmin();
  const {published,inquiryCount,activity:recent} = await neonAdminOverview(db);
  const activity = recent.sort((a,b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)).slice(0,8);
  const stats = [
    { label: 'Published products', href: '/admin/products', value: published, icon: Package },
    { label: 'Total inquiries', href: '/admin/inquiries', value: inquiryCount, icon: Inbox },
  ];

  return <>
    <header className="admin-overview-heading">
      <h1>Overview</h1>
      <p>Manage your corporate website and review recent updates.</p>
    </header>
    <div className="admin-overview-stats">
      {stats.map(({ label, href, value, icon: Icon }) => <Link key={href} href={href} className="admin-overview-stat">
        <span className="admin-overview-icon"><Icon size={20} aria-hidden="true" /></span>
        <ArrowUpRight className="admin-overview-arrow" size={18} aria-hidden="true" />
        <span className="admin-overview-stat-label">{label}</span>
        <strong>{value}</strong>
      </Link>)}
    </div>
    <section className="admin-workspace-card" aria-labelledby="admin-activity-title">
      <div className="admin-workspace-card-heading"><Rows3 size={19} aria-hidden="true" /><h2 id="admin-activity-title">Recent activity</h2></div>
      {activity.length ? <div className="admin-table-scroll"><table className="admin-table">
        <thead><tr><th scope="col">Item</th><th scope="col">Type</th><th scope="col">Last updated</th></tr></thead>
        <tbody>{activity.map(item => <tr key={item.group + item.id}>
          <td><Link className="text-link" href={item.href}>{item.label}</Link></td>
          <td><span className="admin-tag">{item.group}</span></td>
          <td><time dateTime={item.updated_at}>{dateLabel(item.updated_at)}</time></td>
        </tr>)}</tbody>
      </table></div> : <p className="admin-workspace-empty">No recent activity.</p>}
    </section>
  </>;
}

