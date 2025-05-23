import { Link } from "react-router-dom";
import { Clock, Flag, Paperclip, User } from "react-feather";
import { formatDate } from "../utils/formatters";

const TaskCard = ({ task }) => {
  // Status class mapping
  const statusClasses = {
    pending: "status-pending",
    "in-progress": "status-in-progress",
    completed: "status-completed",
  };

  // Priority class mapping
  const priorityClasses = {
    high: "priority-high",
    medium: "priority-medium",
    low: "priority-low",
  };

  // Format status for display
  const formatStatus = (status) => {
    if (typeof status !== "string") return "Unknown Status";
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get icon for status
  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return '🔶';
      case 'in-progress': return '🔄';
      case 'completed': return '✅';
      default: return '❓';
    }
  };

  return (
    <Link 
      to={`/tasks/${task?._id ?? "#"}`} 
      className="task-card slide-up"
      style={{ animationDelay: '50ms' }}
    >
      <div className="task-header">
        <h3 className="task-title">{task?.title ?? "Untitled Task"}</h3>
        <span className={`task-status ${statusClasses[task?.status] || ""}`}>
          {getStatusIcon(task?.status)} {formatStatus(task?.status)}
        </span>
      </div>

      <p className="task-description line-clamp-2">
        {task?.description ?? "No description provided."}
      </p>

      <div className="flex flex-wrap gap-2 mt-3 mb-1">
        {task?.tags?.map((tag, index) => (
          <span 
            key={index}
            className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 shadow-sm"
            style={{ borderLeft: '3px solid var(--primary)' }}
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="task-meta">
        <div className="task-date">
          <Clock size={14} />
          <span>{formatDate(task?.dueDate)}</span>
        </div>

        <div className={`task-priority ${priorityClasses[task?.priority] || ""}`}>
          <Flag size={14} />
          <span>
            {typeof task?.priority === "string"
              ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
              : "Not Set"}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={12} color="var(--primary)" />
          </div>
          <span className="font-medium">
            {task?.assignedTo?.name ?? "Unassigned"}
          </span>
        </div>
        
        {Array.isArray(task?.documents) && task.documents.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
              <Paperclip size={12} color="var(--text-secondary)" />
            </div>
            <span>{task.documents.length} {task.documents.length === 1 ? 'file' : 'files'}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default TaskCard;
