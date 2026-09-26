import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, Bell, CheckCheck, ChevronRight, EllipsisVertical, Star, Truck } from 'lucide-react';
import { useAccountMutation, useNotifications } from '../commerce.hooks.js';
import { useSimulatedNotifications } from '../notifications/notificationsContext.js';
import { EmptyState, ErrorMessage, Loading, Pagination } from '../components/CommerceUI.jsx';
import './NotificationsPage.scss';

function relativeTime(value) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
}

function NotificationImage({ notification }) {
  if (notification.image) return <img src={notification.image} alt="" loading="lazy" />;
  const Icon = notification.type === 'welcome' ? Star : notification.orderId ? Truck : Bell;
  return <span className="inbox-card__icon"><Icon size={30} aria-hidden="true" /></span>;
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [unread, setUnread] = useState(false);
  const allQuery = useNotifications(1, false);
  const query = useNotifications(page, unread);
  const simulated = useSimulatedNotifications();
  const read = useAccountMutation('readNotification', ['notifications']);
  const readAll = useAccountMutation('readAllNotifications', ['notifications']);
  const navigate = useNavigate();
  const busy = read.isPending || readAll.isPending;
  const total = (allQuery.data?.total ?? allQuery.data?.items?.length ?? 0) + simulated.items.length;
  const unreadCount = (allQuery.data?.unreadCount ?? 0) + simulated.unreadCount;
  const localItems = page === 1 ? simulated.items.filter((item) => !unread || !item.readAt) : [];
  const serverItems = (query.data?.items || []).map((item) => ({ ...item, type: 'order' }));
  const items = [...localItems, ...serverItems].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const open = async (notification) => {
    if (notification.type !== 'order') {
      simulated.markRead(notification.id);
      navigate(notification.href);
      return;
    }
    try {
      if (!notification.readAt) await read.run(notification.id);
      navigate(notification.orderId ? `/orders/${notification.orderId}` : '/shop');
    } catch { /* The inline error offers retry. */ }
  };

  const markAll = async () => {
    simulated.markAllRead();
    if (allQuery.data?.unreadCount) {
      try { await readAll.run(); } catch { /* The inline error offers retry. */ }
    }
  };

  return <section className="notification-inbox" aria-labelledby="notification-inbox-title">
    <header className="notification-inbox__heading">
      <div><h1 id="notification-inbox-title">Notifications</h1><p>Stay updated on new arrivals, order updates and exclusive deals.</p></div>
      <button className="notification-inbox__mark-all" type="button" disabled={busy || !unreadCount} onClick={markAll}><CheckCheck size={18} />Mark all as read</button>
    </header>
    <nav className="notification-inbox__tabs" aria-label="Filter notifications">
      <button type="button" className={!unread ? 'is-active' : ''} aria-pressed={!unread} onClick={() => { setUnread(false); setPage(1); }}>All ({total})</button>
      <button type="button" className={unread ? 'is-active' : ''} aria-pressed={unread} onClick={() => { setUnread(true); setPage(1); }}>Unread ({unreadCount})</button>
    </nav>
    <ErrorMessage error={read.error || readAll.error || (query.isError ? query.error : null)} />
    {query.isPending && !items.length ? <Loading /> : items.length ? <div className="notification-inbox__list">
      {items.map((notification) => {
        const isUnread = !notification.readAt;
        const action = notification.action || (notification.orderId ? 'Track order' : 'Shop now');
        return <article className={`inbox-card${isUnread ? ' is-unread' : ''}`} key={`${notification.type}-${notification.id}`}>
          <span className="inbox-card__dot" aria-label={isUnread ? 'Unread' : 'Read'} />
          <button className="inbox-card__body" type="button" onClick={() => open(notification)}>
            <NotificationImage notification={notification} />
            <span className="inbox-card__copy">
              {notification.label && <span className={`inbox-card__tag inbox-card__tag--${notification.type}`}>{notification.label}</span>}
              <strong>{notification.title}</strong><span>{notification.message}</span>
            </span>
            <ChevronRight className="inbox-card__chevron" size={20} aria-hidden="true" />
          </button>
          <div className="inbox-card__meta">
            <time dateTime={notification.createdAt}>{relativeTime(notification.createdAt)}</time>
            <button className="inbox-card__more" type="button" disabled={busy || !isUnread} aria-label={`Mark ${notification.title} as read`} onClick={() => notification.type === 'order' ? Promise.resolve(read.run(notification.id)).catch(() => {}) : simulated.markRead(notification.id)}><EllipsisVertical size={19} /></button>
            <button className="inbox-card__action" type="button" aria-label={notification.orderId ? 'View order' : undefined} onClick={() => open(notification)}>{action}<ArrowRight size={16} /></button>
          </div>
        </article>;
      })}
      <Pagination query={query} page={page} setPage={setPage} />
    </div> : <EmptyState title="You're all caught up" text={unread ? 'No unread notifications right now.' : 'Product and order updates will appear here.'} icon={Bell} />}
    <button className="notification-inbox__mobile-mark" type="button" disabled={busy || !unreadCount} onClick={markAll}><CheckCheck size={18} />Mark all as read</button>
  </section>;
}
