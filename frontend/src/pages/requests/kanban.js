import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Layout from '../../components/layout/Layout';
import KanbanColumn from '../../components/kanban/KanbanColumn';
import RequestCard from '../../components/kanban/RequestCard';
import api from '../../lib/api';
import { KANBAN_COLUMNS } from '../../lib/constants';
import { toast } from 'react-hot-toast';

export default function KanbanPage() {
    const [requests, setRequests] = useState({
        New: [],
        'In Progress': [],
        Repaired: [],
        Scrap: [],
    });
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await api.get('/api/requests/kanban');
            setRequests(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch requests');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Find which column the card came from
        let sourceColumn = null;
        let activeCard = null;

        for (const [column, cards] of Object.entries(requests)) {
            const found = cards.find((card) => card.id === activeId);
            if (found) {
                sourceColumn = column;
                activeCard = found;
                break;
            }
        }

        if (!activeCard) return;

        // Determine target column
        let targetColumn = overId;
        if (!KANBAN_COLUMNS.some((col) => col.id === overId)) {
            // Dropped on a card, find its column
            for (const [column, cards] of Object.entries(requests)) {
                if (cards.some((card) => card.id === overId)) {
                    targetColumn = column;
                    break;
                }
            }
        }

        // If dropped in same column, no action
        if (sourceColumn === targetColumn) return;

        // Validate status transition
        const validTransitions = {
            New: ['In Progress'],
            'In Progress': ['Repaired', 'Scrap'],
            Repaired: [],
            Scrap: [],
        };

        if (!validTransitions[sourceColumn]?.includes(targetColumn)) {
            toast.error(
                `Invalid transition from ${sourceColumn} to ${targetColumn}. ` +
                `Allowed: ${validTransitions[sourceColumn]?.join(', ') || 'None'}`
            );
            return;
        }

        // Check if technician is assigned for moving to In Progress
        if (targetColumn === 'In Progress' && !activeCard.assigned_technician_id) {
            toast.error('Request must be assigned to a technician before moving to In Progress');
            return;
        }

        // Update UI optimistically
        const newRequests = { ...requests };
        newRequests[sourceColumn] = newRequests[sourceColumn].filter((card) => card.id !== activeId);
        newRequests[targetColumn] = [...newRequests[targetColumn], { ...activeCard, status: targetColumn }];
        setRequests(newRequests);

        // Update backend
        try {
            let updateData = { status: targetColumn };

            // If moving to Repaired or Scrap, prompt for duration (simplified - you can add modal)
            if (targetColumn === 'Repaired' || targetColumn === 'Scrap') {
                const duration = prompt('Enter duration hours:');
                if (!duration || isNaN(parseFloat(duration))) {
                    toast.error('Valid duration hours required');
                    // Revert optimistic update
                    fetchRequests();
                    return;
                }
                updateData.duration_hours = parseFloat(duration);

                if (targetColumn === 'Scrap') {
                    const notes = prompt('Enter reason for scrapping:');
                    if (notes) {
                        updateData.completion_notes = notes;
                    }
                }
            }

            await api.patch(`/api/requests/${activeId}/status`, updateData);
            toast.success(`Request moved to ${targetColumn}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update request status');
            // Revert optimistic update
            fetchRequests();
        }
    };

    const activeRequest = activeId
        ? Object.values(requests)
            .flat()
            .find((req) => req.id === activeId)
        : null;

    if (loading) {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Maintenance Kanban Board</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Drag requests between columns to update their status
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={fetchRequests}
                            className="btn btn-secondary"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                        <Link href="/requests/new" className="btn btn-primary">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Request
                        </Link>
                    </div>
                </div>

                {/* Workflow Info */}
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Workflow Rules:</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-700">
                                <li>New → In Progress (requires assigned technician)</li>
                                <li>In Progress → Repaired (requires duration hours)</li>
                                <li>In Progress → Scrap (marks equipment as unusable)</li>
                                <li>Only team members can move their team's requests</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Kanban Board */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {KANBAN_COLUMNS.map((column) => (
                            <KanbanColumn
                                key={column.id}
                                id={column.id}
                                title={column.title}
                                color={column.color}
                                requests={requests[column.id] || []}
                            />
                        ))}
                    </div>

                    <DragOverlay>
                        {activeRequest ? (
                            <div className="transform rotate-3 scale-105 opacity-90">
                                <RequestCard request={activeRequest} isDragging />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </Layout>
    );
}
