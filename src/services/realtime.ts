// Real-time synchronization engine using BroadcastChannel & LocalStorage events

const CHANNEL_NAME = 'sincronia_realtime_sync';
let channel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  channel = new BroadcastChannel(CHANNEL_NAME);
}

export type SyncEventPayload = 
  | { type: 'TASK_UPDATED'; projectId: string; taskTitle: string; completed: boolean; userName: string }
  | { type: 'TASK_CREATED'; projectId: string; taskTitle: string; userName: string }
  | { type: 'TASK_DELETED'; projectId: string; taskTitle: string; userName: string }
  | { type: 'PROJECT_CREATED'; projectId: string; projectName: string };

export const broadcastSync = (payload: SyncEventPayload) => {
  // Broadcast to other tabs/windows
  if (channel) {
    channel.postMessage(payload);
  }
  
  // Trigger storage event for fallback listeners
  try {
    localStorage.setItem('sincronia_last_sync', JSON.stringify({
      ...payload,
      _timestamp: Date.now()
    }));
  } catch (e) {
    console.error('Storage sync error:', e);
  }
};

export const subscribeToSync = (callback: (payload: SyncEventPayload) => void) => {
  const handleMessage = (event: MessageEvent<SyncEventPayload>) => {
    callback(event.data);
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === 'sincronia_last_sync' && event.newValue) {
      try {
        const data = JSON.parse(event.newValue);
        callback(data);
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (channel) {
    channel.addEventListener('message', handleMessage);
  }
  window.addEventListener('storage', handleStorage);

  return () => {
    if (channel) {
      channel.removeEventListener('message', handleMessage);
    }
    window.removeEventListener('storage', handleStorage);
  };
};
