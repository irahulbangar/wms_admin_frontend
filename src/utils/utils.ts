export const fromatDateWithTime = (date: string) => {
  return new Date(date).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
};

export const handleStatus = (status: string) => {
  if (status === "Active" || status === "active") {
    return "bg-green-100 text-status-success";
  } else if (status === "Inactive" || status === "inactive") {
    return "bg-red-100 text-status-danger";
  } else {
    return "bg-yellow-100 text-status-warning";
  }
};
