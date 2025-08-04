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
import Image from "next/image";
import Logo from "/public/assets/images/xpress-soccer.png"
import BgImage from "/public/assets/images/bg.jpg"

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
    ? "bg-red-100 backdrop-blur-lg border border-white/30 text-red-600 pulse-glow"
    : isDueTomorrow
    ? "bg-yellow-100"
    : "bg-white/70 backdrop-blur-lg border border-white/30";

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
    ? `<span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">🔥 (Due date passed)</span>`
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
      <div className="flex items-center justify-between">
        <div className="inline-block bg-purple-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
          {order.orderId}
        </div>
        <div className="inline-block bg-purple-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{order.product?.service?.title}</div>
      </div>
      <div className="space-y-1 text-sm text-gray-600">
        <div className="flex items-center gap-2 text-gray-800 w-full">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"></path>
            </svg>
          </div>
          <div>{order.customer?.firstName} {order.customer?.lastName}</div>
        </div>
      </div>
      <p className="flex items-center gap-2 text-black text-base font-semibold">{order.product?.title}</p>
      <p className="flex items-center gap-1">
        <span className="font-medium text-gray-800">
          Qty:
        </span>
        <span className="text-[#4b5563]">{order.quantity}</span>
        <span className="text-[#4b5563]">(S-{order.sizeQuantities?.[0]?.Size})</span>
      </p>
      <p className="flex items-center gap-2 text-gray-900 font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      <span>
        Due: {dueDate ? format(dueDate, "PP") : "N/A"} <span dangerouslySetInnerHTML={{ __html: dueDisplay }} />
      </span>
      </p>
      <p className="text-sm text-blue-600">{order.currentStage}</p>
    </div>
  );
};

const SortableStage = ({ stage, orders, isOverTarget }) => {
  const { setNodeRef } = useDroppable({ id: stage.title });
  const highlightStyle = isOverTarget ? "bg-white/70 backdrop-blur-lg border border-white/30" : "bg-white/10 backdrop-blur-md border border-white/20";

  return (
    <div
      ref={setNodeRef}
      className={`p-4 border flex flex-col items-center transition-colors duration-200 rounded-lg shadow-lg ${highlightStyle}`}
    >
      <h2 className="text-lg font-semibold mb-4 w-full border-b-[2px] pb-[10px]" style={{ color: stage.color }}>
        {stage.title} ({orders.length})
      </h2>
      <SortableContext
        id={stage.title}
        items={orders.map((order) => order.id.toString())}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4 w-full overflow-y-scroll h-[183px] sm:h-auto sm:overflow-hidden">
          {orders.map((order) => (
            <SortableItem key={order.id} id={order.id.toString()} order={order} stageColor={stage.color} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

export default function BigScreennnn() {
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
    console.log(allItems)
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
      <div>
        <Image
          src={BgImage}
          alt="Bg-Image"
          className="w-full h-[100vh] fixed -z-10"
        />
        <div>
          <div className="bg-gray-800 text-white min-h-[4rem] flex items-center justify-between px-6 py-4 sm:py-6 shadow-lg mb-8">
            <div className="flex items-center space-x-4">
              <Image 
              src={Logo}
              alt="Logo"
              className="w-[110px] h-[28px]"
              />
            </div>
            <h1 className="text-2xl font-bold hidden sm:block">
              {selectedService?.title} Team Workflow
            </h1>
            <div className="w-full max-w-[220px]">
            <select
              className="w-full max-w-[220px] px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
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
                <option key={service.id} value={service.id} className="text-[#111928]">
                  {service.title}
                </option>
              ))}
            </select>
            </div>
          </div>

          <div className="px-6 pb-12">
            {loading ? (
            <div className="w-full flex justify-center items-center">
               <svg className="animate-spin h-10 w-10 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
            </div>
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
      </div>
      <ToastContainer />
    </>
  );
}
