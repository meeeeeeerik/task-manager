import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Skeleton,
  Avatar,
  AvatarGroup,
  Tooltip,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import TaskIcon from '@mui/icons-material/Task';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import GroupsIcon from '@mui/icons-material/Groups';
import { observer } from 'mobx-react-lite';

import { boardStore } from '../../stores/boardStore';
import { authStore } from '../../stores/authStore';
import { themeStore, BOARD_COLORS } from '../../theme';
import { Footer } from '../../components/Footer/Footer';

const FEATURES = [
  {
    icon: <DashboardIcon sx={{ fontSize: 32 }} />,
    title: 'Boards & Columns',
    desc: 'Organize projects into boards with customizable columns.',
  },
  {
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 32 }} />,
    title: 'Tasks & Checklists',
    desc: 'Break work into tasks with priorities, labels, and due dates.',
  },
  {
    icon: <GroupsIcon sx={{ fontSize: 32 }} />,
    title: 'Team Collaboration',
    desc: 'Assign tasks to team members and track progress together.',
  },
];

const GuestLanding = observer(function GuestLanding() {
  const navigate = useNavigate();
  const dark = themeStore.isDark;

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
        pb: 0,
      }}
    >
      <Avatar sx={{ bgcolor: 'primary.main', width: 72, height: 72, mb: 3 }}>
        <DashboardIcon sx={{ fontSize: 40 }} />
      </Avatar>

      <Typography variant="h3" fontWeight={900} textAlign="center" gutterBottom>
        Welcome to TaskFlow
      </Typography>

      <Typography
        variant="h6"
        color="text.secondary"
        textAlign="center"
        sx={{ maxWidth: 480, mb: 5 }}
      >
        Organize your work, manage projects and collaborate with your team — all in one place.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/auth')}
          sx={{ borderRadius: 8, px: 4, py: 1.5, fontWeight: 700, fontSize: 16 }}
        >
          Get Started — it's free
        </Button>

        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate('/auth')}
          sx={{ borderRadius: 8, px: 4, py: 1.5, fontWeight: 700, fontSize: 16 }}
        >
          Sign In
        </Button>
      </Box>

      <Grid container spacing={3} maxWidth="md" justifyContent="center">
        {FEATURES.map((f) => (
          <Grid item xs={12} sm={4} key={f.title}>
            <Box
              sx={{
                textAlign: 'center',
                p: 3,
                borderRadius: 3,
                backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                border: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
              }}
            >
              <Box sx={{ color: 'primary.main', mb: 1.5 }}>{f.icon}</Box>

              <Typography variant="subtitle1" fontWeight={800} mb={0.5}>
                {f.title}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {f.desc}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Footer />
    </Box>
  );
});

const Home = observer(function Home() {
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', color: BOARD_COLORS[0] });
  const dark = themeStore.isDark;

  useEffect(() => {
    if (authStore.isAuthenticated) boardStore.fetchBoards();
  }, [authStore.isAuthenticated]);

  if (!authStore.isAuthenticated) return <GuestLanding />;

  async function handleCreate() {
    if (!form.title.trim()) return;
    const id = await boardStore.createBoard(form.title, form.description, form.color);
    setCreateOpen(false);
    setForm({ title: '', description: '', color: BOARD_COLORS[0] });
    navigate(`/board/${id}`);
  }

  return (
    <Box
      sx={{
        py: { xs: 3, sm: 4 },
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      <Container maxWidth="xl" sx={{ flex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 4,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={900}>
              My Boards
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your projects and tasks
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{ borderRadius: 8, px: 3 }}
          >
            New Board
          </Button>
        </Box>

        {boardStore.isLoading ? (
          <Grid container spacing={2}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
        ) : boardStore.boards.length === 0 ? (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <TaskIcon sx={{ fontSize: 80, color: 'action.disabled', mb: 2 }} />

            <Typography variant="h6" color="text.secondary" mb={1}>
              No boards yet
            </Typography>

            <Typography variant="body2" color="text.disabled" mb={3}>
              Create your first board to start organizing tasks
            </Typography>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateOpen(true)}
              sx={{ borderRadius: 8 }}
            >
              Create Board
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {boardStore.boards.map((board) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={board.id}>
                <Card
                  onClick={() => navigate(`/board/${board.id}`)}
                  sx={{
                    cursor: 'pointer',
                    height: 180,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: dark
                        ? '0 16px 40px rgba(0,0,0,0.5)'
                        : '0 16px 40px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <Box sx={{ height: 8, backgroundColor: board.color }} />

                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 80,
                      background: `linear-gradient(135deg, ${board.color}44, transparent)`,
                      pointerEvents: 'none',
                    }}
                  />

                  <CardContent sx={{ pt: 1.5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.3 }}>
                        {board.title}
                      </Typography>

                      {board.ownerId === authStore.user?.id && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            boardStore.deleteBoard(board.id);
                          }}
                          sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      )}
                    </Box>

                    {board.description && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {board.description}
                      </Typography>
                    )}

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                          <TaskIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                          <Typography variant="caption" color="text.secondary">
                            {board.taskCount} tasks
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                          <PeopleIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                          <Typography variant="caption" color="text.secondary">
                            {board.members.length}
                          </Typography>
                        </Box>
                      </Box>

                      <AvatarGroup
                        max={3}
                        sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: 10 } }}
                      >
                        {board.members.map((m) => (
                          <Tooltip key={m.id} title={m.name}>
                            <Avatar src={m.avatar} sx={{ backgroundColor: m.color }}>
                              {m.name[0]}
                            </Avatar>
                          </Tooltip>
                        ))}
                      </AvatarGroup>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={800}>Create New Board</DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Board Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              fullWidth
              autoFocus
            />

            <TextField
              label="Description (optional)"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              fullWidth
              multiline
              rows={2}
            />

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                display="block"
                mb={1}
              >
                Color
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {BOARD_COLORS.map((c) => (
                  <Box
                    key={c}
                    onClick={() => setForm((f) => ({ ...f, color: c }))}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: c,
                      cursor: 'pointer',
                      border: form.color === c ? '3px solid white' : '3px solid transparent',
                      outline: form.color === c ? `2px solid ${c}` : 'none',
                      transition: 'all 0.15s',
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>

          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!form.title.trim()}
            sx={{ borderRadius: 8 }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </Box>
  );
});

export { Home };
