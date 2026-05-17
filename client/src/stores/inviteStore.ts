import { makeAutoObservable, runInAction } from 'mobx';
import { invitationsApi } from '../utils/api';
import type { Invitation } from '../types';

class InviteStore {
  pending: Invitation[] = [];
  isSending = false;
  sendError: string | null = null;
  sendSuccess = false;

  constructor() {
    makeAutoObservable(this);
  }

  get pendingCount() {
    return this.pending.length;
  }

  fetchPending = async () => {
    try {
      const res = await invitationsApi.getAll();
      runInAction(() => {
        this.pending = res.data;
      });
    } catch {
      /* not authenticated yet */
    }
  };

  sendInvite = async (boardId: string, email: string) => {
    this.isSending = true;
    this.sendError = null;
    this.sendSuccess = false;
    try {
      await invitationsApi.send(boardId, email);
      runInAction(() => {
        this.isSending = false;
        this.sendSuccess = true;
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      runInAction(() => {
        this.sendError = msg || 'Failed to send invitation';
        this.isSending = false;
      });
    }
  };

  accept = async (id: string) => {
    await invitationsApi.accept(id);
    runInAction(() => {
      this.pending = this.pending.filter((i) => i.id !== id);
    });
  };

  decline = async (id: string) => {
    await invitationsApi.decline(id);
    runInAction(() => {
      this.pending = this.pending.filter((i) => i.id !== id);
    });
  };

  resetSendState = () => {
    this.sendError = null;
    this.sendSuccess = false;
  };
}

export const inviteStore = new InviteStore();
