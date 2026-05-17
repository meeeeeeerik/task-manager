import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Container,
  IconButton,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { observer } from 'mobx-react-lite';

import { boardStore } from '../../stores/boardStore';
import { themeStore } from '../../theme';
import { Column } from '../../components/Column/Column';
import { TaskModal } from '../../components/TaskModal/TaskModal';
import { FilterBar } from '../../components/FilterBar/FilterBar';
import { InviteModal } from '../../components/InviteModal/InviteModal';

const BoardPage = observer(function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dark = themeStore.isDark;
  const [addingCol, setAddingCol] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const dragTask = useRef<{ taskId: string; fromColId: string } | null>(null);

  useEffect(() => {
    if (id) boardStore.fetchBoard(id);
    return () => {
      boardStore.clearFilters();
    };
  }, [id]);

  function handleDragStart(e: React.DragEvent, taskId: string, fromColId: string) {
    dragTask.current = { taskId, fromColId };
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDrop(e: React.DragEvent, toColId: string) {
    e.preventDefault();
    if (!dragTask.current) return;
    const { taskId, fromColId } = dragTask.current;
    const toCol = boardStore.activeBoard?.columns.find((c) => c.id === toColId);
    const newIndex = toCol?.tasks.length ?? 0;
    boardStore.moveTask(taskId, fromColId, toColId, newIndex);
    dragTask.current = null;
  }

  async function handleAddColumn() {
    if (!newColTitle.trim()) return;
    await boardStore.addColumn(newColTitle.trim(), '#5C6BC0');
    setNewColTitle('');
    setAddingCol(false);
  }

  if (boardStore.isBoardLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const board = boardStore.activeBoard;

  if (!board) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography color="text.secondary">Board not found</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  const columns = boardStore.filteredColumns(board.columns);

  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          borderBottom: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
          backgroundColor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 2,
            flexWrap: 'wrap',
          }}
        >
          <IconButton size="small" onClick={() => navigate('/')} sx={{ color: 'text.secondary' }}>
            <ArrowBackIcon />
          </IconButton>

          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              backgroundColor: board.color,
              flexShrink: 0,
            }}
          />

          <Typography variant="h6" fontWeight={900}>
            {board.title}
          </Typography>

          {board.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: { xs: 'none', md: 'block' } }}
            >
              {board.description}
            </Typography>
          )}

          <Chip
            label={`${board.columns.reduce((s, c) => s + c.tasks.length, 0)} tasks`}
            size="small"
            sx={{ ml: 'auto' }}
          />

          <Button
            startIcon={<AddIcon />}
            size="small"
            variant="contained"
            onClick={() => setAddingCol(true)}
            sx={{ borderRadius: 8, display: { xs: 'none', sm: 'flex' } }}
          >
            Add Column
          </Button>

          <Tooltip title="Add Column">
            <IconButton
              size="small"
              onClick={() => setAddingCol(true)}
              sx={{
                display: { xs: 'flex', sm: 'none' },
                backgroundColor: 'primary.main',
                color: 'white',
                borderRadius: 2,
                p: 0.7,
                '&:hover': { backgroundColor: 'primary.dark' },
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Button
            startIcon={<PersonAddIcon />}
            size="small"
            variant="outlined"
            onClick={() => setInviteOpen(true)}
            sx={{ borderRadius: 8, display: { xs: 'none', sm: 'flex' } }}
          >
            Invite
          </Button>

          <IconButton
            size="small"
            onClick={() => setInviteOpen(true)}
            sx={{ display: { xs: 'flex', sm: 'none' }, color: 'text.secondary' }}
          >
            <PersonAddIcon />
          </IconButton>
        </Box>

        <FilterBar />
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          p: { xs: 2, sm: 3 },
          alignContent: 'flex-start',
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': {
            background: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
            borderRadius: 3,
          },
        }}
      >
        {columns.map((col) => (
          <Column key={col.id} column={col} onDragStart={handleDragStart} onDrop={handleDrop} />
        ))}
      </Box>

      {boardStore.selectedTask && <TaskModal />}

      <Dialog
        open={addingCol}
        onClose={() => {
          setAddingCol(false);
          setNewColTitle('');
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={800}>New Column</DialogTitle>

        <DialogContent sx={{ pt: 1.5 }}>
          <TextField
            autoFocus
            fullWidth
            label="Column title"
            value={newColTitle}
            onChange={(e) => setNewColTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddColumn();
              if (e.key === 'Escape') {
                setAddingCol(false);
                setNewColTitle('');
              }
            }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button
            onClick={() => {
              setAddingCol(false);
              setNewColTitle('');
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleAddColumn}
            disabled={!newColTitle.trim()}
            sx={{ borderRadius: 8 }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <InviteModal boardId={board.id} open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </Box>
  );
});

export { BoardPage };
