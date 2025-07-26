"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function ViewOrder() {
  const { orderId } = useParams();
  const router = useRouter();
  const [orderData, setOrderData] = useState(null);
  const [comments, setComments] = useState([]);
  const [isItemCollapsed, setIsItemCollapsed] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [newComment, setNewComment] = useState({
    commentText: "",
    commentBy: "",
    is_internal: false,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch order data
        const orderRes = await fetch(`https://printmanager-api.onrender.com/api/orders/${orderId}`);
        if (!orderRes.ok) throw new Error("Failed to fetch order");
        const data = await orderRes.json();
        setOrderData(data);
        if (data.items) {
          setIsItemCollapsed(
            data.items.reduce((acc, _, index) => ({ ...acc, [index]: false }), {})
          );
        }

        // Fetch comments for the order
        const commentsRes = await fetch(`https://printmanager-api.onrender.com/api/comments?orderId=${orderId}`);
        if (!commentsRes.ok) throw new Error("Failed to fetch comments");
        const commentsData = await commentsRes.json();
        setComments(Array.isArray(commentsData) ? commentsData : []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(error.message || "Error loading data");
      }
    }

    if (orderId) fetchData();
  }, [orderId]);

  if (!orderData) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const toggleItemCollapse = (index) => {
    setIsItemCollapsed((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const openImageViewer = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImageViewer = () => {
    setSelectedImage(null);
  };

  const getFileIcon = (extension) => {
    switch (extension.toLowerCase()) {
      case "jpg":
      case "jpeg":
      case "png":
        return <span style={{ color: "#3b82f6" }}>📷</span>;
      case "pdf":
      case "doc":
      case "docx":
        return <span style={{ color: "#ef4444" }}>📄</span>;
      case "ai":
      case "psd":
        return <span style={{ color: "#a855f7" }}>🎨</span>;
      case "zip":
      case "rar":
        return <span style={{ color: "#f97316" }}>📦</span>;
      default:
        return <span style={{ color: "#6b7280" }}>📄</span>;
    }
  };

  const handleCommentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewComment((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.commentText || !newComment.commentBy) {
      toast.error("Comment text and author are required");
      return;
    }

    try {
      const commentData = {
        orderId: parseInt(orderId),
        commentText: newComment.commentText,
        commentBy: newComment.commentBy,
        is_internal: newComment.is_internal,
      };

      const res = await fetch("https://printmanager-api.onrender.com/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentData),
      });

      if (!res.ok) throw new Error("Failed to add comment");
      const addedComment = await res.json();
      setComments((prev) => [...prev, addedComment]);
      setNewComment({ commentText: "", commentBy: "", is_internal: false });
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error(error.message || "Error adding comment");
    }
  };

  return (
    <div className="p-6">
    <div className="bg-white p-8 rounded-lg w-full border-[1px] border-[#e5e7eb]">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-medium text-gray-800 text-[24px]">Order Details - {orderData.orderNumber}</h2>
          <p className="text-[18px] text-[#9ca3af]">View details for order ID: {orderData.id}</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/order/list")}
          className="py-2 px-4 bg-[#5750f1] text-white rounded-lg hover:bg-blue-700 transition"
        >
          Back to Order List
        </button>
      </div>

      {/* Order Summary */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="bg-white p-6 rounded-lg border-[1px] border-[#e5e7eb] shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-[#111928] mb-3">Order Information</h3>
          <div className="space-y-2 text-sm text-[#111928]">
            <p><strong>Title:</strong> {orderData.title || "N/A"}</p>
            <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-lg text-xs ${getStatusColor(orderData.status)}`}>{orderData.status || "N/A"}</span></p>
            <p><strong>Start Date:</strong> {new Date(orderData.startDate).toLocaleDateString() || "N/A"}</p>
            <p><strong>Due Date:</strong> {new Date(orderData.dueDate).toLocaleDateString() || "N/A"}</p>
            <p><strong>Notes:</strong> {orderData.notes || "N/A"}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border-[1px] border-[#e5e7eb] shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-[#111928] mb-3">Customer Information</h3>
          <div className="space-y-2 text-sm text-[#111928]">
            <p><strong>Name:</strong> {orderData.customer.name || "N/A"}</p>
            <p><strong>Email:</strong> {orderData.customer.email || "N/A"}</p>
            <p><strong>Mobile:</strong> {orderData.customer.mobile || "N/A"}</p>
            <p><strong>Company:</strong> {orderData.customer.company || "N/A"}</p>
            <p><strong>Address:</strong> {orderData.customer.address || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-[#111928] mb-4">Order Items</h2>
        {orderData.items.map((item, itemIndex) => (
          <div key={item.id} className="mb-6">
            <div
              className="flex justify-between items-center p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg cursor-pointer hover:bg-[#f1f5f9]"
              onClick={() => toggleItemCollapse(itemIndex)}
            >
              <h3 className="text-md font-medium text-[#111928]">Item #{itemIndex + 1} - {item.product?.title || "N/A"}</h3>
              <span>{isItemCollapsed[itemIndex] ? "+" : "−"}</span>
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isItemCollapsed[itemIndex] ? "max-h-0" : "max-h-[1000px]"
              }`}
            >
              <div className="p-6 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg mt-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Product:</strong> {item.product?.title || "N/A"}</p>
                    <p><strong>Color:</strong> {item.color || "N/A"}</p>
                    <p><strong>Quantity:</strong> {item.quantity || "N/A"}</p>
                    <p><strong>Price:</strong> ${item.price?.toFixed(2) || "0.00"}</p>
                  </div>
                  <div>
                    <p><strong>Service:</strong> {item.product?.service?.title || "N/A"}</p>
                    <p><strong>Workflow:</strong> {item.product?.service?.workflow?.title || "N/A"}</p>
                  </div>
                </div>

                {/* Size Quantities */}
                <div>
                  <h4 className="text-md font-medium text-[#111928] mb-2">Size Quantities</h4>
                  {item.sizeQuantities.map((size, sizeIndex) => (
                    <div key={sizeIndex} className="flex gap-4 mb-2 p-2 bg-white border border-[#e5e7eb] rounded-lg">
                      <p><strong>Size:</strong> {size.Size || "N/A"}</p>
                      <p><strong>Price:</strong> ${size.Price?.toFixed(2) || "0.00"}</p>
                      <p><strong>Quantity:</strong> {size.Quantity || "0"}</p>
                    </div>
                  ))}
                </div>

                {/* Product Files with Image View */}
                <div>
                  <h4 className="text-md font-medium text-[#111928] mb-2">Product Files</h4>
                  {item.product?.files.map((file, fileIndex) => {
                    const isImage = ["jpg", "jpeg", "png"].includes(file.fileName.split('.').pop().toLowerCase());
                    return (
                      <div key={fileIndex} className="flex items-center gap-2 p-4 bg-white border border-[#e5e7eb] rounded-lg mb-2">
                        {getFileIcon(file.fileName.split('.').pop())}
                        <p className="text-sm text-[#111928] flex-1">{file.fileName}</p>
                        {isImage && (
                          <button
                            onClick={() => openImageViewer(file.filePath)}
                            className="text-[#2563eb] text-sm hover:underline"
                          >
                            View Image
                          </button>
                        )}
                        <p className="text-xs text-[#9ca3af]">Uploaded: {new Date(file.uploadedAt).toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Workflow Stages */}
                <div>
                  <h4 className="text-md font-medium text-[#111928] mb-2">Workflow Stages</h4>
                  <div className="space-y-2">
                    {item.product?.service?.workflow?.stages.map((stage, stageIndex) => (
                      <div key={stageIndex} className="flex items-center gap-2 p-2 bg-white border border-[#e5e7eb] rounded-lg">
                        <span style={{ color: stage.color }}>⬤</span>
                        <p className="text-sm text-[#111928]">{stage.title}</p>
                        <p className="text-xs text-[#9ca3af]">{stage.days} days</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Files */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-[#111928] mb-4">Order Files</h2>
        {orderData.files.map((file, fileIndex) => {
          const isImage = ["jpg", "jpeg", "png"].includes(file.fileName.split('.').pop().toLowerCase());
          return (
            <div key={fileIndex} className="flex items-center gap-2 p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg mb-2">
              {getFileIcon(file.fileName.split('.').pop())}
              <p className="text-sm text-[#111928] flex-1">{file.fileName}</p>
              {isImage && (
                <button
                  onClick={() => openImageViewer(file.filePath)}
                  className="text-[#2563eb] text-sm hover:underline"
                >
                  View Image
                </button>
              )}
              <p className="text-xs text-[#9ca3af]">Uploaded: {new Date(file.uploadedAt).toLocaleString()}</p>
            </div>
          );
        })}
      </div>

      {/* Comments Section */}
      <div>
        <h2 className="text-lg font-medium text-[#111928] mb-4">Comments</h2>
        <div className="bg-white p-6 rounded-lg border-[1px] border-[#e5e7eb] mb-6">
          <form onSubmit={handleAddComment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#111928] mb-1">Comment</label>
              <textarea
                name="commentText"
                value={newComment.commentText}
                onChange={handleCommentChange}
                className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
                placeholder="Enter your comment"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111928] mb-1">Author</label>
              <input
                type="text"
                name="commentBy"
                value={newComment.commentBy}
                onChange={handleCommentChange}
                className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5750f1]"
                placeholder="Enter your name"
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_internal"
                checked={newComment.is_internal}
                onChange={handleCommentChange}
                className="mr-2"
              />
              <label className="text-sm text-[#111928]">Internal Comment</label>
            </div>
            <button
              type="submit"
              className="py-2 px-4 bg-[#5750f1] text-white rounded-lg hover:bg-blue-700 transition"
            >
              Add Comment
            </button>
          </form>
        </div>
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <div key={index} className="space-y-2">
                <div
                  className={`p-4 rounded-lg border ${
                    comment.is_internal ? "bg-gray-100 border-gray-300" : "bg-white border-[#e5e7eb]"
                  }`}
                >
                  <p className="text-sm text-[#111928]">{comment.commentText}</p>
                  <p className="text-xs text-[#9ca3af]">
                    By: {comment.commentBy || "N/A"} on {new Date(comment.commentAt || comment.createdAt).toLocaleString()}
                    {comment.is_internal && " (Internal)"}
                  </p>
                  {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                    <p className="text-xs text-[#9ca3af]">Updated: {new Date(comment.updatedAt).toLocaleString()}</p>
                  )}
                </div>
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-6 space-y-2">
                    {comment.replies.map((reply, replyIndex) => (
                      <div
                        key={replyIndex}
                        className={`p-4 rounded-lg border ${
                          reply.is_internal ? "bg-gray-200 border-gray-300" : "bg-white border-[#e5e7eb]"
                        }`}
                      >
                        <p className="text-sm text-[#111928]">{reply.commentText}</p>
                        <p className="text-xs text-[#9ca3af]">
                          By: {reply.commentBy || "N/A"} on {new Date(reply.commentAt || reply.createdAt).toLocaleString()}
                          {reply.is_internal && " (Internal)"}
                        </p>
                        {reply.updatedAt && reply.updatedAt !== reply.createdAt && (
                          <p className="text-xs text-[#9ca3af]">Updated: {new Date(reply.updatedAt).toLocaleString()}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-[#9ca3af]">No comments available.</p>
          )}
        </div>
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-[#111928]/60 flex items-center justify-center z-50" onClick={closeImageViewer}>
          <div className="relative">
            <img src={`https://printmanager-api.onrender.com${selectedImage}`} alt="Order File" className="max-h-[80vh] max-w-[80vw] object-contain" />
            <button
              onClick={closeImageViewer}
              className="absolute top-2 right-2 text-white text-2xl hover:text-gray-300"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
    </div>
  );
}