import { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Chip,
  Menu,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import { observer } from 'mobx-react-lite';

import { boardStore } from '../../stores/boardStore';
import { themeStore } from '../../theme';
import { TaskCard } from '../TaskCard/TaskCard';
import type { Column as ColumnType } from '../../types';

interface Props {
  column: ColumnType;
  onDragStart: (e: React.DragEvent, taskId: string, colId: string) => void;
  onDrop: (e: React.DragEvent, toColId: string) => void;
}

const Column = observer(function Column({ column, onDragStart, onDrop }: Props) {
  const dark = themeStore.isDark;
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const [taskError, setTaskError] = useState('');

  async function handleAddTask() {
    if (!newTaskTitle.trim()) return;
    setTaskError('');
    try {
      await boardStore.createTask(column.id, { title: newTaskTitle.trim(), priority: 'medium' });
      setNewTaskTitle('');
      setIsAddingTask(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setTaskError(msg || 'Failed to create task. Is the server running?');
    }
  }

  async function handleDeleteColumn() {
    setAnchor(null);
    await boardStore.deleteColumn(column.id);
  }

  return (
    <Box
      sx={{
        flex: '1 1 280px',
        minWidth: 260,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
        borderRadius: 3,
        p: 1.5,
        border: isDragOver
          ? `2px dashed ${column.color}`
          : dark
            ? '1px solid rgba(255,255,255,0.07)'
            : '1px solid rgba(0,0,0,0.07)',
        transition: 'border 0.15s, background 0.15s',
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        setIsDragOver(false);
        onDrop(e, column.id);
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, px: 0.5 }}>
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: column.color,
            flexShrink: 0,
          }}
        />

        <Typography variant="body2" fontWeight={800} sx={{ flex: 1 }}>
          {column.title}
        </Typography>

        <Chip
          label={column.tasks.length}
          size="small"
          sx={{
            height: 20,
            fontSize: 11,
            backgroundColor: `${column.color}22`,
            color: column.color,
            fontWeight: 700,
          }}
        />

        <IconButton
          size="small"
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{ color: 'text.disabled' }}
        >
          <MoreVertIcon sx={{ fontSize: 16 }} />
        </IconButton>

        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
          <MenuItem onClick={handleDeleteColumn} sx={{ color: 'error.main', fontSize: 14 }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete Column
          </MenuItem>
        </Menu>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} onDragStart={onDragStart} />
        ))}

        {isDragOver && (
          <Box
            sx={{
              height: 60,
              borderRadius: 2,
              border: `2px dashed ${column.color}`,
              opacity: 0.5,
              flexShrink: 0,
            }}
          />
        )}
      </Box>

      <Box sx={{ mt: 1.5 }}>
        {isAddingTask ? (
          <Box>
            <TextField
              autoFocus
              fullWidth
              size="small"
              multiline
              placeholder="Task title..."
              value={newTaskTitle}
              onChange={(e) => {
                setNewTaskTitle(e.target.value);
                setTaskError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddTask();
                }
                if (e.key === 'Escape') {
                  setIsAddingTask(false);
                  setNewTaskTitle('');
                  setTaskError('');
                }
              }}
              sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 14 } }}
              error={!!taskError}
              helperText={taskError}
            />

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim()}
                sx={{ borderRadius: 6 }}
              >
                Add
              </Button>

              <Button
                size="small"
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskTitle('');
                  setTaskError('');
                }}
                sx={{ borderRadius: 6 }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          <Button
            fullWidth
            startIcon={<AddIcon />}
            onClick={() => setIsAddingTask(true)}
            size="small"
            sx={{
              color: 'text.secondary',
              justifyContent: 'flex-start',
              borderRadius: 2,
              py: 0.8,
              '&:hover': {
                backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              },
            }}
          >
            Add task
          </Button>
        )}
      </Box>
    </Box>
  );
});

export { Column };
