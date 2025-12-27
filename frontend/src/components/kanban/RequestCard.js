import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatDistanceToNow } from 'date-fns';
import { PRIORITY_COLORS } from '../../lib/constants';

export default function RequestCard({ request, isDragging = false }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: request.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const priorityColor = PRIORITY_COLORS[request.priority] || 'gray';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
        bg-white border-2 rounded-lg p-4 cursor-grab active:cursor-grabbing
        hover:shadow-lg transition-shadow
        ${request.is_overdue ? 'border-red-500 bg-red-50' : 'border-gray-200'}
        ${isDragging ? 'opacity-50' : ''}
      `}
        >
            {/* Priority Badge & Type */}
            <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${priorityColor}-100 text-${priorityColor}-800`}>
                    {request.priority}
                </span>
                <span className={`text-xs font-medium ${request.request_type === 'Preventive' ? 'badge-preventive' : 'badge-corrective'}`}>
                    {request.request_type}
                </span>
            </div>

            {/* Title */}
            <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                {request.subject}
            </h4>

            {/* Equipment */}
            <div className="flex items-center text-sm text-gray-600 mb-3">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                <span className="truncate">{request.equipment_name}</span>
            </div>

            {/* Team & Technician */}
            <div className="space-y-1 mb-3">
                <div className="flex items-center text-xs text-gray-500">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{request.team_name}</span>
                </div>

                {request.assigned_technician_name && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-700">
                            <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium text-xs mr-2">
                                {request.assigned_technician_name.charAt(0)}
                            </div>
                            <span className="truncate">{request.assigned_technician_name}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Scheduled Date & Overdue Warning */}
            {request.scheduled_date && (
                <div className={`text-xs ${request.is_overdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                    <div className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {request.is_overdue ? (
                            <span className="font-semibold">OVERDUE</span>
                        ) : (
                            <span>
                                {formatDistanceToNow(new Date(request.scheduled_date), { addSuffix: true })}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Created Time */}
            <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                    Created {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                </p>
            </div>
        </div>
    );
}
