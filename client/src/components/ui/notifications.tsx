import { formatDate } from "@/lib/utils";

type Notification = {
  id: number;
  title: string;
  message: string;
  date: Date;
  isRead: boolean;
  type: "budget" | "transaction" | "system";
};

const mockNotifications: Notification[] = [
  {
    id: 1,
    title: "Budget Alert",
    message: "You've exceeded your shopping budget by 7%",
    date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    isRead: false,
    type: "budget",
  },
  {
    id: 2,
    title: "New Transaction",
    message: "Payment to Amazon for $49.99",
    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isRead: false,
    type: "transaction",
  },
  {
    id: 3,
    title: "System Update",
    message: "New AI insights feature is now available",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isRead: true,
    type: "system",
  },
];

export function Notifications() {
  const getIcon = (type: string) => {
    switch (type) {
      case "budget":
        return <i className="fas fa-chart-pie text-primary"></i>;
      case "transaction":
        return <i className="fas fa-receipt text-green-500"></i>;
      case "system":
        return <i className="fas fa-bell text-orange-500"></i>;
      default:
        return <i className="fas fa-bell text-gray-500"></i>;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-10 border border-gray-200">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
          <span className="text-xs text-primary font-medium cursor-pointer hover:underline">
            Mark all as read
          </span>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {mockNotifications.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {mockNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 hover:bg-gray-50 ${
                  notification.isRead ? "" : "bg-blue-50"
                }`}
              >
                <div className="flex">
                  <div className="flex-shrink-0 pt-0.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      {getIcon(notification.type)}
                    </div>
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-500">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(notification.date)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-center">
        <button className="text-xs text-primary font-medium hover:underline">
          View all notifications
        </button>
      </div>
    </div>
  );
}
