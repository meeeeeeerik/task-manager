import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Typography,
  Box,
  InputAdornment,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import { observer } from 'mobx-react-lite';

import { inviteStore } from '../../stores/inviteStore';

interface Props {
  boardId: string;
  open: boolean;
  onClose: () => void;
}

const InviteModal = observer(function InviteModal({ boardId, open, onClose }: Props) {
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!open) {
      setEmail('');
      inviteStore.resetSendState();
    }
  }, [open]);

  async function handleSend() {
    if (!email.trim()) return;
    await inviteStore.sendInvite(boardId, email.trim());
  }

  function handleClose() {
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle fontWeight={800}>Invite to Board</DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Enter the email of a registered user to send them an invitation.
        </Typography>

        {inviteStore.sendError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {inviteStore.sendError}
          </Alert>
        )}

        {inviteStore.sendSuccess && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            Invitation sent! The user will see it in their notifications.
          </Alert>
        )}

        <Box
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !inviteStore.sendSuccess) handleSend();
          }}
        >
          <TextField
            fullWidth
            autoFocus
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              inviteStore.resetSendState();
            }}
            disabled={inviteStore.isSending || inviteStore.sendSuccess}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 0, gap: 1 }}>
        <Button onClick={handleClose} sx={{ borderRadius: 8 }}>
          {inviteStore.sendSuccess ? 'Close' : 'Cancel'}
        </Button>

        {!inviteStore.sendSuccess && (
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={!email.trim() || inviteStore.isSending}
            sx={{ borderRadius: 8 }}
          >
            {inviteStore.isSending ? 'Sending...' : 'Send Invite'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
});

export { InviteModal };
