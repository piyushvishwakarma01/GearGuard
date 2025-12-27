import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import RequestCard from './RequestCard';

export default function KanbanColumn({ id, title, color, requests }) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col bg-white rounded-lg border-2 ${color} ${isOver ? 'ring-2 ring-primary-500' : ''
                } transition-all`}
        >
            {/* Column Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-gray-700 bg-gray-200 rounded-full">
                        {requests.length}
                    </span>
                </div>
            </div>

            {/* Column Content */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-[500px] max-h-[calc(100vh-300px)]">
                <SortableContext
                    items={requests.map((req) => req.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {requests.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                            No requests
                        </div>
                    ) : (
                        requests.map((request) => (
                            <RequestCard key={request.id} request={request} />
                        ))
                    )}
                </SortableContext>
            </div>
        </div>
    );
}
