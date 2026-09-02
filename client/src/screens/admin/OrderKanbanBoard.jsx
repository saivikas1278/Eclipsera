import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const columns = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const OrderKanbanBoard = ({ orders, onDragEnd, onOrderClick }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-6 pt-2 h-[calc(100vh-250px)] custom-scrollbar">
        {columns.map((columnId) => {
          const columnOrders = orders.filter((o) => (o.fulfillmentStatus || 'PENDING') === columnId);

          return (
            <div key={columnId} className="flex flex-col bg-surface/40 backdrop-blur-md rounded-2xl border border-accent-gold/20 min-w-[320px] w-[320px] flex-shrink-0">
              <div className="p-4 border-b border-accent-gold/10 flex justify-between items-center bg-bg-base/50 rounded-t-2xl">
                <h3 className="font-bold text-text-primary uppercase tracking-widest text-sm flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${columnId === 'DELIVERED' ? 'bg-green-500' : columnId === 'CANCELLED' ? 'bg-red-500' : 'bg-accent-gold'}`}></span>
                  {columnId}
                </h3>
                <span className="bg-bg-base px-2 py-1 rounded-lg text-xs font-bold text-text-secondary border border-accent-gold/20 shadow-inner">
                  {columnOrders.length}
                </span>
              </div>
              
              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 p-4 overflow-y-auto custom-scrollbar transition-colors ${snapshot.isDraggingOver ? 'bg-accent-gold/5' : ''}`}
                  >
                    {columnOrders.map((order, index) => (
                      <Draggable key={order._id} draggableId={order._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => onOrderClick(order)}
                            className={`bg-bg-base p-4 rounded-xl border mb-3 cursor-pointer shadow-sm transition-all
                              ${snapshot.isDragging ? 'border-accent-gold shadow-[0_8px_30px_rgba(212,175,55,0.2)] rotate-2 scale-105 z-50' : 'border-accent-gold/10 hover:border-accent-gold/40 hover:-translate-y-1 hover:shadow-md'}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-bold text-text-secondary">#{order._id.substring(18)}</span>
                              <span className="text-xs font-bold text-accent-gold">₹{order.totalPrice.toFixed(2)}</span>
                            </div>
                            <h4 className="text-sm font-bold text-text-primary mb-1 line-clamp-2">
                              {order.orderItems?.map(i => i.name).join(', ') || 'Custom Order'}
                            </h4>
                            <div className="flex justify-between items-center mt-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-accent-gold/10 flex items-center justify-center text-[10px] font-bold text-accent-gold uppercase">
                                  {order.user?.name ? order.user.name.substring(0, 2) : 'NA'}
                                </div>
                                <span className="text-xs font-medium text-text-secondary truncate max-w-[100px]">{order.user?.name || 'Deleted'}</span>
                              </div>
                              <span className="text-[10px] text-text-secondary font-medium">
                                {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default OrderKanbanBoard;
