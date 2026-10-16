/**
 * QueueLess — REST API Client (TypeScript)
 * Integrates with Java Spring Boot & Liquibase Database
 */

import { QueueToken, User, QueueLiveStats } from '../types/queue.types';

const API_BASE_URL = 'http://localhost:8080/api';

export class QueueApiService {

  private static isBackendAvailable: boolean | null = null;

  public static async checkBackendHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/database/live-stats`, { method: 'GET', signal: AbortSignal.timeout(1500) });
      this.isBackendAvailable = res.ok;
      return res.ok;
    } catch {
      this.isBackendAvailable = false;
      return false;
    }
  }

  public static async fetchLiveStats(): Promise<QueueLiveStats | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/database/live-stats`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend offline, using reactive client state.', e);
    }
    return null;
  }

  public static async fetchAllTokens(orgId?: string): Promise<QueueToken[]> {
    try {
      const url = orgId ? `${API_BASE_URL}/queue/tokens?organizationId=${orgId}` : `${API_BASE_URL}/queue/tokens`;
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend fetch error, falling back to local state.', e);
    }
    const local = localStorage.getItem('ql_tokens');
    return local ? JSON.parse(local) : [];
  }

  public static async issueToken(data: { userName: string; userPhone: string; serviceId: number; tokenType: string; organizationId?: string }): Promise<QueueToken | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/queue/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const json = await res.json();
        return json.token;
      }
    } catch (e) {
      console.warn('Backend issue token failed, using engine fallback.', e);
    }
    return null;
  }

  public static async callNextToken(counterId: number): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/queue/call-next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ counterId })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend call-next failed.', e);
    }
    return null;
  }

  public static async markNoShow(tokenNumber: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/queue/no-show`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenNumber })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend mark no-show failed.', e);
    }
    return null;
  }
}
