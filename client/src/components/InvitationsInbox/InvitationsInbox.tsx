import { useState } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  Button,
  Divider,
  Tooltip,
  Avatar,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { observer } from 'mobx-react-lite';

import { inviteStore } from '../../stores/inviteStore';
import { themeStore } from '../../theme';

const InvitationsInbox = observer(function InvitationsInbox() {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const dark = themeStore.isDark;
  const { pending } = inviteStore;

  return (
    <>
      <Tooltip title="Invitations">
        <IconButton onClick={(e) => setAnchor(e.currentTarget)} sx={{ color: 'text.secondary' }}>
          <Badge badgeContent={pending.length} color="error" max={9}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { borderRadius: 3, width: 320, mt: 1 } }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
          }}
        >
          <Typography variant="subtitle2" fontWeight={800}>
            Invitations {pending.length > 0 && `(${pending.length})`}
          </Typography>
        </Box>

        {pending.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 36, color: 'action.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.disabled">
              No pending invitations
            </Typography>
          </Box>
        ) : (
          <Box>
            {pending.map((inv, i) => (
              <Box key={inv.id}>
                {i > 0 && <Divider />}

                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Avatar
                      sx={{ width: 36, height: 36, backgroundColor: inv.boardColor, flexShrink: 0 }}
                    >
                      <DashboardIcon sx={{ fontSize: 18 }} />
                    </Avatar>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700} noWrap>
                        {inv.boardTitle}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        from <strong>{inv.fromUserName}</strong>
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<CheckIcon />}
                      onClick={() => inviteStore.accept(inv.id)}
                      sx={{ borderRadius: 6, flex: 1, fontSize: 12 }}
                    >
                      Accept
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<CloseIcon />}
                      onClick={() => inviteStore.decline(inv.id)}
                      sx={{ borderRadius: 6, flex: 1, fontSize: 12 }}
                    >
                      Decline
                    </Button>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Popover>
    </>
  );
});

export { InvitationsInbox };
