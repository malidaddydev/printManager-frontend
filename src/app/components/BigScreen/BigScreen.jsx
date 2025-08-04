"use client";
import React, { useState, useEffect } from "react";
import axios from 'axios';
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverlay,
  useDroppableContext,
  DragOverEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  format,
  parseISO,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
} from "date-fns";
import { ToastContainer, toast } from 'react-toastify';

const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch data");
    return await response.json();
  } catch (err) {
    console.error("Fetch error:", err);
    return [];
  }
};

const updateOrderItemStage = async (itemId, newStage) => {
  try {
    await axios.put(`https://printmanager-api.onrender.com/api/orderItems/${itemId}`, {
      currentStage: newStage,
      updatedBy: sessionStorage.getItem("username"),
    });
  } catch (err) {
    console.error("Update error:", err);
  }
};

const SortableItem = ({ id, order, stageColor }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

    
    const now = new Date();
    const dueDate = order.dueDate ? parseISO(order.dueDate) : null;
    const daysDiff = dueDate ? differenceInDays(dueDate, now) : null;
    const hoursDiff = dueDate ? differenceInHours(dueDate, now) % 24 : null;
    const minutesDiff = dueDate ? differenceInMinutes(dueDate, now) % 60 : null;
    const isOverdue = dueDate && dueDate < now;
    const isDueTomorrow = dueDate && differenceInDays(dueDate, now) === 1;
    const cardClass = isOverdue
    ? "bg-white text-red-600"
    : isDueTomorrow
    ? "bg-yellow-100"
    : "bg-white";

  const shadowColor = isOverdue
    ? "rgba(255, 0, 0, 0.4)" // red
    : isDueTomorrow
    ? "rgba(255, 204, 0, 0.4)" // yellow
    : stageColor;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "manipulation",
    WebkitUserSelect: "none",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    cursor: "grab",
    boxShadow: `0 1px 15px -5px ${shadowColor}`,
  };

  const dueDisplay = isOverdue
    ? "(Due date passed)"
    : dueDate
    ? `(${daysDiff}d ${hoursDiff}h ${minutesDiff}m left)`
    : "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`select-none p-4 rounded-lg cursor-grab active:cursor-grabbing ${cardClass}`}
    >
      <h3 className="font-bold">
        {order.orderId}
      </h3>
      <h3 className="font-bold">
        {order.product?.title}
      </h3>
      <p className="text-sm text-gray-700">
        {order.customer?.name}
      </p>
      <p className="text-sm text-gray-700">
        Due: {dueDate ? format(dueDate, "PP") : "N/A"} {dueDisplay}
      </p>
      <p className="text-sm">Quty: {order.quantity}</p>
      <p className="text-sm">(S-{order.sizeQuantities?.[0]?.Size})</p>
      <p className="text-sm">{order.product?.service?.title}</p>
      <p className="text-sm text-blue-600">{order.currentStage}</p>
    </div>
  );
};

const SortableStage = ({ stage, orders, isOverTarget }) => {
  const { setNodeRef } = useDroppable({ id: stage.title });
  const highlightStyle = isOverTarget ? "bg-blue-50 border-blue-400" : "bg-white border-[#e2e8f0]";

  return (
    <div
      ref={setNodeRef}
      className={`p-4 border flex flex-col items-center transition-colors duration-200 ${highlightStyle}`}
    >
      <h2 className="text-lg font-semibold mb-4" style={{ color: stage.color }}>
        {stage.title} ({orders.length})
      </h2>
      <SortableContext
        id={stage.title}
        items={orders.map((order) => order.id.toString())}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4 w-full">
          {orders.map((order) => (
            <SortableItem key={order.id} id={order.id.toString()} order={order} stageColor={stage.color} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

export default function BigScreen() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeId, setActiveId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const activeItem = orderItems.find((item) => item.id.toString() === activeId);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 0,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 100,
      tolerance: 5,
    },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  const fetchAllData = async () => {
    setLoading(true);
    const servicesData = await fetchData("https://printmanager-api.onrender.com/api/services");
    const ordersData = await fetchData("https://printmanager-api.onrender.com/api/orders");
    const allItems = ordersData.flatMap((order) =>
      (order.items || []).map((item) => ({
        ...item,
        orderId: order.orderNumber,
        dueDate: order.dueDate,
        customer: order.customer,
        product: item.product,
        sizeQuantities: item.sizeQuantities,
      }))
    );
    setServices(servicesData);
    setOrderItems(allItems);
    if (!selectedService && servicesData.length > 0) {
      setSelectedService(servicesData[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const onDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    setDragOverId(null);
    if (!over || active.id === over.id) return;

    const draggedIndex = orderItems.findIndex((item) => item.id.toString() === active.id);
    if (draggedIndex === -1) return;

    const updatedItem = {
      ...orderItems[draggedIndex],
      currentStage: over.id,
    };

    const newOrderItems = [...orderItems];
    newOrderItems[draggedIndex] = updatedItem;
    setOrderItems(newOrderItems);

    updateOrderItemStage(updatedItem.id, over.id);
  };

  const filteredOrderItems = selectedService && selectedService.workflow
    ? orderItems.filter(
        (item) =>
          item.product?.serviceId === selectedService.id &&
          selectedService.workflow.stages.some((s) => s.title === item.currentStage)
)
    : [];

  const getOrderItemsByStage = (stageTitle) =>
    filteredOrderItems.filter((item) => item.currentStage === stageTitle);

  return (
    <>
      <div className="">
        <div className="bg-white px-8 pb-8">
          <div className="flex justify-between items-center mb-8 w-full border-[#e2e8f0] border p-6 shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
            <h1 className="text-2xl font-bold">
              Title: {selectedService?.title} Workflow
            </h1>
            <div className="w-full max-w-xs">
            <select
              className="w-full max-w-xs px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
              value={selectedService?.id || ""}
              onChange={(e) => {
                const service = services.find((s) => s.id === parseInt(e.target.value));
                setSelectedService(service);
              }}
            >
              <option value="" disabled>
                Select a service
              </option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-lg">Loading...</div>
          ) : !selectedService ? (
            <div className="text-center text-lg">No services available</div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
              onDragStart={({ active }) => setActiveId(active.id)}
              onDragOver={({ over }) => setDragOverId(over?.id || null)}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {selectedService.workflow.stages.map((stage) => (
                  <SortableStage
                    key={stage.id}
                    stage={stage}
                    orders={getOrderItemsByStage(stage.title)}
                    isOverTarget={dragOverId === stage.title}
                  />
                ))}
              </div>
              <DragOverlay>
                {activeItem ? (
                  <div className="p-4 bg-white border border-[#e2e8f0] shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
                    {activeItem.product?.title}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </div>
      <ToastContainer />
      <div className="bg-white w-full z-50 p-8 flex justify-end items-center ">
        <div className="gap-2 border flex items-center px-[20px] py-[5px] rounded-full border-[#e2e8f0]">
          <div className="w-[12px] h-[12px] bg-green-500 rounded-full animate-pulse"></div>Auto-refresh: 30s
        </div>
      </div>
    </>
  );
}
