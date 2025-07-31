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
  DragOverlay
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
    const res = await axios.put(`https://printmanager-api.onrender.com/api/orderItems/${itemId}`, {
      currentStage: newStage,
      updatedBy: sessionStorage.getItem("username"),
    });
    return res.data;
  } catch (err) {
    console.error("Update error:", err);
    return null;
  }
};

const SortableItem = ({ id, order, stageColor }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "manipulation",
    WebkitUserSelect: "none",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    cursor: "grab",
    borderColor: stageColor,
  };

  const now = new Date();
  const dueDate = order.dueDate ? parseISO(order.dueDate) : null;
  const daysDiff = dueDate ? differenceInDays(dueDate, now) : null;
  const hoursDiff = dueDate ? differenceInHours(dueDate, now) % 24 : null;
  const minutesDiff = dueDate ? differenceInMinutes(dueDate, now) % 60 : null;
  const isOverdue = dueDate && dueDate < now;
  const isDueTomorrow = dueDate && differenceInDays(dueDate, now) === 1;

  const cardClass = isOverdue
    ? "border-red-500 bg-red-100"
    : isDueTomorrow
    ? "border-yellow-400 bg-yellow-100"
    : `border-[${stageColor}] bg-white`;

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
      className={`select-none p-4 rounded-lg shadow-md border cursor-grab active:cursor-grabbing ${cardClass}`}
    >
      <h3 className="font-bold">
        Order: {order.orderId} - {order.product?.title}
      </h3>
      <p className="text-sm text-gray-700">
        Customer: {order.customer?.name}
      </p>
      <p className="text-sm text-gray-700">
        Due: {dueDate ? format(dueDate, "PP") : "N/A"} {dueDisplay}
      </p>
      <p className="text-sm">Quantity: {order.quantity}</p>
      <p className="text-sm">Size: {order.sizeQuantities?.[0]?.Size}</p>
      <p className="text-sm">Service: {order.product?.service?.title}</p>
      <p className="text-sm text-blue-600">Stage: {order.currentStage}</p>
    </div>
  );
};

const SortableStage = ({ stage, orders }) => {
  const { setNodeRef } = useDroppable({ id: stage.title });

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-50 p-4 rounded-lg border"
      style={{ borderColor: stage.color }}
    >
      <h2 className="text-lg font-semibold mb-4" style={{ color: stage.color }}>
        {stage.title} ({orders.length})
      </h2>
      <SortableContext
        id={stage.title}
        items={orders.map((order) => order.id.toString())}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
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
    if (!over || active.id === over.id) return;

    const activeItem = orderItems.find((item) => item.id.toString() === active.id);
    const overStage = selectedService.workflow.stages.find(s => s.title === over.id);

    if (!overStage) return;

    if (activeItem && activeItem.currentStage !== overStage.title) {
      const res = await updateOrderItemStage(activeItem.id, overStage.title);
      if (res) {
        toast.success("Stage updated successfully via drag and drop");
        await fetchAllData();
      } else {
        toast.error("Failed to update stage via drag and drop");
      }
    }
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
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              Title: {selectedService?.title} Workflow
            </h1>
            <div className="text-lg">{format(currentTime, "PPpp")}</div>
          </div>

          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">Select Service:</label>
            <select
              className="w-full max-w-xs p-2 border rounded-md"
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
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {selectedService.workflow.stages.map((stage) => (
                  <SortableStage
                    key={stage.id}
                    stage={stage}
                    orders={getOrderItemsByStage(stage.title)}
                  />
                ))}
              </div>
              <DragOverlay>
                {activeItem ? (
                  <div className="p-4 bg-white border shadow-md rounded-md">
                    {activeItem.product?.title}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
