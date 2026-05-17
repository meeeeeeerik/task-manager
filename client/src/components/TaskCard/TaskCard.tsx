import { Box, Typography, Chip, Avatar, AvatarGroup, LinearProgress, Tooltip } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ChecklistIcon from '@mui/icons-material/Checklist';
import { observer } from 'mobx-react-lite';

import { boardStore } from '../../stores/boardStore';
import { themeStore, PRIORITY_CONFIG, LABEL_CONFIG } from '../../theme';
import { formatDue, isOverdue } from '../../utils/format';
import type { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent, taskId: string, colId: string) => void;
}

const TaskCard = observer(function TaskCard({ task, onDragStart }: TaskCardProps) {
  const dark = themeStore.isDark;
  const priority = PRIORITY_CONFIG[task.priority];
  const label = task.label ? LABEL_CONFIG[task.label] : null;
  const doneItems = task.checklist.filter((c) => c.done).length;
  const checkProgress = task.checklist.length ? (doneItems / task.checklist.length) * 100 : 0;
  const overdue = isOverdue(task.dueDate);

  return (
    <Box
      draggable
      onDragStart={(e) => onDragStart(e, task.id, task.columnId)}
      onClick={() => boardStore.setSelectedTask(task)}
      sx={{
        backgroundColor: dark ? '#242938' : '#fff',
        border: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
        borderRadius: 2.5,
        p: 1.5,
        cursor: 'pointer',
        transition: 'box-shadow 0.18s, transform 0.18s',
        '&:hover': {
          boxShadow: dark ? '0 6px 20px rgba(0,0,0,0.4)' : '0 6px 20px rgba(0,0,0,0.12)',
          transform: 'translateY(-2px)',
        },
        '&:active': { opacity: 0.85 },
        borderLeft: `3px solid ${priority.color}`,
        userSelect: 'none',
      }}
    >
      {task.label && label && (
        <Chip
          label={task.label}
          size="small"
          sx={{
            mb: 1,
            height: 18,
            fontSize: 10,
            backgroundColor: label.bg,
            color: label.color,
            fontWeight: 700,
          }}
        />
      )}

      <Typography variant="body2" fontWeight={700} sx={{ mb: 1, lineHeight: 1.4 }}>
        {task.title}
      </Typography>

      {task.checklist.length > 0 && (
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}
            >
              <ChecklistIcon sx={{ fontSize: 12 }} />
              {doneItems}/{task.checklist.length}
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={checkProgress}
            sx={{
              height: 4,
              borderRadius: 4,
              backgroundColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: checkProgress === 100 ? '#4CAF50' : 'primary.main',
                borderRadius: 4,
              },
            }}
          />
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: 0.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {task.dueDate && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <AccessTimeIcon
                sx={{ fontSize: 12, color: overdue ? 'error.main' : 'text.disabled' }}
              />
              <Typography
                variant="caption"
                color={overdue ? 'error.main' : 'text.secondary'}
                fontWeight={overdue ? 700 : 400}
              >
                {formatDue(task.dueDate)}
              </Typography>
            </Box>
          )}

          {task.comments.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <ChatBubbleOutlineIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.secondary">
                {task.comments.length}
              </Typography>
            </Box>
          )}

          {task.attachments > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <AttachFileIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.secondary">
                {task.attachments}
              </Typography>
            </Box>
          )}
        </Box>

        {task.assignees.length > 0 && (
          <AvatarGroup
            max={3}
            sx={{ '& .MuiAvatar-root': { width: 22, height: 22, fontSize: 10, fontWeight: 700 } }}
          >
            {task.assignees.map((a) => (
              <Tooltip key={a.id} title={a.name}>
                <Avatar src={a.avatar} sx={{ backgroundColor: a.color }}>
                  {a.name[0]}
                </Avatar>
              </Tooltip>
            ))}
          </AvatarGroup>
        )}
      </Box>
    </Box>
  );
});

export { TaskCard };
