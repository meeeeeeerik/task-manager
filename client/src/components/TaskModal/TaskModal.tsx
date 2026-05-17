import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  TextField,
  Avatar,
  AvatarGroup,
  Button,
  Divider,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  LinearProgress,
  Checkbox,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import ChecklistIcon from '@mui/icons-material/Checklist';
import { observer } from 'mobx-react-lite';

import { boardStore } from '../../stores/boardStore';
import { themeStore, PRIORITY_CONFIG } from '../../theme';
import { timeAgo, isOverdue } from '../../utils/format';
import type { Priority, Label } from '../../types';

const PRIORITIES: Priority[] = ['urgent', 'high', 'medium', 'low'];
const LABELS: Label[] = ['feature', 'bug', 'design', 'docs', 'devops', 'marketing', ''];

const TaskModal = observer(function TaskModal() {
  const task = boardStore.selectedTask;
  const dark = themeStore.isDark;
  const [comment, setComment] = useState('');
  const [newCheckItem, setNewCheckItem] = useState('');

  if (!task) return null;

  const doneItems = task.checklist.filter((c) => c.done).length;
  const checkProgress = task.checklist.length ? (doneItems / task.checklist.length) * 100 : 0;

  function handleUpdate(field: string, value: unknown) {
    boardStore.updateTask(task!.id, { [field]: value });
  }

  async function handleAddComment() {
    if (!comment.trim()) return;
    await boardStore.addComment(task!.id, comment.trim());
    setComment('');
  }

  async function handleAddCheckItem() {
    if (!newCheckItem.trim()) return;
    const newItem = { id: `ch-${Date.now()}`, text: newCheckItem.trim(), done: false };
    await boardStore.updateTask(task!.id, { checklist: [...task!.checklist, newItem] });
    setNewCheckItem('');
  }

  async function handleDelete() {
    await boardStore.deleteTask(task!.id, task!.columnId);
  }

  return (
    <Dialog
      open={true}
      onClose={() => boardStore.setSelectedTask(null)}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, backgroundColor: 'background.paper' } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 1,
          }}
        >
          <TextField
            fullWidth
            variant="standard"
            value={task.title}
            onChange={(e) => handleUpdate('title', e.target.value)}
            inputProps={{ style: { fontSize: 18, fontWeight: 800 } }}
            sx={{
              '& .MuiInput-underline:before': { borderBottom: 'none' },
              '& .MuiInput-underline:hover:before': { borderBottom: '1px solid rgba(0,0,0,0.2)' },
            }}
          />

          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
            <Tooltip title="Delete task">
              <IconButton size="small" onClick={handleDelete} sx={{ color: 'error.main' }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <IconButton size="small" onClick={() => boardStore.setSelectedTask(null)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' }, mt: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Add a description..."
              value={task.description}
              onChange={(e) => handleUpdate('description', e.target.value)}
              variant="outlined"
              size="small"
              label="Description"
              sx={{ mb: 2 }}
            />

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ChecklistIcon fontSize="small" color="action" />

                <Typography variant="subtitle2" fontWeight={700}>
                  Checklist
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {doneItems}/{task.checklist.length}
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={checkProgress}
                  sx={{
                    flex: 1,
                    height: 6,
                    borderRadius: 4,
                    backgroundColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: checkProgress === 100 ? '#4CAF50' : 'primary.main',
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>

              {task.checklist.map((item) => (
                <FormControlLabel
                  key={item.id}
                  control={
                    <Checkbox
                      checked={item.done}
                      onChange={() => boardStore.toggleChecklist(task.id, item.id)}
                      size="small"
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{
                        textDecoration: item.done ? 'line-through' : 'none',
                        color: item.done ? 'text.disabled' : 'text.primary',
                      }}
                    >
                      {item.text}
                    </Typography>
                  }
                  sx={{ display: 'flex', ml: 0, mb: 0.3 }}
                />
              ))}

              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <TextField
                  size="small"
                  placeholder="Add item..."
                  value={newCheckItem}
                  onChange={(e) => setNewCheckItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCheckItem();
                  }}
                  sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />

                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleAddCheckItem}
                  sx={{ borderRadius: 2 }}
                >
                  Add
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
              Comments
            </Typography>

            {task.comments.map((c) => (
              <Box key={c.id} sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                <Avatar
                  src={c.author?.avatar}
                  sx={{ width: 30, height: 30, fontSize: 12, backgroundColor: c.author?.color }}
                >
                  {c.author?.name[0]}
                </Avatar>

                <Box>
                  <Box
                    sx={{
                      backgroundColor: 'action.hover',
                      borderRadius: 2,
                      px: 1.5,
                      py: 1,
                      mb: 0.3,
                    }}
                  >
                    <Typography variant="caption" fontWeight={700} display="block">
                      {c.author?.name}
                    </Typography>

                    <Typography variant="body2">{c.text}</Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    {timeAgo(c.createdAt)}
                  </Typography>
                </Box>
              </Box>
            ))}

            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />

              <IconButton onClick={handleAddComment} disabled={!comment.trim()} color="primary">
                <SendIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Box
            sx={{
              width: { sm: 200 },
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <FormControl size="small" fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={task.priority}
                label="Priority"
                onChange={(e) => handleUpdate('priority', e.target.value)}
              >
                {PRIORITIES.map((p) => (
                  <MenuItem key={p} value={p}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: PRIORITY_CONFIG[p].color,
                        }}
                      />
                      {PRIORITY_CONFIG[p].label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Label</InputLabel>
              <Select
                value={task.label}
                label="Label"
                onChange={(e) => handleUpdate('label', e.target.value)}
              >
                {LABELS.map((l) => (
                  <MenuItem key={l || 'none'} value={l}>
                    {l || 'None'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Due Date"
              type="date"
              size="small"
              value={task.dueDate}
              onChange={(e) => handleUpdate('dueDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ style: { color: isOverdue(task.dueDate) ? '#f44336' : 'inherit' } }}
            />

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                display="block"
                mb={0.8}
              >
                Assignees
              </Typography>

              <AvatarGroup
                max={5}
                sx={{
                  justifyContent: 'flex-start',
                  '& .MuiAvatar-root': { width: 28, height: 28, fontSize: 11, fontWeight: 700 },
                }}
              >
                {task.assignees.map((a) => (
                  <Tooltip key={a.id} title={a.name}>
                    <Avatar src={a.avatar} sx={{ backgroundColor: a.color }}>
                      {a.name[0]}
                    </Avatar>
                  </Tooltip>
                ))}
              </AvatarGroup>

              {boardStore.activeBoard?.members.map((member) => {
                const isAssigned = task.assigneeIds.includes(member.id);
                return (
                  <Box
                    key={member.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mt: 0.8,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      const newIds = isAssigned
                        ? task.assigneeIds.filter((id) => id !== member.id)
                        : [...task.assigneeIds, member.id];
                      handleUpdate('assigneeIds', newIds);
                    }}
                  >
                    <Checkbox checked={isAssigned} size="small" sx={{ p: 0 }} />

                    <Avatar
                      src={member.avatar}
                      sx={{ width: 24, height: 24, fontSize: 10, backgroundColor: member.color }}
                    >
                      {member.name[0]}
                    </Avatar>

                    <Typography variant="caption" fontWeight={600}>
                      {member.name}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            <Typography variant="caption" color="text.disabled">
              Created {timeAgo(task.createdAt)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
});

export { TaskModal };
