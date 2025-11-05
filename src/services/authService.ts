import { auth } from '../config/firebase';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

let currentUser: User | null = null;

/**
 * Listen for auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    currentUser = user;
    callback(user);
  });
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign out
 */
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Sign out (alias for signOutUser)
 */
export { signOutUser as signOut };

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  return currentUser;
}

