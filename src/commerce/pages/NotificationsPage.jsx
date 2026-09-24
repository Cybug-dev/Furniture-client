import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Bell, CheckCheck } from 'lucide-react';
import { useAccountMutation, useNotifications } from '../commerce.hooks.js';
import { date } from '../commerce.utils.js';
import { Card, EmptyState, ErrorMessage, PageHeading, Pagination, QueryState } from '../components/CommerceUI';

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [unread, setUnread] = useState(false);
  const query = useNotifications(page, unread);
  const read = useAccountMutation('readNotification', ['notifications']);
  const readAll = useAccountMutation('readAllNotifications', ['notifications']);
  const navigate = useNavigate();
  const busy = read.isPending || readAll.isPending;
  const open = async (notification) => {
    try {
      if (!notification.readAt) await read.run(notification.id);
      if (notification.orderId) navigate(`/orders/${notification.orderId}`);
    } catch { /* Keep the notification visible and show a retryable error. */ }
  };
  return <>
    <PageHeading title="Notifications" description="Stay updated as your demo orders move through each stage."><button className="commerce-text-button" disabled={busy || !query.data?.unreadCount} onClick={async () => { try { await readAll.run(); setPage(1); } catch { /* Inline error. */ } }}><CheckCheck size={18} />Mark all as read</button></PageHeading>
    <nav className="commerce-tabs" aria-label="Filter notifications">{[[false, 'All'], [true, 'Unread']].map(([value, title]) => <button key={title} aria-pressed={unread === value} onClick={() => { setUnread(value); setPage(1); }}>{title}</button>)}</nav>
    <ErrorMessage error={read.error || readAll.error} />
    <QueryState query={query}>{query.data?.items.length ? <div className="commerce-grid"><div className="commerce-stack">
      {query.data.items.map((notification) => <article className={`commerce-card notification-card ${notification.readAt ? '' : 'is-unread'}`} key={notification.id}><span className="notification-card__icon"><Bell size={23} aria-hidden="true" /></span><div><h2>{notification.title}</h2><p>{notification.message}</p><time dateTime={notification.createdAt}>{date(notification.createdAt, true)}</time><span className="notification-card__state">{notification.readAt ? 'Read' : '● Unread'}</span></div><button className="commerce-text-button" disabled={busy || (notification.readAt && !notification.orderId)} onClick={() => open(notification)}>{notification.orderId ? 'View order →' : notification.readAt ? 'Read' : 'Mark as read'}</button></article>)}
      <Pagination query={query} page={page} setPage={setPage} />
    </div><Card title="Order updates"><p>These updates come from your saved demo orders. Open an order to see its full tracking timeline.</p><Link className="commerce-button commerce-button--secondary" to="/orders">Track your orders</Link><p className="commerce-note">New notifications are checked periodically while the page is visible.</p></Card></div> : <><EmptyState title="You're all caught up" text={unread ? 'No unread notifications right now.' : 'Updates will appear here when you place a demo order.'} icon={Bell} orders />{page > 1 && <button className="commerce-button commerce-button--secondary" onClick={() => setPage(1)}>Return to first page</button>}</>}</QueryState>
  </>;
}
