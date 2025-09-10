// ==============================================================================
// 🎯 EVENT BUS - Sistema de Comunicação Entre Dashboards
// ==============================================================================

type EventCallback = (data: any) => void;

interface EventMap {
  // Dashboard events
  'dashboard:data-updated': { type: 'students' | 'programs' | 'assignments'; count: number };
  'dashboard:stats-changed': { role: string; stats: any };
  'dashboard:cache-invalidated': { reason: string };
  'dashboard:error': { error: string; context: string };
  
  // Student events
  'student:created': { student: any };
  'student:updated': { student: any };
  'student:deleted': { studentId: string };
  'student:status-changed': { studentId: string; status: 'active' | 'inactive' };
  
  // Assignment events
  'assignment:created': { assignment: any };
  'assignment:confirmed': { assignmentId: string; studentId: string };
  'assignment:declined': { assignmentId: string; studentId: string; reason?: string };
  'assignment:completed': { assignmentId: string };
  
  // Program events
  'program:created': { program: any };
  'program:published': { programId: string };
  'program:assignments-generated': { programId: string; count: number };
  
  // System events
  'system:online': { timestamp: string };
  'system:offline': { timestamp: string };
  'system:sync-started': { timestamp: string };
  'system:sync-completed': { timestamp: string; itemsUpdated: number };
}

type EventName = keyof EventMap;

class EventBusClass {
  private listeners: Map<EventName, Set<EventCallback>> = new Map();
  private eventHistory: Array<{ event: EventName; data: any; timestamp: string }> = [];
  private maxHistorySize = 50;
  private debugMode = false;

  constructor() {
    // Enable debug mode in development
    this.debugMode = process.env.NODE_ENV === 'development';
  }

  // Subscribe to an event
  on<T extends EventName>(event: T, callback: (data: EventMap[T]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(callback as EventCallback);
    
    if (this.debugMode) {
      console.log(`🎯 EventBus: Subscribed to "${event}"`);
    }
    
    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  // Unsubscribe from an event
  off<T extends EventName>(event: T, callback: (data: EventMap[T]) => void): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback as EventCallback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }
    
    if (this.debugMode) {
      console.log(`🎯 EventBus: Unsubscribed from "${event}"`);
    }
  }

  // Emit an event
  emit<T extends EventName>(event: T, data: EventMap[T]): void {
    const callbacks = this.listeners.get(event);
    const timestamp = new Date().toISOString();
    
    // Add to history
    this.addToHistory(event, data, timestamp);
    
    if (this.debugMode) {
      console.log(`🎯 EventBus: Emitting "${event}"`, data);
    }
    
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`🎯 EventBus: Error in callback for "${event}":`, error);
        }
      });
    }
  }

  // Subscribe to an event only once
  once<T extends EventName>(event: T, callback: (data: EventMap[T]) => void): void {
    const onceCallback = (data: EventMap[T]) => {
      callback(data);
      this.off(event, onceCallback);
    };
    
    this.on(event, onceCallback);
  }

  // Get event history
  getHistory(eventName?: EventName): Array<{ event: EventName; data: any; timestamp: string }> {
    if (eventName) {
      return this.eventHistory.filter(item => item.event === eventName);
    }
    return [...this.eventHistory];
  }

  // Clear event history
  clearHistory(): void {
    this.eventHistory = [];
    if (this.debugMode) {
      console.log('🎯 EventBus: History cleared');
    }
  }

  // Get active listeners count
  getListenersCount(eventName?: EventName): number {
    if (eventName) {
      return this.listeners.get(eventName)?.size || 0;
    }
    
    let total = 0;
    this.listeners.forEach(callbacks => {
      total += callbacks.size;
    });
    return total;
  }

  // Remove all listeners
  removeAllListeners(eventName?: EventName): void {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
    
    if (this.debugMode) {
      console.log(`🎯 EventBus: Removed all listeners${eventName ? ` for "${eventName}"` : ''}`);
    }
  }

  // Debug utilities
  enableDebug(): void {
    this.debugMode = true;
    console.log('🎯 EventBus: Debug mode enabled');
  }

  disableDebug(): void {
    this.debugMode = false;
  }

  // Get current state
  getStats(): {
    totalListeners: number;
    eventTypes: number;
    historySize: number;
    activeEvents: EventName[];
  } {
    return {
      totalListeners: this.getListenersCount(),
      eventTypes: this.listeners.size,
      historySize: this.eventHistory.length,
      activeEvents: Array.from(this.listeners.keys())
    };
  }

  private addToHistory(event: EventName, data: any, timestamp: string): void {
    this.eventHistory.push({ event, data, timestamp });
    
    // Keep history size under control
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }
}

// Create singleton instance
export const EventBus = new EventBusClass();

// React hook for easier usage
import { useEffect, useRef } from 'react';

export function useEventBus<T extends EventName>(
  event: T,
  callback: (data: EventMap[T]) => void,
  deps: any[] = []
) {
  const callbackRef = useRef(callback);
  
  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  useEffect(() => {
    const unsubscribe = EventBus.on(event, (data) => {
      callbackRef.current(data);
    });
    
    return unsubscribe;
  }, [event, ...deps]);
}

// Utility for emitting events from components
export function useEventEmitter() {
  return {
    emit: EventBus.emit.bind(EventBus),
    emitStudentCreated: (student: any) => EventBus.emit('student:created', { student }),
    emitAssignmentConfirmed: (assignmentId: string, studentId: string) => 
      EventBus.emit('assignment:confirmed', { assignmentId, studentId }),
    emitDataUpdated: (type: 'students' | 'programs' | 'assignments', count: number) =>
      EventBus.emit('dashboard:data-updated', { type, count }),
    emitError: (error: string, context: string) =>
      EventBus.emit('dashboard:error', { error, context })
  };
}

export default EventBus;
