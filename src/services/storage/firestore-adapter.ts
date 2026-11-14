import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, Auth } from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import {
  IStorageAdapter,
  StorageMode,
  LearnerProfile,
  Roadmap,
  AssessmentResult,
  AgentFeedEvent,
  AgentMessage,
} from '@/types';
import { PRESET_FULL_STACK_ALEX, getPresetById } from '@/data/presets';

export class FirestoreAdapter implements IStorageAdapter {
  private db: Firestore | null = null;
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private uidPromise: Promise<string> | null = null;
  private initialized = false;

  constructor() {
    this.initFirebase();
  }

  private initFirebase(): void {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!projectId) {
      return;
    }

    try {
      const firebaseConfig = {
        apiKey: apiKey || 'mock-api-key',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
        projectId,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1234567890:web:abcdef',
      };

      this.app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      this.db = getFirestore(this.app);
      this.auth = getAuth(this.app);
      this.initialized = true;
    } catch (err) {
      console.warn('[FirestoreAdapter] Failed to initialize Firebase:', err);
      this.initialized = false;
    }
  }

  /**
   * Anonymous Firebase Auth gives each browser a private uid (persisted by the SDK across reloads).
   * All data lives under learners/{uid}, and Firestore rules only allow a user to touch their own subtree.
   * ponytail: anonymous identity is per-browser; add Google sign-in if cross-device sync is needed.
   */
  private uid(): Promise<string> {
    if (!this.auth) return Promise.reject(new Error('Firebase Auth not initialized'));
    const auth = this.auth;
    this.uidPromise ??= signInAnonymously(auth).then(c => c.user.uid);
    return this.uidPromise;
  }

  public isLiveConnected(): boolean {
    return this.initialized && this.db !== null;
  }

  public getMode(): StorageMode {
    return 'firestore';
  }

  public async getProfile(userId: string): Promise<LearnerProfile | null> {
    if (!this.db) return null;
    try {
      const docRef = doc(this.db, 'learners', await this.uid());
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as LearnerProfile;
      }
      return null;
    } catch (err) {
      console.error(`[FirestoreAdapter] getProfile failed for ${userId}:`, err);
      return null;
    }
  }

  public async saveProfile(profile: LearnerProfile): Promise<void> {
    if (!this.db) return;
    try {
      const docRef = doc(this.db, 'learners', await this.uid());
      await setDoc(docRef, JSON.parse(JSON.stringify(profile)), { merge: true });
    } catch (err) {
      console.error(`[FirestoreAdapter] saveProfile failed for ${profile.id}:`, err);
      throw err;
    }
  }

  public async getRoadmap(userId: string): Promise<Roadmap | null> {
    if (!this.db) return null;
    try {
      const docRef = doc(this.db, 'learners', await this.uid(), 'roadmaps', 'current');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as Roadmap;
      }
      return null;
    } catch (err) {
      console.error(`[FirestoreAdapter] getRoadmap failed for ${userId}:`, err);
      return null;
    }
  }

  public async saveRoadmap(roadmap: Roadmap): Promise<void> {
    if (!this.db) return;
    try {
      const docRef = doc(this.db, 'learners', await this.uid(), 'roadmaps', 'current');
      await setDoc(docRef, JSON.parse(JSON.stringify(roadmap)), { merge: true });
    } catch (err) {
      console.error(`[FirestoreAdapter] saveRoadmap failed for ${roadmap.userId}:`, err);
      throw err;
    }
  }

  public async getAssessments(userId: string): Promise<AssessmentResult[]> {
    if (!this.db) return [];
    try {
      const colRef = collection(this.db, 'learners', await this.uid(), 'assessments');
      const snap = await getDocs(colRef);
      return snap.docs.map(d => d.data() as AssessmentResult);
    } catch (err) {
      console.error(`[FirestoreAdapter] getAssessments failed for ${userId}:`, err);
      return [];
    }
  }

  public async saveAssessmentResult(result: AssessmentResult): Promise<void> {
    if (!this.db) return;
    try {
      const docRef = doc(this.db, 'learners', await this.uid(), 'assessments', result.id);
      await setDoc(docRef, JSON.parse(JSON.stringify(result)), { merge: true });
    } catch (err) {
      console.error(`[FirestoreAdapter] saveAssessmentResult failed:`, err);
      throw err;
    }
  }

  public async getAgentFeed(userId: string): Promise<AgentFeedEvent[]> {
    if (!this.db) return [];
    try {
      const colRef = collection(this.db, 'learners', await this.uid(), 'feedEvents');
      const snap = await getDocs(colRef);
      return snap.docs.map(d => d.data() as AgentFeedEvent);
    } catch (err) {
      console.error(`[FirestoreAdapter] getAgentFeed failed for ${userId}:`, err);
      return [];
    }
  }

  public async appendFeedEvent(event: AgentFeedEvent): Promise<void> {
    if (!this.db) return;
    try {
      const docRef = doc(this.db, 'learners', await this.uid(), 'feedEvents', event.id);
      await setDoc(docRef, JSON.parse(JSON.stringify(event)), { merge: true });
    } catch (err) {
      console.error(`[FirestoreAdapter] appendFeedEvent failed:`, err);
    }
  }

  public async appendAgentMessage(message: AgentMessage): Promise<void> {
    if (!this.db) return;
    try {
      const docRef = doc(this.db, 'learners', await this.uid(), 'messages', message.id);
      await setDoc(docRef, JSON.parse(JSON.stringify(message)), { merge: true });
    } catch (err) {
      console.error(`[FirestoreAdapter] appendAgentMessage failed:`, err);
    }
  }

  public async resetToPreset(presetId: string, userId?: string): Promise<LearnerProfile> {
    const targetUserId = userId || 'alex-chen';
    const preset = getPresetById(presetId) || PRESET_FULL_STACK_ALEX;

    const cloned: LearnerProfile = {
      ...JSON.parse(JSON.stringify(preset)),
      id: targetUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.saveProfile(cloned);
    return cloned;
  }
}
