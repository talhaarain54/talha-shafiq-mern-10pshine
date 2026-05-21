import toast from "react-hot-toast";

export const handleApiError = (error) => {
  console.error("API Error Debug:", {
    status: error.response?.status,
    data: error.response?.data,
    config: error.config,
  });

  // Handle Network Errors (Server down, DNS failure, or CORS block)
  if (!error.response) {
    const netMessage =
      "Network error: The server is unreachable. Check your connection";
    toast.error(netMessage);
    return netMessage;
  }

  // Handle Structured Validation Errors (e.g., Zod array from your middleware)
  const zodErrors = error.response?.data?.errors;
  if (Array.isArray(zodErrors)) {
    zodErrors.forEach((err) => {
      toast.error(err.message || "Validation failed");
    });
    return zodErrors[0]?.message;
  }

  // Handle Specific Backend Responses (Mongoose, JWT, or Custom)
  const message =
    error.response?.data?.error ||
    error.response?.data?.message ||
    `Error ${error.response.status}: Action failed.`;

  // Categorize and Toast based on HTTP Status Codes
  const status = error.response.status;

  if (status === 401) {
    const msg =  error.response?.data?.message || error.response?.data?.error || "Session expired. Please log in again.";
    toast.error(msg);
  } else if (status === 403) {
    toast.error("You do not have permission to perform this action.");
  } else if (status === 404) {
    toast.error("Requested resource not found.");
  } else if (status >= 500) {
    toast.error("Internal Server Error. Our team has been notified.");
  } else {
    toast.error(message);
  }

  return message;
};
