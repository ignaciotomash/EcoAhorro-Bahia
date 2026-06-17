import type { CatalogNotification as CatalogNotificationData } from '@/features/productos/hooks/useCatalogoController';

type CatalogNotificationProps = {
  notification: CatalogNotificationData | null;
};

export default function CatalogNotification({ notification }: CatalogNotificationProps) {
  if (!notification) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center z-[999] pointer-events-none">
      <div
        className={`px-4 md:px-6 py-2 md:py-3 rounded-lg text-[10px] md:text-xs font-semibold text-white shadow-lg animate-fadeIn pointer-events-auto ${
          notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        }`}
      >
        {notification.message}
      </div>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
